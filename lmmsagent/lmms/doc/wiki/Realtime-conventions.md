# Purpose

Give hints on

* how to write your new code real-time safe
* what we need to change in current code to make LMMS realt-time safe

# Motivation

Realtime safety is required to guarantee no lags whenever using LMMS for live performance. There's [an article](http://www.rossbencina.com/code/real-time-audio-programming-101-time-waits-for-nothing) summarizing this very well.

LMMS is not real time safe in 2019 (as opposed to zynaddsubfx or Ardour). Some users don't consider LMMS professional because of this, so it's important to attract developers.

# Terminology

* *audio thread* - thread with high priority, which does the audio computations and must be finished fast
* *UI thread* - thread with normal priority 

# Syscalls

... are calls that give back control to the kernel. Many C and C++ standard library calls are syscalls. Most of them [can not be used](http://www.rossbencina.com/code/real-time-audio-programming-101-time-waits-for-nothing) in audio threads, e.g. `malloc`, `new`, `printf`, `pthread_mutex_lock`, `sleep`... There is also a [whitelist](https://github.com/fundamental/stoat/blob/master/data/whitelist.txt), e.g. `strcmp`, `atoi`, `sinf` are safe.

# Qt Data structures

Don't use Qt data structures that use copy-on-write (e.g. `QVector`, `QString` and [many others](https://doc.qt.io/qt-5/implicit-sharing.html#list-of-classes)). E.g., if you have

```
QVector<int> v2 = v1;
```

in an UI thread, and then start with something like

```
v1[0] = 42;
``` 

in the realtime thread, this can cause an allocation (calling the forbidden `malloc`). Even if you try your best to enforce the copy-on-write in the UI threads, this can not be checked automatically by [stoat](https://github.com/fundamental/stoat). So just don't use those data structures, use `std::vector` etc.

# Thread communication

Mutexes can not be used (see "Syscalls" above), and the audio thread should also never block in general (avoid spinlocks).

This requires more advanced communication mechanisms...

## Single atomic variables

... are the only good way to exchange data between threads.

**Example**: If an audio thread needs a resizable buffer, it can not resize it on it's own (`malloc` and `new` are syscalls). If a UI thread does it, that UI thread should first does the allocation, not interacting in any way with the audio thread. If the new memory is finally returned to the UI thread, it does an atomic exchange of the buffer pointer. The audio thread is not blocked at any time.

As there's often more communication than just 1 pointer between UI and audio threads, take care of atomically writing things that must be read together. Example: You exchange one buffer and a float that normalize it. If a UI thread first exchanges the buffer pointer, then the normalizing float, the audio thread could still have an old buffer pointer and then read the new float. This could lead to playing the buffer with wrong normalizing, in the worst case, playing it too loud. This almost always leeds to...

## Ringbuffers

Ringbuffers can be used to exchange different information through one FIFO channel. The read and write indexes are atomics. For example, this allows a UI thread to first write an audio buffer and the normalizing float into the ringbuffer, and *then* increasing the ringbuffer pointer, letting the audio thread either see "nothing new" or "both at once".

Increasing the atomical ringbuffer pointer is just like exchanging a buffer pointer. So a single atomic variable, like described above, is just a special case of a "size 1 ringbuffer".

If you want to send different things through one ringbuffer, identifiers before the data are often required: `<next is buffer><buffer content><next ist string><string content>`. Those identifiers describing the next content can be simple integers. In zyn, we wanted to make those identifiers usable by external UIs, so we used [OSC](https://en.wikipedia.org/wiki/Open_Sound_Control) strings instead of integers, like `/adsynth/voice0/volume\0<some float value>`.

**Note**: It can be better to copy small buffers into ringbuffers, instead of using pointers. That way, a UI thread can delete its pointer, knowing it's not in use by the audio thread.

A real time safe ringbuffer implementation using atomics can be found in the [ringbuffer repo](https://github.com/JohannesLorenz/ringbuffer), which LMMS uses as a submodule.

## Ringbuffer messages vs direct atomic access

This is often a decision between readability/paradigm (messages) and runtime (direct). Messages can be good when access patterns are sparse or there is non-deterinism in regards to what's available. Direct access can make it more difficult to understand which thread owns which variable and in what order the communications work.

# Checking with stoat

Calls of bad functions can be checked using [stoat](https://github.com/fundamental/stoat):

* Prepare stoat once:
  - `git clone git@github.com:JohannesLorenz/stoat.git -b johannes-fixes` (note, you can probably now take the official fundamtenal/stoat, since the required patches have been merged there. it must be tested though)
  - `mkdir build && cd build && cmake -DCMAKE_C_COMPILER=clang -DCMAKE_CXX_COMPILER=clang++ ..`
  - `make` and then `make test`.
* Mark any function from LMMS that must meet realtime requirements with `__attribute__((annotate("realtime")))` (right before the semicolon of the declaration). Good candidates are e.g.
  - `EffectName::processAudioBuffer()` to check a single effect
  - `AudioJack::staticProcessCallback()` to check the whole core (run with Jack)
* `mkdir build-stoat && cd build-stoat` (you may have one for gcc or clang already, but the next one will be incompatible)
* `cmake -DCMAKE_C_COMPILER=/path/to/your/stoat/repo/stoat-compile -DCMAKE_CXX_COMPILER=/path/to/your/stoat/repo/stoat-compile++ ..` (if you only want to check one plugin, combine this with `-DPLUGIN_LIST=<name of dir in plugin/ folder>`, e.g. `-DPLUGIN_LIST=SpectrumAnalyzer`). *Note*: If you entered the wrong compiler, you must remove the build directory and start over.
* `make -j <cores>`
* `touch whitelist2.txt`
* `/path/to/your/stoat/repo/stoat -l /path/to/your/stoat/repo/build/libstoat.so -w whitelist2.txt -r ..`. The `-l` just gives stoat its libary. The `-w` tells stoat that all functions in `whitelist2.txt` are assumed realtime safe and shall not produce warnings. The `-r .` just tells it to scan your whole build dir.
* Now for every error, you have different choices:
  - If the function marked as "unsafe" should be safe (for Qt classe, check e.g. the Qt sources), add it to your whitelist
  - If the function marked as "unsafe" can be unsafe, rewrite the code.
* If you are finished with 0 errors, your code should be realtime safe in the sense of not calling any bad functions (only assuming you don't use non-direct-connected signals/slots). Keep your whitelist file, it will be needed later. Maybe it is worth to add some of the files to the [stoat](https://github.com/fundamental/stoat) project, or at least to LMMS.


# Other minor things that only need to be done ONCE

* [Use mlockall](https://github.com/zynaddsubfx/zynaddsubfx/commit/b5f6a4049a4b9daaacdcc9861f94c2be0d658a58) once in LMMS to keep all memory resident
* Alsa + Jack: Give [real time priority to all audio worker threads](https://github.com/LMMS/lmms/issues/5065) (currently, only 1 thread has it)