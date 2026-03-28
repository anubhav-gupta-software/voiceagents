If you'd like to help develop LMMS, you've come to the right place. This guide gives an overview of the steps involved in contributing to LMMS's development, and links to useful resources for each step of the way.

### The process

#### 0. Get connected
In the **#devtalk** channel on the [LMMS Discord](https://discord.gg/PruNxpG), you can ask questions or discuss things related to LMMS' development.

#### 1. Decide what you'd like to work on
Whether it's a feature or a bug fix, you'll need to know exactly how you want to improve LMMS.
  * There's lots of [existing issues](https://github.com/lmms/lmms/issues) to choose from, and some of them are [good for beginners](https://github.com/lmms/lmms/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).
   * If you know what area of LMMS you want to work on, you can check if there's a relevant [meta issue](https://github.com/lmms/lmms/issues?q=is%3Aissue+is%3Aopen+label%3Ameta) and pick something from there.
  * If you've have something specific in mind and there's no existing issue for it, you can follow [this guide](https://github.com/LMMS/lmms/wiki/Reporting-Issues) and open an issue yourself.

#### 2. Build your own copy of LMMS
In order to try out the changes you make, you'll want a local copy of LMMS's source code that you build yourself.
  * Decide which branch you'll work on. This can be tricky, so ask on **#devtalk** if you're unsure. At time of writing, master branch is the best choice.
  * [Compile your working branch](https://github.com/LMMS/lmms/wiki/Compiling).

#### 3. Set up your IDE
In order to get started with coding, you need to set up an environment suitable for LMMS development.
* Virtualizing a Linux instance:
  * Windows is often used on a daily basis, but building LMMS on Windows is not very smooth.
  * To solve this, we need to get a virtual instance of **Linux** running, in a virtual machine software, such as **Oracle’s VirtualBox**.
  * Here are some points to note while using a virtual machine:
    * Often virtual machine tutorials recommend too little disk space. We recommend at least **30GB** for a smooth developing experience.
    * VBox has a useful dynamic disk space option, which you may make use of if you don’t want to set a hard limit.
    * Your clipboard will most probably not work between your host and guest, so here are some workarounds to that problem:
      * Use a common email account. You may mail code snippets or text to and fro, and use them in the host/guest as you need.
      * Another workaround may be to set up a shared folder, and copy/paste with a text file in that shared folder.
* Setting up the IDE:
  * This is optional, as you may use something as simple as vim or gedit and the terminal for working with and building the code.
  * A full guide on common IDEs is pending.


#### 4. Familiarize yourself with the relevant code
Now it's time to find the part of LMMS' code relevant to your improvement.
  * As for the code itself:
    * Our internal effects and instrument plugins are found in [lmms/plugins](https://github.com/LMMS/lmms/tree/master/plugins).
    * GUI stuff is in [src/gui](https://github.com/LMMS/lmms/tree/master/src/gui).
      * Piano roll and the other editors are in, you guessed it, [src/gui/editors](https://github.com/LMMS/lmms/tree/master/src/gui/editors).
    * You can try looking at [merged pull requests](https://github.com/LMMS/lmms/pulls?utf8=%E2%9C%93&q=is%3Apr+is%3Amerged) to see what files are changed for what kind of feature.
      * For example, [adding ghost notes](https://github.com/LMMS/lmms/pull/4575) involved a lot of [changes in PianoRoll.cpp and MidiClip.cpp](https://github.com/LMMS/lmms/pull/4575/files).
  * In addition, we have some wiki pages about how parts of the code work:
    * [LMMS Architecture](https://github.com/LMMS/lmms/wiki/LMMS-Architecture) for a general overview.
    * [Plugin development](https://github.com/LMMS/lmms/wiki/Plugin-development) for development of instruments or effects.
    * [Automation Internals](https://github.com/LMMS/lmms/wiki/Automation-Internals) for automation improvements.

#### 5. Implement your improvement
Finally, get to work!
  * Your changes should follow the [LMMS coding conventions](https://github.com/LMMS/lmms/wiki/Coding-conventions).
    * This includes writing good comments for:
      * Any non-trivial members you add (in [Doxygen format](http://www.doxygen.nl/manual/docblocks.html))
      * Parts of your code that may be hard for others to understand
      * Existing code you had to figure out while working on your PR
  * If appropriate, add [unit tests](https://github.com/LMMS/lmms/wiki/Unit-testing).

#### 6. Check your code
Check the following points to make your review pass:
  * Run the existing [unit tests](https://github.com/LMMS/lmms/wiki/Unit-testing) and make sure they pass: `make tests && tests/tests`.
  * Make manual tests for everything your code may have affected
    * Does the new solution work?
    * Is no old functionality destroyed?
  * Double check that you followed the [coding conventions](https://github.com/LMMS/lmms/wiki/Coding-conventions)?
    * Spaces after `if`, `else`, `for`, `while` and `switch` are often forgotten. A quick check: `git diff <base-version> | grep -v '^-' | grep '[^A-Za-z]\(if\|else\|for\|while\|switch\)('`
    * Another common mistake: `{` and `}` should be alone in their code line, unless the block is closed in the same line: ` git diff <base-version> | grep '{' | grep -v '\${' | grep -v '^-' | grep -v '^+\?[[:space:]]*{[[:space:]]*$' | grep -v '^[^{}]*{[^{}]*}[^{}]*$'`
  * If you want your PR to be be merged via a merge commit, clean up all commits with `git rebase -i`. 
    * Commits that won't compile or that fixed previous commits should be squashed.
    * *Commit messages will be visible even after merge*. Change any uninformative commit messages into something significant!

#### 7. Create a pull request ("PR") and wait for reviews
Once your changes work on your local copy, it's time to share them.
  * [Create a PR](https://github.com/LMMS/lmms/wiki/Submitting-a-patch).
  * Investigate CI failures on the PR webpage.
  * Label your PR if you have permission:
    * As long as it's not ready for review, use "in progress" label or create a PR as draft.
    * When ready for review, label as "needs code review" and "needs style review"
  * Your changes will be reviewed according to [this guide](https://github.com/LMMS/lmms/wiki/Reviewing-Pull-Requests). If you'd like this step to be faster, you can help out by reviewing other's PRs!

#### 8. Celebrate!
Actually, you might get a few comments about things you have to change first. Even so, you've come a long way, so give yourself a pat on the back! Once any issues with your pull request are worked out, it can be merged and LMMS will be better for it :)
