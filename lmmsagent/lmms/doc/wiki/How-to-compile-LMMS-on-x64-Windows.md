x64 GUI instructions:

Things to know before we get started:
You will need Visual Studio 15 2017 for this to work, if you have a higher version, you'll need to downgrade.
You can get Visual Studio here: https://visualstudio.microsoft.com/downloads/

You will also need Qt, you can get that here: https://www.qt.io/download
(When installing it will ask you what else you want to download, select everything with C++ in it)
(Sidenote: this requires (from my experience) 50 gb of free space)

You will also need CMake: https://cmake.org/download/
(when it asks you, make sure you check 'Make desktop shortcut')

You also need Git: https://git-scm.com/

1. Make a folder in an accessible place and name it to something you'll remember, this is where are compiled LMMS is going to go.
(For the sake of this guide, We're going to call this our 'Build' folder)

2. In your build folder, create a new folder, we'll call this our 'clone' folder.

3. Again, create a new folder in your build folder, we'll call this our 'compile' folder.

4. Get vcpkg from 'https://github.com/Microsoft/vcpkg'

5. Extract vcpkg and put it in the build folder

6. Open Command Line

7. Go to the vcpkg folder using cd <file>

8. Type '.\bootstrap-vcpkg.bat' into command line, this makes vcpkg compile itself.

9. Once that's done, type '.\vcpkg install fftw3 libsamplerate libsndfile sdl2 --triplet x64-windows' into the command line.

10. Go to your build folder where you put the vcpkg folder in, and create a new folder, we will call this our 'clone' folder

11. Go back to the Command Line and CD to the clone folder. 

12. Type this in the Command Line: 'git clone --recursive -b master https://github.com/lmms/lmms'

13. Open CMake GUI

14. At the top, click 'Browse Source'

15. Find your clone folder, open it, open the lmms folder inside, and click Okay.

16. Next, click 'Browse Build' then select your compile folder, then click Okay.

17. Then click on 'Configure', now this is where all the important stuff is, you can only set these once, so be careful.

18. Set your generator as 'Visual Studio 15 2017'

19. In the 'Optional platform for generator' dropdown, choose x64

20. At the bottom, click 'Specify toolchain for cross-compiling' and hit finish.

21. In the window that appears, click Open, and go to your build folder, next open the vcpkg folder, and go to 'scripts/buildsystems/vcpkg.cmake' 

22. Click Okay, and then your project will configure, this will take some time, so get some coffee and sit back.

	22.1: If you get an error here, you need to set up the Qt5_DIR

	22.2: Above the compile buttons, you should see some red text

	22.3: Scroll down until you find the box that says Qt5_DIR

		22.35: If you don't have one, create one

	22.4: Click the empty space to the left of it and set it to [qt5 install dir]/msvc2017_64/lib/cmake/Qt5

	22.5: Go to next step

23. Once configuring is done, click Generate, at this point you might wanna get another cup of coffee.

24. Once that is done, you can then click Open Project, This will open it in Visual Studio.

25. You should see a popup with a dropdown that says 'Development Settings', Change that to Visual C++

26. When Visual Studio is open, press CTRL+Shift+B

Now here's where the fun starts:

27. Go to [qt5][version]/msvc2017_64/plugins/platforms/bin/dir

28. Select all of those files and copy them to [build]/[compile]/lmms/Debug

29. Go to [build]/[vcpkg]/installed/x64-windows/bin

29. Copy SDL2.dll to [build]/[compile]/lmms/Debug

30. You also need to get the data folder from your clone/lmms folder

31. You will also need to copy the platforms folder from [qt5]/[version]/msvc2017_64/plugins

32. To get also the plugins: Copy all DLL files in [build]/plugins/Debug to [build]/debug/plugins.

You should now be fully set up to use your compiled LMMS! I recommend doing a test build by going into Visual Studio, and pressing CTRL+Shift+B

Happy coding!

Video:
[Link](https://www.youtube.com/watch?v=UIKGc4ezVGk)


(Thanks to Dom and justnope on the LMMS discord for helping me figure this out, Without them I'd still be trying to figure this out)




