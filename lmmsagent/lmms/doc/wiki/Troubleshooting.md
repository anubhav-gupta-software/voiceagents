# Troubleshooting
[Windows](#windows) | [Linux](#linux) | [MacOS](#macos)

Troubleshooting guide for running LMMS on various platforms.  You may also ask in our `#support` channel on [Discord](https://lmms.io/chat).  For development questions, please see our [compiling](compiling) page(s) instead.

## Windows

### Clean Install

 * Reboot your computer (ensures no instances of `lmms.exe` are already running)
   * Additionally you may terminate the following running processes: `lmms.exe`, `RemoteZynAddSubFx.exe`, `RemoteVstPlugin.exe`, `RemoteVstPlugin32.exe` 
 * Uninstall LMMS from Control Panel
 * Locate `C:\Program Files\LMMS\` if present, remove it (if paranoid, move it to your desktop).
 * If you have a `C:\Program Files (x86)\LMMS`, remove it (again, if paranoid, move it instead).
 * Locate `%USERPROFILE%\.lmmsrc.xml`, remove it (again, if paranoid, move it instead)
 * Reinstall LMMS
 
### Sound Driver Conflicts
 * Drivers are the most common cause of crashes on startup.
 * First attempt to disable the sound devices through Device Manager and enable them one-by-one.
 * Second, download the latest sound driver from your sound card (from PC manufacturer website, or directly from the sound card manufacturer.)
   * **Note:** Some HDMI sound devices use video drivers from NVIDIA/AMD(ATI)/Intel.
 * If this doesn't help, force removal of the 3rd party driver and use the one provided by Microsoft.  This is how:
   1.  Open Device Manager
   2.  Expand Sound and Game controllers 
   3.  Locate your sound card, Right Click, Uninstall Device
   4.  Click the Checkbox that says "Remove driver software for this device"
   5.  Reboot
   6.  Windows should automatically search for a sound driver.  This will take a few minutes.
   7.  Windows should install a sound driver from Windows updates.  Once finished, reboot if needed.
   8.  If Windows could not located a sound driver, visit the manufacturer website and manually download a sound driver for your computer, install the sound driver manually, reboot if needed.
   9.  Try LMMS again. 
* If this doesn't help, try replacing the [`libportaudio-2.dll`  in your installation directory with a recompiled one](https://github.com/LMMS/lmms/issues/451#issuecomment-37773385).

### SDL Interface Override
(courtesy of [darkill, 2011](https://lmms.io/forum/viewtopic.php?f=3&t=283))
1. From Windows, run `dxdiag`
2. Select the desired audio interface, e.g. "Sound 1"
3. In the "Drivers" section, find the driver name, e.g. "USBAUDIO.sys"

   ![image](https://user-images.githubusercontent.com/6345473/43925361-121b260e-9bf5-11e8-8c2c-3146e9fd5c11.png)
   <br>**Note:** You may choose to look for "Default Device: Yes" in the "Devices" section to send to your default interface

4. Type this value into the Settings Dialog, Audio Settings, SDL section.

   ![image](https://user-images.githubusercontent.com/6345473/43925260-d0a5b694-9bf4-11e8-89ad-e1ee1e8e7be9.png)

5. Click OK.  Restart LMMS.  If this did not fix the problem, try another audio interface and repeat.

### SSD Worn Bits
* Some solid-state hard drives suffer a condition known as ["worn bits"](https://github.com/LMMS/lmms/issues/3488#issuecomment-292051362). 
 The vendor disk utility or running `chkdsk /f` as administration should help. 

If LMMS is fixed, great.  If it doesn't, search for Qt conflicts:

### Qt Conflicts
 * Search your computer for any files named `Qt*.dll` (Windows + F, Qt*.dll, wait for it to finish).
   * Take special note of any DLLs that may be in your `PATH`, such as `C:\Windows`, `C:\Windows\System32`, etc.  You may need to delete them manually or uninstall the application associated with them.
   * Ignore those found in `%APPDATA%` or `Program Files`, they're generally safe.  Watch out for those installed in `C:\Windows` or `C:\Windows\System32`


If that doesn't work you can ask in our `#support` channel on [Discord](https://lmms.io/chat).

## Linux

* VSTs GUI does not display
   * Try to launch using `LIBGL_ALWAYS_SOFTWARE=1`.  See also [#5323](https://github.com/LMMS/lmms/issues/5323)


## MacOS
Sorry, there's nothing here yet!  Please help by [contributing](https://lmms.io/get-involved/) or ask in our `#support` channel on [Discord](https://lmms.io/chat).

