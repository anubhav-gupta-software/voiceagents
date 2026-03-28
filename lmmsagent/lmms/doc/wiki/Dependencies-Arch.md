```bash
sudo pacman -S git cmake gcc qt5-base qt5-tools qt5-x11extras libsndfile fftw libvorbis lame \
libsamplerate libogg wine stk fluidsynth fltk libgig carla jack2 sdl alsa-lib portaudio \
perl-list-moreutils perl-exporter-tiny perl-xml-parser
```
&nbsp;&nbsp;&nbsp;&nbsp;...done installing?  Next, [clone the source code](Compiling#clone-source-code)
<br><!-- End Section--><br>


## Troubleshooting
If `pacman` complains it can't find wine, you should [Enable the `multilib` repository](https://wiki.archlinux.org/index.php/official_repositories#Enabling_multilib).

Please feel free to [add something](Dependencies-Arch/_edit)!