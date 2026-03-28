Lv2 is supported on master.

## Requirements

### Arch Linux

`pacman -S lilv lv2`

### MacOs (HomeBrew)

`brew install lilv lv2`

### Ubuntu

For compiling: `lv2-dev liblilv-dev`

### Windows

From the directory containing vcpkg:
```
.\vcpkg install lilv lv2
```

If you get an error about missing ports, you may need to update vcpkg first:
```
git pull
.\bootstrap-vcpkg.bat
```

## Plugins

Lv2 plugins are not shipped with LMMS. This section shall describe which packages you need to install to get as many Lv2 plugins as possible.

### Arch Linux

```
pacman -S calf lsp-plugins mda.lv2 noise-repellent surge x42-plugins
yay -S lv2-plugins-aur-meta
```

### macOS (HomeBrew)

`(to be done)`

### Ubuntu

```
# TODO: add more plugins
sudo apt-get install calf-plugins mda-lv2 x42-plugins swh-lv2

# Additional plugins for Ubuntu 20.04 or higher
sudo apt-get install lsp-plugins-lv2 dpf-plugins-lv2
```

### Windows

You can download LV2 plugins from the internet. A good place to get started is https://x42-plugins.com/.

## Supported plugins

Currently, we support

* Core (except CV ports)
* URIDs
* MIDI atoms

Run `LMMS_LV2_DEBUG <path to lmms>` to get a complete list of unsupported plugins.

## Debugging plugins

If a system-installed plugin has no debugging symbols, compile it and prepend the self-compiled version to the `LV2_PATH`:

`LV2_PATH=/path/above/plugin/path:$LV2_PATH /path/to/lmms`

For example, if you want to debug ZynAddSubFX, and it is in `/a/b/c/ZynAddSubFX.lv2`:

`LV2_PATH=/a/b/c:$LV2_PATH /path/to/lmms`

## lv2lint

https://github.com/OpenMusicKontrollers/lv2lint#lv2lint

It needs to be compiled from source.

By default lv2lint will look for plugins in `LV2_PATH`. For a complete list of options type `lv2lint -h`.

The simplest example command would be to just pass the plugin uri:

`lv2lint http://calf.sourceforge.net/plugins/Vinyl`

For a more extensive report:

`lv2lint -d -E warn -E note http://calf.sourceforge.net/plugins/Vinyl`

