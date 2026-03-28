So, you finally decided to contribute a plugin to LMMS! That's cool! There are many plugin formats you can use:

|      |Req. skill |LMMS integration|usable outside LMMS|disadvantages|
|------|-----------|----------------|-------------------|---|
|LMMS  |Qt, C++    |best            |no                 |bound to LMMS|
|LADSPA|C          |basic           |yes                |deprecated, very limited, effects only|
|LV2   |C, Lv2, ...|basic           |yes                |difficult to write|
|SPA   |C++        |yet basic       |yes                |only avail on branch, unfinished|

Summarizing, LADSPA is deprecated (and not recommended), LV2 is difficult, SPA is unfinished, and LMMS will only reach LMMS users.

## LMMS plugins ##

First of all, you should read the sourcecode of one of the provided plugins. Preferably the one that resembles your planned plugin at most. The Amplifier effect is the easiest effect and may be a good example. Nevertheless, you will find information on the plugin structure here.

### Plugin meta data ###
Your plugin has to define a plugin meta data structure in the following style:
```C++
	extern "C"
	{

	Plugin::Descriptor PLUGIN_EXPORT YourPluginNameHere_plugin_descriptor =
	{
	       STRINGIFY( PLUGIN_NAME ),
	       "YourPluginNameHere",
	       QT_TRANSLATE_NOOP( "pluginBrowser",
		                       "YourPluginDescriptionHere" ),
	       "YourNameHere <YourEmailAdressHere>",
	       0x0100,
	       Plugin::Instrument,
               new PluginPixmapLoader( "logo" ),
               NULL,
               NULL
	} ;

	}
```
Note: This should be in the source (.cpp) file of your plugin.

### Plugin callback ###
LMMS can find your plugin only if you have the following C-style code in your class file. This code is called by LMMS everytime a new instance of the plugin is created.
```C++
	extern "C"
	{

	// neccessary for getting instance out of shared lib
	Plugin * PLUGIN_EXPORT lmms_plugin_main( Model *, void * _data )
	{
		return( new yourInstrumentClassNameHere( static_cast<InstrumentTrack *>( _data ) ) )
	}

	}
```
Note: This is in the source (.cpp) file for your plugin

### Makefiles ###
* Copy CMakeLists.txt from another plugin source directory and edit it to fit your plugin
* Edit CMakelists.txt in the plugins directory, add a ``` ADD_SUBDIRECTORY(your_plugin_dir) ``` line
* Run cmake, make, make install (anything else? make clean first?)

### Artwork ###
Create two PNG files. One called _logo.png_ (48x48 px) which will be displayed as plugin logo in the plugin browser. The other is _artwork.png_ (250x250 px) which will be the background/wallpaper for your plugin.

### Hints ###
* Do __not__ give the plugin and the class the same name as this causes conflicts of your classname and your plugin namespace - of course you can use compiler's case-sensitivity, e.g. PLUGIN_NAME in _Makefile.am_ is "myplugin" and your class is called "myPlugin"

## LADSPA plugins ##

Write your LADSPA plugin as usual. Move it to one of the directories from the settings, or set the `LADSPA_PATH` variable.

## Lv2 plugins ##

Write your Lv2 plugin as usual. Install it to the unique Lv2 plugin folder (TODO: where is that?).

## SPA plugins ##

Write your SPA plugin as usual. Set the variable `SPA_PATH` apropriately.

See also https://docs.lmms.io/developer-guides/core/instruments-and-effects on GitBook.