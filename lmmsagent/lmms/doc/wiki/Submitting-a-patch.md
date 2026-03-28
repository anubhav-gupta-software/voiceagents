The common way to contribute code to a project on GitHub is by forking it and creating a pull request after the changes are done. This is the workflow we recommend. 

If you don't have a GitHub account and don't want to sign up either, you may just create a patch file and send it to us. Follow the instructions at the very [bottom of this page](#Patch) on how to do this.

## Using GitHub

### 1. Initial setup (must be done only once)

#### 1.1 Install Git
First of all, you need to install Git. You can see the download link/instructions on the [Git homepage](https://git-scm.com/download).

#### 1.2 Fork the official LMMS repository
Fork LMMS by clicking [here](https://github.com/LMMS/lmms/fork) if you haven't done it yet. 
After you have done that, clone your newly created fork and configure remotes by running:
```sh
# Clone your repo into the subdirectory "lmms"
$ git clone https://github.com/yourusername/lmms.git
# Switch to the new source root directory
$ cd lmms
# Add upstream repository for later updates
$ git remote add upstream https://github.com/LMMS/lmms.git
```
For more information on how to fork LMMS, see the GitHub help article [Fork A Repo](https://help.github.com/articles/fork-a-repo).  
Having forked LMMS and cloned it to your hard drive, you can start working on the code.

<a name="push" />
### 2. Pushing your changes to GitHub 
After you made your changes and implemented your ideas, it's about time to push them to your git repository.
For doing this, you may use the command line, as it's explained below, or use `git gui` to open a graphical user interface, which can make things a lot easier if you're uncomfortable with the command line.

#### 2.1 Reviewing your changes
You can list all changed files by running
```sh
$ git status
```
inside the source root directory. A more detailed view on what exactly has been changed is provided by
```sh
$ git diff
```

#### 2.2 Staging and committing
The next step is to stage the changes you've made. To stage a file, run
```sh
$ git add FILENAME
```

After that, you have to commit your staged changes. To do so, run
```sh
$ git commit
```
You'll be asked to enter a commit message to summarize what you did. Finally, push your commit:
```sh
$ git push origin
```

### 3. Contributing your changes

Pull requests request the admins to pull from your branch. For more help, read [this GitHub article](https://help.github.com/articles/using-pull-requests).

You need to do these steps:
* Go to your fork's GitHub site
* Click on *Pull Requests*
* Hit *New pull request*
* Check whether the diffs make sense
* Click on *Click here to create a pull request for this comparison*
* Click on *Send pull request*

<a name="update"></a>
### 4. Pull in upstream changes
Later on, if you want to make another commit, you must first (preferably before making changes) rebase your fork on the upstream, i.e. sync it with the main LMMS repository. You can do this with the commands:

```sh
$ git fetch upstream # Fetches new changes without modifying your files
$ git rebase upstream/stable-1.2 # Replace stable-1.2 with the branch you're targeting (e.g. master)
```

## Using only a patch file <a name="Patch"></a>
To have your changes applied without using GitHub, create a patch file containing your changes by running
```sh
$ git diff > my-patch-for-lmms.diff
```
in the source root directory. Now you have a patch file we can easily apply. Just [contact us](https://github.com/LMMS/lmms/wiki#contact-us) about it.
