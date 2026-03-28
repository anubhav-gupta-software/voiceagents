Warning, MSVC building is still experimental. Use with caution. Most plugins aren't available when compiling with MSVC.

Compiling LMMS with MSVC is most easily done using [Vcpkg](https://github.com/Microsoft/vcpkg).

# Installing dependencies

1. Install Visual Studio Community from here: https://www.visualstudio.com/downloads/
2. Install Qt Open Source version from here: https://www.qt.io/download
   Select the newest Qt version for MSVC 2017 or MSVC 2015, installing Qt Creator is recommended. If you want to build for 64bit, make sure to install Qt 32bit as well to support 32bit VSTs. Because Qt doesn't offer any 32bit binaries for MSVC 2017, you'll have to install Qt for MSVC 2015 instead. This is fine as MSVC 2017 can safely link against binaries compiled with MSVC 2015.
3. Install CMake from here: https://cmake.org/download/
4. Installl Git
5. Install Vcpkg:
   ```bat
   git clone https://github.com/Microsoft/vcpkg
   cd vcpkg
   .\bootstrap-vcpkg.bat
   ```
6. Install remaining dependencies using Vcpkg:
   ```
   vcpkg install fftw3 libsamplerate libsndfile lilv lv2 sdl2
   ```
   If targeting 64bit, add the option `--triplet x64-windows`.

# Clone source code

Use the `master` branch, MSVC is not supported on `stable-1.2`.

```bat
git clone -b master https://github.com/LMMS/lmms.git
```

# Compile using Qt Creator

Skip to the [next section](#compile-using-the-command-line) if you want to use the command line instead.

1. Open up Qt Creator
2. Go to <kbd>Tools</kbd>-><kbd>Options</kbd>->`Build & Run`->`Kits`. Qt Creator should have detected your Qt installation automatically. We need to make adjustments to it so that CMake finds the libraries installed using Vcpkg. Select the detected kit and click <kbd>Change...</kbd> next to "CMake configuration":

   ![](https://user-images.githubusercontent.com/2879917/41245398-36be3486-6da8-11e8-96b9-8ca98b227404.png)

3. Assuming Vcpkg is installed at `C:\vcpkg`, add `;C:\vcpkg\installed\x64-windows` to the line starting with `CMAKE_PREFIX_PATH`:

   ![](https://user-images.githubusercontent.com/2879917/41245528-86437dfe-6da8-11e8-9a10-4c1d898dfbf9.png)

4. Exit the options and open `CMakeLists.txt`.

# Compile using the command line

Configure using CMake. This assumes you are using MSVC2017, installed Qt 5.9.5 MSVC 2015 64bit & 32bit using the default path and installed Vcpkg to `C:\vcpkg`. Change paths accordingly.

```bat
cd lmms
mkdir build
cd build
cmake .. -DCMAKE_PREFIX_PATH=C:\Qt\5.9.5\msvc2015_64;C:\vcpkg\installed\x64-windows -DCMAKE_GENERATOR="Visual Studio 15 2017 Win64"
```

If configuring succeeded, compile using
```bat
cmake --build . --config Release
```