## Project Compression
* *What's the compression format used to compress projects?* `qCompress` (`libz`).
* *How to decompressing projects using lmms?* Use `lmms -d inputfile.mmpz > output.mmp`
* *How do I decompress a project using a 3rd party language, such as php?* See [here](https://gist.github.com/tresf/e5d4f1edb5a93b36f779359eb44b008a).

## Artwork Corrupted
* *I have LMMS installed successfully. Why does the artwork display artifacts?* You may have an older LMMS theme selected in the settings. Themes cannot be used between releases.  A `1.0.x` theme will not work with `1.1.x`, etc.
* *How do I reset the LMMS theme?* By renaming `~/.lmmsrc.xml` or setting the theme to blank using Preferences, Directories, Theme Directory.  See also issue [#1187](../issues/1187).

## Source Code
* *After a pull, I end up with a modified submodule ('Changes not staged for commit'). What does this mean?* Someone updated a submodule and then committed an LMMS commit with the submodule updated. When you pulled that LMMS commit, it showed you that a new version of the submodule must be used, but you still have to manually update the submodule: Use `git submodule update --init --recursive`
* *What is the currently used C++ standard?* C++14 with minor exceptions (some 3rd party libs or plugins may use older standards). If you commit code, it must be C++14 compatible, and it must also pass our whole CI.
* *I have Lv2 plugin XYZ installed. Why can LMMS not load it?* We currently do not support all extensions. Restart LMMS with environment variable `LMMS_LV2_DEBUG=1` set and watch out for messages about plugin XYZ.