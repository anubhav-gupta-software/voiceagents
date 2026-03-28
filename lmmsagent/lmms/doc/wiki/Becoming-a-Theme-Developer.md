## Prerequisites: CSS

[CSS](https://en.wikipedia.org/wiki/Cascading_Style_Sheets) and graphic design are your two basic skillsets when developing themes. Learning them is actually quite easy, albeit a gradual process requiring patience.

### CSS tutorials
* [W3Schools offers a sort of manual for learning CSS](https://www.w3schools.com/Css/)
* [If you prefer videos, this series will work well enough.](https://www.youtube.com/playlist?list=PLgGbWId6zgaWZkPFI4Sc9QXDmmOWa1v5F)
* [Qt does not use standard CSS, it uses its own kind, so it's important to learn Qt CSS.](https://doc.qt.io/qt-5/stylesheet.html)
### Graphic design tutorials
* [How to use GIMP, an advanced raster graphics editor.](https://www.youtube.com/watch?v=2EPIUyFJ4ag)
* [The Krita user manual](https://docs.krita.org/en/)

Whatever software you use to code or design graphics is up to you. When replacing graphics, just have a look in the software as to where the graphics appear before making your own version.

## The basics

Mainly you want to create your own folder in your theme directory and copy the graphics from another theme, just to get the idea of what images are used with what filenames. The `style.css` code is where you'll likely do most of the work.

## Qt CSS

LMMS depends on the Qt library for customizable, fully-featured UI. Qt effectively uses C++ code to allow us to style the aesthetics of software as if it were a web app. Qt developing their own engine comes with unexpected side effects, however;

* Several features found in modern CSS are missing, such as the use of !important and :nth-child().
* CSS selectors override each other with a ranking system (ID is 100 points, a parent is 1 point, etc)
* Several selectors are fully inherited by others, so modifying a parent class, for example will affect their children.

That last part is a bit confusing. Let's say you had a QWidget, the most basic form of a widget that Qt can offer. Many widgets are a child (or a subcategory, if you will) of QWidget, so styling QWidget means styling every instance of the Qt elements that inherit QWidget. Here is a list of the standard Qt classes and how they inherit each other:

```
QWidget
 QAbstractButton      = All buttons.
  QPushButton
  QRadioButton
  QToolButton
 QAbstractSlider      = Scrollbars/Master&Pitch/FPS in Settings, etc
  QScrollBar
  QSlider
 QAbstractSpinBox     = Value changing in SpinBoxes
  QDoubleSpinBox      = Volume adjustments
  QSpinBox            = Tempo, for example.
 QComboBox            = Drop Down Menus
  QFontComboBox
 QDialog              = Dialogs that have to be Windows windows.
  QColorDialog
  QErrorMessage
  QFileDialog
  QFontDialog
  QInputDialog
  QMessageBox
  QProgressDialog
  QWizard
 QFrame               = Wrappers for other widgets
  QAbstractScrollArea
   QAbstractItemView
    QListView         = inside ladspa plugin browser)
     QListWidget
    QTreeView         // ::item, ::branch :has-children
     QTreeWidget
   QMdiArea
   QScrollArea
   QTextEdit          = Notes
  QLabel
  QSplitter
  QStackedWidget      = Contents of tabs in About
 QGroupBox            = Wrappers for groups of widgets
 QLineEdit            = Single line text editing // :read-only, :focus
 QMainWindow          = Seems like this goes behind *everything*
 QMdiSubWindow        = Floating dialog windows (includes Windows windows)
 QMenu                = Yep // ::item, ::seperator :selected :disabled
 QMenuBar             = Yep
 QProgressBar         = Yep, there are progress bars, here.
 QTabBar              = Tabs in about
 QTabWidget           = Contents in tab
 QToolBar             = Hover text
```

## qproperties

LMMS developers have created several tags for elements, some of which have uniquely customizable properties in the code. Refer to an existing theme for examples of qproperties. A list of the custom Qt elements that LMMS has created are listed below.

```
 AutomatableSlider (master volume, master pitch)
  :handle:vertical and :handle:horizontal
 AutomationEditor
 AutomationClipView
 BBClipView
 ClipView
 ComboBox
 ControllerRackView
 CPULoadWidget
 EffectRackView
 EffectSelectDialog (add effect dialog)
 Fader
 MixerLine
 MixerView
 LmmsPalette
 PianoRoll
 PianoView
 PluginDescList
 PluginDescWidget
 SampleClipView
 SubWindow (windows in the QMdiArea)
 TextFloat (appears when adjusting dials)
 TrackContainerView
 TrackContentObjectView
 TrackLabelButton
 TrackView
 TimeLineWidget
 VisualizationWidget
```

In addition, Qt applications can have custom IDs. Adding an ID to a selector adds "100" to the selection's "rank," quickly overriding other CSS rules. The list of IDs are here:

```
#mainToolbar = The top main toolbar.
```

## The tree

It usually helps to understand what the hierarchy structure of this software is, before modifying it. LMMS seems to operate as a sort of tree hierarchy, where QMainWindow seems to be the root of the site, and things like the individual buttons in a container wrapper are the end points. Please note that the following hierarchy tree, while intended to describe LMMS in a manner that CSS developers should understand, is incomplete.

```
QMainWindow
  QDialog (loading dialog)
  QMenu (you can color it with this apparently)
    QMenu (Recent Projects submenu, this is the only submenu apparently)
  QMenuBar
  QWidget (unknown/unnamed) main toolbar and workspace wrapper
    QWidget#mainToolbar
      AutomatableSlider (child of QWidget)
        ::groove
        ::handle
      QLabel (for the master volume and pitch)
      QToolButton
      QWidget (unknown/unnamed)
        CPULoadWidget (wrapper for cpu load)
        VisualizationWidget (visualizes waveform and clipping)
    QWidget (unknown/unnamed) wrapper for sidebar and workspace
      QSplitter (...another wrapper that doesn't include the sidebar buttons?)
        ::handle
        QMdiArea
          QWidget (unsure)
            [Song Editor and Beat+Bassline/Pattern Editor]
            QMdiSubWindow
              QLabel
              QMainWindow (song/clip editor)
                QToolBar (a mysterious empty toolbar with a handle)
                QToolBar (song editor/bb-editor toolbar)
                  ComboBox (not QComboBox, this is a custom model)
                    QMenu
                  QToolButton
                  QLabel
                TrackContainerView
                  QFrame
                    QWidget
                      QWidget
                        TrackView
                          QWidget
                            QPushButton (menu button)
                            TrackLabelButton
                          TrackContentWidget
                            AutomationClipView
                            BBClipView
                            MidiClipView
                            SampleClipView
                      QScrollBar
                  QScrollBar
              QPushButton (Resize, close)
            [AutomationEditor]
            QMdiSubWindow
              QLabel
              QMainWindow (automation editor)
                AutomationEditor
                  QScrollBar
                  TimeLineWidget
              QToolBar
            [PianoRoll is similar]
            QMdiSubWindow
              QMainWindow
                PianoRoll (and it continues like AutomationEditor)
            [Mixer]
            QMdiSubWindow
              MixerView
                MixerLine (master channel)
                QScrollArea
                  QWidget
                    QScrollBar
                    QWidget
                      MixerLine
              QPushButton (close)
              QWidget
                QPushButton (+)
                QWidget
                  EffectRackView (see Effects section)
            [Effects chain of sample editor]
            QMdiSubWindow
              QPushButton (maximize, close)
              EffectRackView
                QWidget
                  QScrollArea
                    QWidget
                      QScrollBar
                    QWidget [this is for any listed effects]
                      QWidget
                        QWidget
                          QPushButton [effect controls button]
                  QPushButton
            [ControllerRack]
            QMdiSubWindow
              ControllerRackView
                QScrollArea
                  QWidget
                    QWidget
                      QWidget
                        QPushButton
                    QScrollBar
            [Plugin for example Tripleoscillator]
            QMdiSubWindow
              QLabel
              QPushButton (close button)
              QWidget
                QWidget
                  QLabel (vol, pan, pitch, range, fx, save)
                  QScrollBar
                  QWidget (envelope, effects chain, midi, and ...)
        QWidget (unsure, next to SideBar)
          QWidget (unsure)
            QWidget
              QLabel
              QScrollArea
                QWidget
                  PluginDescList
                    PluginDescWidget
            QTreeView
              ::branch:has-children:open etc
              ::item:selected etc
      SideBar
        QToolButton (sidebar buttons)

See also https://docs.lmms.io/developer-guides/gui/