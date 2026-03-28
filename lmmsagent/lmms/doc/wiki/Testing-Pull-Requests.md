# Testing Pull Requests
One of the most important issues when it comes to accepting pull request is making sure it has no regressions. Since LMMS is cross platform, it is simply not possible for the developer to test all different configurations before sending the pull request. 

That's where you come in, if you want to help to make LMMS more stable and speed-up the development, you can join our testing and QA team. 

## Requirements: 
* Have a working computer with internet access
(No need to build anything, we have everything ready :smile:)

# What to do? 
Look for pull requests with the "[needs testing](https://github.com/LMMS/lmms/pulls?q=is%3Apr+is%3Aopen+label%3A%22needs+testing%22)" label. Look for @lmmsbot's comment, download and install lmms according to your OS and begin testing!

### What's testing?
Currently, we don't have a defined set of tests every code should pass. However, we will try to define it here. Until then, in addition to the tests below, try using it like usual and look for strange responses / bugs / crashes. 


### Found something? 
Great! That's one less undiscovered bug in lmms. Now post a comment explaining what is the bug, what is your platform, and what to do to reproduce the problem.  

# Tests list
 * Load a project file (TODO: attach a complex project file), make sure it plays corrects, and saves correctly. 
 * Try to randomly change knobs and values while the track is playing and look for crashes. 
 * Create a new automation track, and try to connect a few models. 
 * Export the project into an audio file and make sure was exported properly. 
 * Poke at things relevant to the PR.
 * Add your ideas here.   