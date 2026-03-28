## Obtaining a Debug Build

If you experience a problem or crash while using LMMS, the first step to debugging this is to obtain a development build that includes debug symbols. This can be done by following the instructions at [Compiling LMMS](https://github.com/LMMS/lmms/wiki/Compiling) and making sure to specify the following flag when running cmake.

```
-DCMAKE_BUILD_TYPE=Debug
```

or 

```
-DCMAKE_BUILD_TYPE=RelWithDebInfo
``` 

## Debugging with gdb (GNU Debugger)

First, obtain the gdb binary. This is usually as simple as `# apt-get install gdb` or similar.

After installing the development build locally into a `../target` folder, `cd ../target/bin` and run `gdb ./lmms` in a terminal. This will leave you with a prompt that looks something like this:
```
Reading symbols from ./lmms...done.
(gdb) 
```

### Debugging an AppImage
In the event a crash only occurs from a Linux AppImage:

1. Run `./lmms-x.x.x.AppImage --appimage-extract`
2. Run `export LD_LIBRARY_PATH="$(pwd -P)/squashfs-root/usr/lib:$LD_LIBRARY_PATH"`
3. Run `gdb squashfs-root/usr/bin/lmms.real` (an optionally second parameter is the path to a core dump)
4. Type `set sysroot ./squasfs-root` and then `set solib-search-path ./squashfs-root/usr/lib`
5. If not working with a core dump, type `run` to run LMMS and reproduce a crash.
6. Type `thread apply all bt full` to get full backtrace of all threads.

### Using gdb

A concise tutorial/reference for how to use gdb can be found [here](http://www.unknownroad.com/rtfm/gdbtut/), but if you just want to cut straight to getting useful debug info for a problem, the general procedure looks like this:
```
(gdb) run
Starting program: /home/user/lmms/build-debug-gcc/install/usr/local/bin/lmms
[lmms output]
```
(i.e. type 'run' into the prompt and hit enter.)

Then reproduce the problem in lmms, and at the debugging console, you should get a message like:
```
Program received signal SIGSEGV, Segmentation fault.
0x0000000000000000 in [method name] ()
(gdb) 
```

Generally, the most useful bit of debugging information you can obtain here is a stack trace, which illustrates the exact code path the program took that led to the crash. To do that, type 'backtrace' at the prompt and hit enter.

```
(gdb) backtrace
#0  0x0000000000000000 in ?? ()
#1  0x00007ffff6929ea3 in QObject::~QObject() () from /usr/lib/x86_64-linux-gnu/libQtCore.so.4
#2  0x000000000062eea4 in Engine::~Engine (this=0xa12d2d0, __in_chrg=<optimized out>) at /home/user/lmms/build-debug-gcc/src/../../include/Engine.h:45
#3  0x00007fffc06e4ab9 in NulEngine::~NulEngine (this=0xa12d2a0, __in_chrg=<optimized out>, __vtt_parm=<optimized out>)
    at /home/user/lmms/plugins/ZynAddSubFx/zynaddsubfx/src/Nio/NulEngine.cpp:76
#4  0x00007fffc06949d7 in LocalZynAddSubFx::~LocalZynAddSubFx (this=0xa12d0d0, __in_chrg=<optimized out>) at /home/user/lmms/plugins/ZynAddSubFx/LocalZynAddSubFx.cpp:92
#5  0x00007fffc022fbfa in ZynAddSubFxInstrument::~ZynAddSubFxInstrument (this=0x7fffec9cb960, __in_chrg=<optimized out>) at /home/user/lmms/plugins/ZynAddSubFx/ZynAddSubFx.cpp:150
#6  0x00007fffc022fda9 in ZynAddSubFxInstrument::~ZynAddSubFxInstrument (this=0x7fffec9cb960, __in_chrg=<optimized out>) at /home/user/lmms/plugins/ZynAddSubFx/ZynAddSubFx.cpp:155
#7  0x000000000060a2c3 in InstrumentTrack::~InstrumentTrack (this=0x7fffec9c9520, __in_chrg=<optimized out>) at /home/user/lmms/src/tracks/InstrumentTrack.cpp:162
[...]
```

From here, you can either open a text editor and look at the code surrounding the areas mentioned in the stack trace to see what the issue may be, or you can copy+paste the entire back trace and share it on the issue tracker.

If your error is that lmms hangs *without* crashing (i.e. it becomes "unresponsive" to mouse presses or key presses), you can open the debugging console once lmms hangs and press `ctrl+c` to pause execution. Then enter "thread apply all backtrace" into the gdb prompt to get a back trace for *all* of the running threads (as it's usually more than just one thread that's responsible for a hang).

## Debugging with Valgrind

Another useful tool for debugging is a memory error detector called [valgrind](http://valgrind.org/). As with gdb, this can usually be obtained through your system's package manager, if you have one, e.g. `# apt-get install valgrind`.

Whereas gdb is great for showing you exactly where a crash occurs and allows for inspecting the value of each variable at that point, Valgrind is more helpful in finding the things that might have led up to the error, such as forgetting to initialize a variable or attempting to free a piece of memory that's already been freed.

The basic usage of valgrind is pretty simple. Just `cd ../target/bin` and run `valgrind ./lmms`. lmms will run noticeably slower -- this is not an error but is merely due to all the extra computations Valgrind is doing behind the scenes.

After reproducing your error in lmms, you'll hopefully see at least some output in Valgrind, for example:
```
==5158== Conditional jump or move depends on uninitialised value(s)
==5158==    at 0x7D4886D: ??? (in /usr/lib/x86_64-linux-gnu/libsndfile.so.1.0.25)
==5158==    by 0x53F24C: SampleBuffer::decodeSampleSF(char const*, float*&, unsigned char&, unsigned int&) (SampleBuffer.cpp:397)
==5158==    by 0x53EB75: SampleBuffer::update(bool) (SampleBuffer.cpp:223)
==5158==    by 0x54194E: SampleBuffer::setReversed(bool) (SampleBuffer.cpp:1409)
==5158==    by 0x230734C9: audioFileProcessor::reverseModelChanged() (audio_file_processor.cpp:344)
==5158==    by 0x2307B8F8: audioFileProcessor::qt_static_metacall(QObject*, QMetaObject::Call, int, void**) (moc_audio_file_processor.cxx:68)
==5158==    by 0x61321EB: QMetaObject::activate(QObject*, QMetaObject const*, int, void**) (in /usr/lib/x86_64-linux-gnu/libQtCore.so.4.8.6)
==5158==    by 0x626D74: Model::dataChanged() (moc_Model.cpp:102)
==5158==    by 0x4D73EC: AutomatableModel::setValue(float) (AutomatableModel.cpp:233)
==5158==    by 0x4D8438: AutomatableModel::setInitValue(float) (AutomatableModel.cpp:619)
==5158==    by 0x4D71E2: AutomatableModel::loadSettings(QDomElement const&, QString const&) (AutomatableModel.cpp:199)
==5158==    by 0x2307303E: audioFileProcessor::loadSettings(QDomElement const&) (audio_file_processor.cpp:267)
==5158== 
```

This info can be used in a similar way as the backtrace obtained in gdb and is worth including in bug reports, if possible/relevant.

If Valgrind crashes while launching LMMS, try adding `--smc-check=all --error-limit=no` flags. Qt internally uses a JIT engine, so `--smc-check=all` flag is required to not break it. `--error-limit=no` flag prevents Valgrind from not printing real errors after flooding error messages from JIT.