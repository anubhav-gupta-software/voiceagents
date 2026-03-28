```bash
sudo zypper install git libsamplerate-devel fftw3-devel libsndfile-devel \
portaudio-devel libSDL-devel libpulse-devel libjack-devel \
libstdc++-devel-32bit libstdc++48-devel-32bit libstdc++6-devel-gcc6 \
libstdc++6-devel-gcc6-32bit gcc-32bit gcc-c++-32bit glibc-devel-32bit fluidsynth \
libvorbis-devel libmp3lame-devel fluidsynth-devel libgig-devel \
wine wine-devel wine-devel-32bit xcb-util-keysyms-devel xcb-util-devel \
fltk-devel libQt5Core-devel libqt5-qttools libqt5-qttools-devel \
libqt5-qtbase-private-headers-devel libqt5-qtx11extras-devel
```

* `portaudio-devel` `libSDL-devel` `libpulse-devel` `libjack-devel` are audio backends.  Can be safely omitted if needed.
* `libvorbis-devel` `libmp3lame-devel` are for export and can be safely omitted if needed.
* `libportaudio-devel` was renamed `portaudio-devel` in newer versions.
* The old tutorial mentioned `libstdc++48-devel-32bit`, `libstdc++6-devel-gcc6-32bit` and `libstdc++6-devel-gcc6-32bit`, `gcc48-32bit` but Tumbleweed no longer requires them.


&nbsp;&nbsp;&nbsp;&nbsp;...done installing?  Next, [clone the source code](Compiling#clone-source-code)
<br><!-- End Section--><br>

You will also need the perl `List::MoreUtils` module which can be installed with cpan, or with the zypper `perl-List-MoreUtils` package. perl-List-MoreUtils will pull in perl-Exporter-Tiny and perl-List-MoreUtils-XS.

## Troubleshooting
&nbsp;&nbsp;&nbsp;...nothing here yet, want to [add something](dependencies-opensuse/_edit)?