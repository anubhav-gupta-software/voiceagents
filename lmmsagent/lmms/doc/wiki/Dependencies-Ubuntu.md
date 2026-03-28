**Note:** For cross-compiling Windows binaries on Linux, please see [Windows Dependencies](dependencies-windows) instead.

```bash
sudo apt install build-essential cmake libsndfile1-dev libfftw3-dev \
libvorbis-dev libogg-dev libmp3lame-dev libasound2-dev libjack-jackd2-dev \
libsamplerate0-dev libsdl-dev libstk0-dev stk libfluidsynth-dev portaudio19-dev \
libfltk1.3-dev libxinerama-dev libxft-dev libgig-dev git perl libxml2-utils \
libxml-perl liblist-moreutils-perl qtbase5-dev qtbase5-private-dev \
qttools5-dev-tools qttools5-dev libqt5x11extras5-dev libx11-xcb-dev libxcb-keysyms1-dev libxcb-util0-dev

# keywords: Unknown command PKG_GET_VARIABLE
```

**Replace cmake with cmake3 for Ubuntu 14.04.**

### Lv2

Required packages: `lv2-dev liblilv-dev`

### VST
Install libraries for VST support
```bash
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install gcc-multilib g++-multilib libqt5x11extras5-dev \
libxcb-util0-dev libxcb-keysyms1-dev

sudo apt install wine-stable libwine-dev libwine-dev:i386 # for Ubuntu >= 17.10
sudo apt install wine-dev # for Ubuntu <= 17.04

# note: It is also possible to use wine-(stable, devel, or staging)
# and corresponding development package from WineHQ repository
# note: When building on Ubuntu >= 17.10, make sure either wine64-tools or wine32-tools is installed

# keywords: winegcc: g++ failed
# keywords: fatal error: bits/c++config.h: No such file or directory
# keywords: winegcc: File does not exist: /usr/lib/i386/wine/libwinecrt0.a
```

### Carla

Install libraries for [Carla](http://kxstudio.linuxaudio.org/Applications:Carla) support (Ubuntu 14.04 provided as example)
```bash
sudo add-apt-repository -y ppa:kxstudio-debian/libs
sudo add-apt-repository -y ppa:kxstudio-debian/apps
sudo apt update
sudo apt install -y carla
```

 * Don't forget to install libraries for VST support [here](#vst) and Carla support [here](#carla)

&nbsp;&nbsp;&nbsp;&nbsp;...done installing?  Next, [clone the source code](Compiling#clone-source-code)
<br><!-- End Section--><br>

## Troubleshooting

### Unmet dependencies
Sometimes `apt` will not allow all packages to be installed simultaneously. (e.g. `foo : Depends: bar (=1.0.0) but it is not going to be installed`).  Install them or resolve dependencies individually.
```bash
sudo apt install libfluidsynth-dev
sudo apt install libjack-jackd2-dev

# keywords: The following packages have unmet dependencies
```

This can also happen if you already have Jack1 installed on your system, and you're trying to install Jack2 development files. You should try installing Jack1 dev files instead:
```bash
sudo apt install libjack-dev

# keywords: The following packages have unmet dependencies
```

Both Jack1 and Jack2 work fine with LMMS, for differences between the two [please consult the Jackaudio wiki.](https://github.com/jackaudio/jackaudio.github.com/wiki/Q_difference_jack1_jack2)

### qmake
If `qmake --version` shows an error:
```bash
sudo apt install qt5-default

# keywords: qmake: could not find a Qt installation of ''
```


### ia32-libs
Older environments may complain that `ia32-libs` package has been removed.  See [this page](http://askubuntu.com/a/107249/412004) for more information.
```bash
sudo apt install wine32

# keywords: ia32-libs package has been removed
```

### Using `build-dep`

If you are unable to build LMMS after following the steps above, you may want to try `apt-get`'s `build-dep` command.

This command will install required dependencies for a package.

For Ubuntu:

1. Edit `/etc/apt/sources.list`, and uncomment any `deb-src` entries.
2. `sudo apt update`
3. `sudo apt build-dep lmms`

For Linux Mint:

1. Open "Software Sources".
2. Flip the "Source code repositories" switch in the Official Repositories tab.
3. Update the apt cache when prompted.
4. Run `sudo apt build-dep lmms`.

__Remember to comment out `deb-src` entries in `/etc/apt/sources.list` when you are finished, or all subsequent `apt update` commands will take twice as long__ 