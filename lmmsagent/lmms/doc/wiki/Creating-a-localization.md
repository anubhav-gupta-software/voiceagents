### Why create a localization?

A lot of people prefer to use a program in their own language. Therefore localizations for each language are required. As LMMS isn't available in all common languages, there's a need for people creating new or improving already available translations of LMMS. If there's no translation for your language yet, you can create a new one. The following short article will guide you through the process of creating a translation.

### How to create a translation

The easiest way to create and submit translations is by joining our [Transifex LMMS team](https://www.transifex.com/lmms/lmms ). You'll need to create a Transifex account for this. Then you can send a request to join the language team. Please wait patiently while we reviewing your request, this could take from several seconds to several days. After joining the language team, you can contribute to the LMMS localisations. If you are unfamiliar with Transifex, you can refer to [their comprehensive guide to get started.](http://docs.transifex.com/getting-started/translators/) When translating,  '''Do not translate sentences that you're not sure how to translate.''' Often it's more clear to just leave the English string. It isn't bad at if your translation is not complete. One day someone else may add the missing translations.

If you want to download the translation to work offline or don't want to use Transifex editor, you can work in our traditional way: First  checkout a recent (stable) version of LMMS from Git repository ([[Accessing Git repository]]). Afterwards you need to create a new empty file called "XX.ts" where XX are two characters identifying your localization, e.g. `de` for Germany, `fr` for France, `it` for Italy and so on. Example:

```bash
touch data/locale/de.ts
```

In the next step we actually create the localization file:

```bash
mkdir build
cd build
cmake ..
make XX.ts
cd ..
```

Now look into directory "data/locale" where you should find the according ts-file. You can open this file using Qt Linguist, which is usually part of Qt-development-packages. The usage of Qt Linguist doesn't require any explanations as you just have to translate the current string and hit <enter> to process next one.

After you're done with Qt Linguist, it's time to integrate your translation into LMMS. Either directly send the translation maintainer or language coordinator an email and attach your ts-file or do the following: open the "file"-menu in Qt Linguist and select "release". Qt Linguist automatically fills in the correct output filename, so just click on "OK" and that's all. All you have to do now is running

```bash
make install
```

for installing LMMS to an appropriate location. Then run it and it should speak your language ;-) If not either your locale environment variable is incorrect or you did something wrong at another place. So if you can't figure it out, send the maintainer your ts-file, but if you have a Transifex account, you can upload the ts-file to corresponding language instead. Click your language, then click "lmms.ts", and it will popup a menu, you need to click "upload file" and select your ts-file. and very soon you'll be able to checkout a version of LMMS containing also your translation ;-)

<details>
<summary>Currently supported languages (this list may be out of date)</summary>

* Arabic `ar` (Needs help)
* Catalan `ca`
* Chinese (Simplified) `zh_CN`
* Chinese (Traditional) `zh_TW`
* Czech `cs`
* Dutch `nl`
* English `en`
* Farsi `fa` (Needs help)
* French `fr`
* Galician `gl`
* German `de`
* Italian `it`
* Japanese `ja`
* Korean `ko`
* Polish `pl`
* Portuguese `pt-br` (Brazilian)
* Russian `ru`
* Spanish `es`
* Swedish `sv`
* Ukrainian `uk`

</details>

[Source code](https://github.com/LMMS/lmms/tree/master/data/locale)