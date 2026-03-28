The development process used by LMMS is such that improvements are coded and then submitted as individual "pull requests" (PRs) where they are reviewed before being added to the official LMMS codebase.

What gets reviewed
------

The main things that must be reviewed before merging a pull request are:

1. *Does the new code follow all of the LMMS' [coding conventions](https://github.com/LMMS/lmms/wiki/Coding-conventions) and is it easy to understand?*

2. *Does the pull request do what it claims to do?* The description of the PR should explain its purpose - what bugs it fixes and/or what new features it provides. This step entails compiling and launching the code in the PR and verifying each claim in the description.

3. *Does the PR cause any regressions?* Inevitably, implementing one improvement may break previously-working functionaly, or introduce a new bug elsewhere. The easiest way to check for this is to take a glance at the files modified in the PR and re-test the primary functionality associated with each one. For example, if the PR significantly alters the `Song.cpp` file, it's worth testing that it's still possible to open, play, and export a song.

**Note**: It is not necessary that one reviewer do all these steps - it may be more practical for somebody with little experience of the LMMS codebase to skip step 1, while somebody on-the-go or without much time on their hands can still contribute by only doing step 1 and skipping the others. 

After doing some review, leave a comment on the PR stating your results, e.g. "The code looks fine" (for step 1), or "Tested and the PR does what it claims to; doesn't break any related functionality" (step 2 and 3).

How to review
------

Step 1 can be done online by navigating to the pull request's page and looking under either the "commits" or the "files changed" tab.

For steps 2 and 3, you need to get a build of the new code. There's two ways to do that:
 
### Using the LmmsBot builds
 
On pull requests with recent commits, the LmmsBot typically leaves a comment with a link to builds for various architectures and operating systems. You can download the build, and use it for the testing. On Windows, you will have to install the build.
 
_Note:_ If a commit has been made a few minutes back, the LmmsBot will probably not have the build updated with the latest code yet. So make sure to download the builds from it after it says "edited a few minutes ago".
 
### Building the code yourself
 
The usual way to do this is to first [clone the official LMMS repository](https://github.com/LMMS/lmms/wiki/Accessing-git-repository) (only needs to be done once). The following steps differ based on the details of the pull request - I will use [#2252](https://github.com/LMMS/lmms/pull/2252) as an example.

#### Fetching the code

At the top of the pull request will be a line worded something like "[User] wants to merge 15 commits into LMMS:master from [User]:[Branch]", e.g. "Wallacoloo wants to merge 15 commits into LMMS:master from Wallacoloo:osc-qmessagebox". The part to note is "[User]:[Branch]", which specifies the owner of the pull request, and the branch in which they put their changes. In the same folder in which you cloned the LMMS repository, execute the following command:
```sh
git remote add [User] https://github.com/[User]/lmms.git
git fetch [User]
```
e.g. `git remote add Wallacoloo https://github.com/Wallacoloo/lmms.git && git fetch Wallacoloo`.

Then checkout the specific branch that they placed their code in:
```sh
git checkout [User]/[Branch]
```
e.g. `git checkout Wallacoloo/osc-qmessagebox`

#### Rebasing

If the pull request is relatively recent (2~7 days old), this step can be skipped. Otherwise, it's possible that the LMMS codebase has changed enough to where the PR might not be stable when merged into it. Running the following commands will make sure you're testing the code as it will be once the PR is merged:
```sh
git fetch origin master
git rebase master
```

#### Compiling
Follow the instructions on [this](https://github.com/LMMS/lmms/wiki/Compiling-lmms) wiki page, and then you can run `./lmms` and test the changes made in the pull request.
