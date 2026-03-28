### Anonymous Git

Assuming you have git installed, you first have to get a copy of the Git
repository:

	git clone --recursive https://github.com/LMMS/lmms.git

This will clone the master branch, which can be unstable and have bugs.

If you wish to switch to the current stable branch (for the purpose of compiling LMMS by yourself):

	cd lmms
	git checkout stable-1.2

For instructions on how to compile LMMS, visit [[Compiling]].

If you want to update your copy simply type

	git remote update
	git pull
	git submodule update --init --recursive

inside lmms-directory. The first step usually can be omitted.

### Browse Git code

For browsing the Git repository easily you can also use the [Git Web
interface](https://github.com/LMMS/lmms).


### Fast forward your branch

Assuming you've already cloned your branch to your computer using:

```bash
$ git clone -b master http://github.com/my_personal_repository/lmms
$ cd lmms
```

Add an upstream remote by doing:

```bash
$ git remote add upstream https://github.com/LMMS/lmms.git
```

To sync a personal `master` based branch with the upstream `master` branch:

```bash
$ git pull --rebase upstream master
```

This simply pulls everything from the upstream master branch and if there
are changes in the currently selected local branch, they get applied on
top of upstream. Bear in mind, if you do that after you've already
pushed to your github repo, you'll have to do a forced push next time
`(push -f)` or git will complain about non-fast-forwards.

```bash
$ git push
```

The script for `stable-x.x` is the same, just replace `master` with
`stable-x.x`. The only thing to be careful about here is to always run the
correct branch name or you'll risk totally messing up your local branch...
but as long as you keep track of where your changes are headed towards,
you should be fine.