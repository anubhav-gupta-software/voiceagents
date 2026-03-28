## Background
 * Steps are provided for [Ubuntu](#ubuntu-cross-compile) and [Windows](#windows-msvc)

## Contents
 * [**Cross-compiling on Ubuntu-based systems**](#ubuntu-cross-compile)
    * [Setup Ubuntu PPA Mirrors](#setup-ppa)
    * [Installing Dependencies](#mingw-dependencies)
 * [**Cross-compiling on Arch-based systems**](#arch-cross-compile)
 * [**Compiling on Windows using MSVC**](#windows-msvc)
    * [Prerequisites](#prerequisites)
    * [Installing Dependencies](#installing-dependencies)
    * [Compile using Qt Creator](#compile-using-qt-creator)
    * [Compile using the command line](#compile-using-the-command-line)

<br><!-- End Section--><br>

## Ubuntu Cross Compile
Configure a `mingw-w64` cross-compilation environment for building Windows binaries in Ubuntu.

### Setup PPA
```bash
# For Ubuntu 18.04 "Bionic"
sudo add-apt-repository ppa:tobydox/mingw-w64
sudo apt-get update

# For Ubuntu 14.04 "Trusty"
sudo add-apt-repository ppa:tobydox/mingw-x-trusty
sudo apt-get update
```

### Mingw Dependencies
```bash
# For Ubuntu 18.04 "Bionic"
sudo apt-get install git cmake sdl-mingw-w64 sdl2-mingw-w64 libvorbis-mingw-w64 lame-mingw-w64 \
fluidsynth-mingw-w64 stk-mingw-w64 glib2-mingw-w64 portaudio-mingw-w64 \
libsndfile-mingw-w64 fftw-mingw-w64 flac-mingw-w64 fltk-mingw-w64 \
libgig-mingw-w64 libsamplerate-mingw-w64 libz-mingw-w64-dev \
binutils-mingw-w64 gcc-mingw-w64 libsoundio-mingw-w64 \
qt5base-mingw-w64 gcc-mingw-w64-i686 nsis qttools5-dev-tools \
g++-mingw-w64-x86-64 g++-mingw-w64-i686 mingw-w64-tools libxml-parser-perl liblist-moreutils-perl

# For Ubuntu 14.04 "Trusty"
sudo apt-get install git cmake mingw64-x-sdl mingw64-x-libvorbis mingw64-x-lame \
mingw64-x-fluidsynth mingw64-x-stk mingw64-x-glib2 mingw64-x-portaudio \
mingw64-x-libsndfile mingw64-x-fftw mingw64-x-flac mingw64-x-fltk \
mingw64-x-libgig mingw64-x-libsamplerate mingw64-x-pkgconfig \
mingw64-x-binutils mingw64-x-gcc mingw64-x-runtime mingw64-x-libsoundio \
mingw64-x-qt5base mingw32-x-gcc mingw32-x-qt5base nsis qt4-linguist-tools
```

<details>
<summary>Click for 32-bit dependencies</summary>

### 32-bit
```bash
# For Ubuntu 18.04 "Bionic"
Sorry, 32-bit instructions are not available for 18.04

# For Ubuntu 14.04 "Trusty"
sudo apt-get install git cmake mingw32-x-sdl mingw32-x-libvorbis mingw32-x-lame \
mingw32-x-fluidsynth mingw32-x-stk mingw32-x-glib2 mingw32-x-portaudio \
mingw32-x-libsndfile mingw32-x-fftw mingw32-x-flac mingw32-x-fltk \
mingw32-x-libgig mingw32-x-libsamplerate mingw32-x-pkgconfig \
mingw32-x-binutils mingw32-x-gcc mingw32-x-runtime mingw32-x-qt5base \
nsis qt4-linguist-tools
```
</details>

## Arch Cross Compile
```bash
yay -S mingw-w64-sdl2 mingw-w64-libvorbis mingw-w64-lame \
mingw-w64-fluidsynth mingw-w64-glib2 mingw-w64-portaudio \
 mingw-w64-libsndfile mingw-w64-fftw mingw-w64-flac \ 
mingw-w64-fltk mingw-w64-libsamplerate \ 
mingw-w64-libsoundio mingw-w64-gcc mingw-w64-binutils \ 
nsis mingw-w64-tools
```

### Configure the build to use mingw
```bash
git clone https://github.com/lmms/lmms
cd lmms
mkdir build
cd build
../cmake/build_win64.sh
```

### Create a Windows desktop installer
```bash
make -j4 package
```

... see more compiling options [here](https://github.com/LMMS/lmms/wiki/Compiling#compiling).

## Windows MSVC
Warning, MSVC building is still experimental.  Some plugins aren't available when compiling with MSVC.

Use the `master` branch, MSVC is not supported on `stable-1.2`.

```bat
git clone -b master https://github.com/LMMS/lmms.git
```

### Prerequisites

1. Install Visual Studio Community (if you don't already have it) from here: https://www.visualstudio.com/downloads/
    * Make sure to download the `Desktop Development with C++` tools. If you already have Visual Studio downloaded, you can 'modify' it with the Visual Studio Installer.
2. Install Qt Open Source version from here: https://www.qt.io/download.
    * Follow the installer and create a free account if you do not have one already.
    * When you get to the 'Select Components' stage, select version 5.15.2 and just select 'MSVC 2019 64-bit' and 'MSVC 2019 32-bit'.
         * If you only want to build for 32-bit, you can just select the 32-bit option.
         * If you want to build for 64-bit, you need to also install the 32-bit package as well to support 32-bit VSTs.
    * Expand the 'Developer and Designer Tools' section and unselect 'CMake 64-bit' (we will install this manually in the next step) and 'Ninja' (this comes by default with Visual Studio). Only 'Qt Creator CDB Debugger Support' and 'Debugging Tools for Windows' should be left selected, along with the mandatory 'Qt Creator'.
3. Install CMake from here: https://cmake.org/download/
    * This is included in visual studio, do we really need to download it here as well...?
4. Install Git (if you don't already have it) from here: https://git-scm.com/download/win

### Installing dependencies

1. Install Vcpkg:
   ```bat
   git clone https://github.com/Microsoft/vcpkg
   cd vcpkg
   .\bootstrap-vcpkg.bat
   ```
2. Install LMMS dependencies using Vcpkg:
   ```
   .\vcpkg install fftw3 libsamplerate libsndfile lilv lv2 sdl2
   ```
   If targeting 64bit, add the option `--triplet x64-windows`.

### Compile using Qt Creator

Skip to the [next section](#compile-using-the-command-line) if you want to use the command line instead.

1. Open up Qt Creator
2. Go to <kbd>Tools</kbd>-><kbd>Options</kbd>->`Build & Run`->`Kits`. Qt Creator should have detected your Qt installation automatically. We need to make adjustments to it so that CMake finds the libraries installed using Vcpkg. Select the detected kit and click <kbd>Change...</kbd> next to "CMake configuration":

   ![](https://user-images.githubusercontent.com/2879917/41245398-36be3486-6da8-11e8-96b9-8ca98b227404.png)

3. Assuming Vcpkg is installed at `C:\vcpkg`, add `;C:\vcpkg\installed\x64-windows` to the line starting with `CMAKE_PREFIX_PATH`:

   ![](https://user-images.githubusercontent.com/2879917/41245528-86437dfe-6da8-11e8-9a10-4c1d898dfbf9.png)

4. Exit the options and open `CMakeLists.txt`.

### Compile using the command line

Configure using CMake. This assumes you are using MSVC2017, installed Qt 5.9.5 MSVC 2015 64bit & 32bit using the default path and installed Vcpkg to `C:\vcpkg`. Change paths accordingly.

```bat
cd lmms
mkdir build
cd build
cmake .. -DCMAKE_PREFIX_PATH=C:\Qt\5.9.5\msvc2015_64 -DCMAKE_TOOLCHAIN_FILE=C:\vcpkg\scripts\buildsystems\vcpkg.cmake -DCMAKE_GENERATOR="Visual Studio 15 2017 Win64"
```
If you've build and installed qt5 in vcpkg, you don't need to specify CMAKE_PREFIX_PATH. CMake will find the version inside vcpkg

If configuring succeeded, compile using
```bat
cmake --build . --config Release
```
### Compile using MSVC IDE
If you completed the first cmake command in the section above, it will have also created lmms.sln in your build directory. 
 
By default when you generate an msvc solution file, cmake will be configured for release. This means the release version of the libraries in vcpkg will be used even if you choose debug in visual studio. You can use a utility like cmake-gui to change the build type from release to debug and then configure and generate again.

You can also use cmake-gui to create the initial solution file. When you configure for the first time, select your compiler and select the option: Select toolchain file for cross-compiling. The file you should be using is `<vcpkg-install-path>\scripts\buildsystems\vcpkg.cmake`

Alternately, Visual Studio should automatically detect that you are running a CMAKE project if you open the root LMMS folder. You will however need to set the QT path in `CMakeSettings.json`. This can easily be managed by right clicking on `CMakeSettings.json` and selecting `Edit CMake Settings`. Then scroll down to the `Qt5_DIR` variable and browser for the QT installation folder, then go into the version you have downloaded and navigate to `msvc2019_64/lib/cmake`. You will also need to set the locations for the libraries you downloaded through vcpkg, which can be found in the `packages` folder of wherever you installed vcpkg.

**Note:** Visual Studio can be very strange, and sometimes you may have to do some fudging around with saving the CMakeSettings.json file, cleaning, rebuilding, restarting visual studio etc to get lmms building…

If you have [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10) installed, you can use the Linux commands instead.

**NOTE: You have to type `bash` into Command Prompt in order to use Linux commands.**

## Windows MSYS
⚠️ Warning: This tutorial is very outdated and is left here for reference only.
Configure a `mingw-w64` environment in Windows using [`msys2`](https://msys2.github.io/) from Start Menu.

<details>
<summary>I know what I'm doing, show the tutorial</summary>


### Setup Shell

Setup a unix-like shell environment using [`msys2`](https://msys2.github.io/)

First, [download](https://msys2.github.io/), install and launch msys2 from Start Menu (or manually from `msys2_shell.cmd`).

**Important** The msys2 mirrors have reliability problems and this causes packages to fail during download.  At any time setting up dependencies if an error occurs, try the command again.  For longer tasks, [scroll up and look for them](https://cloud.githubusercontent.com/assets/6345473/25561734/60bd3132-2d40-11e7-975b-5723a218b0f7.png).

```bash
# From msys2 desktop application, fetch all available packages
pacman -Sy

# Update essential utilities
pacman --needed -S bash pacman pacman-mirrors msys2-runtime

# Restart msys2 (mandatory)
```

### Setup Basic Build Environment
Using `msys2` from Start Menu

```bash
# Fetch list of outdated packages.
# If this errors out, follow instructions carefully and try again.
pacman -Su

# "Errors occurred, no packages were upgraded" is normal, just try again

# Download and install the 32-bit and 64-bit toolchains (about 85MB)
pacman -S mingw-w64-x86_64-gcc mingw-w64-i686-gcc

# Download and install dependencies (about 1.6GB, 8.2GB installed)
pacman -S git mingw-w64-x86_64-pkg-config make cmake wget p7zip gzip tar binutils mingw-w64-x86_64-qt4 mingw-w64-i686-qt4 gdb diffutils perl-List-MoreUtils perl-XML-Parser

```
Qt5 hasn't been tested and will likely cause problems but can be provided by installing `mingw-w64-x86_64-qt5 mingw-w64-i686-qt5` instead of qt4 packages.

**Qt5 egg**
```
# Download and install dependencies (about 1.6GB, 8.2GB installed)
pacman -S git mingw-w64-x86_64-pkg-config make cmake wget p7zip gzip tar binutils mingw-w64-x86_64-qt5 mingw-w64-i686-qt5 gdb diffutils perl-List-MoreUtils perl-XML-Parser
```

### Setup Remaining Dependencies
Using `Mingw-w64` from Start Menu (or manually via `mingw64.exe`).  

**Important** The following commands **won't work** from msys2 console.  It needs to be mingw!

```bash
# Delete any old helper scripts
rm -f msys_helper.sh

# Download latest msys_helper.sh helper script from master
wget https://raw.githubusercontent.com/lmms/lmms/master/cmake/msys/msys_helper.sh --no-check-certificate

# Run the helper script. This will automatically:
# - Download/extract/install the Ubuntu mingw ppa (400MB)
# - Download/compile any conflicting libraries
# - Configure git for use with msys
./msys_helper.sh

# "cp: cannot create regular file" is normal, please ignore

# There will be warnings during library compilations, please ignore
```

### Setup Additional Workarounds
From `cmd.exe`, as Administrator
```bash
# Create symlinks, moc.exe work-around
# - Adjust paths if msys2 was installed in non-standard location
mklink /d %SystemDrive%\mingw64 %SystemDrive%\msys64\mingw64
mklink /d %SystemDrive%\mingw32 %SystemDrive%\msys64\mingw32
mklink /d %SystemDrive%\home %SystemDrive%\msys64\home
```

&nbsp;&nbsp;&nbsp;&nbsp;...done installing?  Next, [clone the source code](Compiling#clone-source-code)
<br><!-- End Section--><br>

If you have [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10) installed, you can use the Linux commands instead.

**NOTE: You have to type `bash` into Command Prompt in order to use Linux commands.**

</details>


## Troubleshooting

&nbsp;&nbsp;&nbsp;...nothing here yet, want to [add something](dependencies-Windows/_edit)?