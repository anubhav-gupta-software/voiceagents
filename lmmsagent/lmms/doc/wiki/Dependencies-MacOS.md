## Xcode

* [`Xcode>=4.6.3`](http://stackoverflow.com/a/10335943/3196753)* is required for compilation.
   > \* If recently upgraded OS make sure your XCode isn't outdated by running `open -a XCode`, or via [Applications](https://cloud.githubusercontent.com/assets/6345473/13099744/670d5dfa-d503-11e5-85c3-ad2c99e55c2d.png).

* Xcode Command Line Utilities* must be activated.
   ```bash
   sudo xcode-select --install
   sudo xcodebuild -license
   ```
   > \*Alternately via Applications, Xcode, Xcode Preferences menu, Downloads tab, Command Line Tools, Install.  Or if that's missing, hunt down the installer [from Apple Downloads](https://developer.apple.com/download/more/?=Command%20Line%20Tools%20%28OS%20X%20Mountain%20Lion%29).

## Homebrew
* [Homebrew](https://brew.sh/)* or an equivelent package manager is required for fetching [libraries](Compiling#libraries)
   ```bash
   ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
   ```
   > \*Alternately, you may use [MacPorts](https://macports.org/) instead.

   ```bash
   brew install git cmake pkgconfig fftw libogg libvorbis lame libsndfile libsamplerate jack \
   fluid-synth sdl libgig libsoundio stk portaudio node fltk qt5 glib
   ```

   And the dmg packaging utility
   ```bash
   npm install -g appdmg
   ```

&nbsp;&nbsp;&nbsp;&nbsp;...done installing?  Next, [clone the source code](Compiling#clone-source-code)
<br><!-- End Section--><br>

<details>
<summary>Building on macOS 10.8</summary>

**Note:** This section is for macOS 10.8 only. 

### 10.8 Custom Steps
   ```bash
   sudo mv /usr/bin/git /usr/bin/git.old && sudo ln -s /usr/local/bin/git /usr/bin/git # TLS1.0 was highest the OS provided, use brew version instead
   brew reinstall --build-from-source https://gist.githubusercontent.com/tresf/9b87883886f691d0e6711f8c71d362a4/raw/stk.rb
   brew reinstall --build-from-source https://raw.githubusercontent.com/Homebrew/homebrew-core/9e2b257db3d24c9e5bd7ce2248746688f7e3f6e9/Formula/cmake.rb
   brew reinstall --build-from-source https://raw.githubusercontent.com/tresf/homebrew-core/2f6bd4138f9af6b26b5bcb066f944c9491fb106d/Formula/node.rb
   brew reinstall --build-from-source https://gist.githubusercontent.com/tresf/c9260c43270abd4ce66ff40359588435/raw/650aa94f29e698b76991ed4db94cd9f0188cb7ef/fluid-synth.rb --ignore-dependencies --env=std
   brew reinstall --build-from-source https://gist.githubusercontent.com/tresf/43549a998aafef79433d82659abc1922/raw/281b0e295ad29e743bcf3fe2139193976759b809/libgig.rb
   brew reinstall --build-from-source https://gist.githubusercontent.com/tresf/9b87883886f691d0e6711f8c71d362a4/raw/7ac73754fdeab0ab7243b540c2ca66f272043871/stk.rb
   brew reinstall --build-from-source qt@5.5 # this will take a long, long time
   ```

Then apply some manual patches

   ```bash
   # Install ThreadLocal.h
   curl -O https://raw.githubusercontent.com/wang-bin/ThreadLocal/master/ThreadLocal.h
   mv ThreadLocal.h ~/lmms/include

   # Patch MemoryManager.cpp
   curl -O https://gist.githubusercontent.com/tresf/36aec89c18f4c7f5d4ebe7805db70d53/raw/51520dee2134b55692d499e753297a29923f1873/MemoryManager.cpp.diff
   patch ~/lmms/src/core/MemoryManager.cpp MemoryManager.cpp.diff

   # Patch rpmalloc.c
   cd src/3rdparty/rpmalloc/rpmalloc
   # Force to the last version compatible with this compiler
   git reset --hard 1.3.0 # 1.3.1 introduced C++11 atomics which aren't compatible with this version of Clang
   curl -O https://gist.githubusercontent.com/tresf/ad797cb09259bff388d8e9beb939a080/raw/88182a0d174d706c006f6b7417c5e6a1c6882fe9/rpmalloc.c.diff
   patch ~/lmms/src/3rdparty/rpmalloc/rpmalloc/rpmalloc/rpmalloc.c rpmalloc.c.diff
   ```

</details>

&nbsp;&nbsp;&nbsp;&nbsp;...done installing?  Next, [clone the source code](Compiling#clone-source-code)
<br><!-- End Section--><br>

## Troubleshooting

### Namespace Errors
> ```diff
> - include/QtCore/qglobal.h:675:70: error: no template named 'is_arithmetic_v' in namespace 'std'; did you mean 'is_arithmetic'?
> ```

Check to make sure only `qt5` is installed, the build system may be getting headers from another Qt version.


### Library Loading Issues
   ```bash
   export DYLD_PRINT_LIBRARIES=1
   /Applications/LMMS.app/Contents/MacOS/lmms  # or build/LMMS.app/Contents/MacOS/lmms
   ```

&nbsp;&nbsp;&nbsp;...want to [add something](/LMMS/lmms/wiki/Dependencies-MacOS/_edit)?

