This page is being used to collect ideas and proposals for GSoC 2020 projects.

**Important: If you change the URL of this file, you must change the link in the GSoC dashboard**

## General info

### Requirements

The GSoC student must
* use Discord for communicating with the team.
* have/create a github.com account.

### Preparation

* Check our [coding conventions](https://github.com/LMMS/lmms/wiki/Coding-conventions)
* Join our LMMS discord channel and say hello (you'll find it on [our website](https://lmms.io/))
* You can try solving an easy task from our [issue list](https://github.com/LMMS/lmms/issues) (e.g. one of the "[good first issues](https://github.com/LMMS/lmms/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)")

## Project: Make LMMS realtime-safe

**Description**

LMMS is an audio sequencer. When a program computes audio, runtime is crucial, and "realtime safety" is desired, which means the audio is being delivered in time to the soundcard, with low latency. Every X ms you must deliver some output - having a system that's fast is great, but having a system that's consistent is more important, non-realtime programming focuses on total system throughput, but for a realtime system it's the worst case behavior that's important as users will care about any time the timing requirement is violated, not just the average number of times.

Control systems are a great way of illustrating the task, e.g. if you have a system that controls a car's airbags it *must* be able to respond to input within a given window of time, not just usually respond.

Historically, not everything in LMMS is realtime safe. A couple of C/C++ functions or operators can not guarantee realtime-safety and must not be called. There is a tool "[stoat](https://github.com/fundamental/stoat)" that has a whitelist of allowed functions and thus finds all potentially dangerous functions in LMMS. Calls to such functions must be replaced with realtime safe code. There are [different techniques](https://github.com/LMMS/lmms/wiki/Realtime-conventions), which include

* Replacing allocations by fixed size arrays or allocators in other threads
* Replacing mutexes by atomics
* Replacing more difficult data exchange between threads by ringbuffers

For more detailed information, see e.g. [this article from Ross Bencina](http://www.rossbencina.com/code/real-time-audio-programming-101-time-waits-for-nothing). 

When speaking of LMMS, we currently mean the LMMS core, i.e. everything except the plugins. Making all plugins realtime safe can be a bonus task, but is not required and it seems unlikely that many plugins can be made realtime safe in the given time.

**Preparation** Aside from the "general" preparation above, you can try to get stoat run on LMMS and start to reduce errors building a custom whitelist.

**Expected outcome** A stoat run of 0 errors for the core.

**Software required** Discord (to communicate with the team)

**Skills preferred** C/C++, git

**Possible mentors** [`@JohannesLorenz`](https://github.com/JohannesLorenz) (Johannes Lorenz), [`@PhysSong`](https://github.com/PhysSong) (Hyunjin Song)

**Difficulty** Moderate

**Type** Real time programming


## Add more projects here
