Everybody has their own preferred style for writing code, however, in the interest of making the codebase easier to maintain, we request that the following conventions be observed. Code that is lifted from other projects does not need to be modified to match these rules – no need to fix what isn't broken.

This convention page follows the requirements keywords of [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt). Requirements are seen as CAPITAL letter words.

The majority of LMMS conventions follows the [Qt Coding Style](https://wiki.qt.io/Qt_Coding_Style). Some conventions are repeated here, and if not noted here MAY fall under the Qt style.

## Header Files and Include Statements

### Header Guards
Header guards MUST NOT begin with an underscore `_`. Identifiers that begin with an underscore + CAPITAL letter are reserved identifiers in C++. If you edit an older file which contains an improper header guard, please fix it to comply with guidelines.

### Include Order
The first `#include` in a `cpp` file MUST be its own related header file. Afterwards group `#include`s by type, where groups are separated by a newline, and ordered by name.
```cpp
// MySourceFile.cpp
#include "MySourceFile.h"

#include <QMap>
#include <QString>

#include "DataFile.h"
#include "Engine.h"
#include "GuiApplication.h"
```

## Naming

### Type Names
Types MUST begin with an uppercase letter.
```cpp
class ResourcesDB;
enum MyEnum
{
...
};
typedef QList<AutomatableModel *> AutoModelList;
```

### Variable Names
Variables MUST use camel case format, for example: `nextValue`.

### Class Members
1. Non-static member variables MUST be prefixed with `m_`
1. Static variables MUST be prefixed with `s_`

The remaining variable name MUST follow the Variable Names rule.
```cpp
float m_currentValue;
static int s_quantization;
```

### Function Parameters
Some older code prefixed function parameters with an underscore `_`. Function parameters SHOULD NOT be prefixed with an underscore.

## Formatting

### Line Length
Every line of text SHOULD be at most 120 characters long.

### Indentation
Tabs MUST be used for indentation. Instructions for configuring QtCreator can be [found here](https://github.com/LMMS/lmms/pull/2033#issuecomment-98895801).

### Flow Control Statements
Flow control statements (`if`, `else if`, `else`, `for`, `do`, `while`, and `switch`) MUST have a space between the keyword and the opening parenthesis.

### True/False
You MUST use the `true`/`false` keywords instead of non-standard macros or integers.
```cpp
b = TRUE; // BAD
b = true; // GOOD
b = 1; // BAD
```

### Null pointers
You MUST use the `nullptr` keyword instead of macros or integers.
```cpp
p = NULL; // BAD
p = nullptr; // GOOD
p = 0; // BAD
```

### Ternary Operator
The ternary operator `? :` SHOULD be used only when it makes the code more readable or streamlined.

### Whitespace
#### Braces
1. Spaces MUST NOT be added after an opening parenthesis or bracket
1. Spaces MUST NOT be added before a closing parenthesis or bracket
1. Flow control statements (`if`, `else if`, `else`, `for`, `do`, `while`, and `switch`) MUST use explicit blocking
1. Block braces SHOULD be on their own line
```cpp
// Spaces before/after parentheses and brackets
void doThis( int a ); // BAD
void doThis(int a); // GOOD
if ( m_sample > 0 ) // BAD
if (m_sample > 0) // GOOD
array[ offset ] // BAD
array[offset] // GOOD

// BAD - Example of not explicit blocking
if (m_sample > 0)
	--m_sample;
// GOOD - Example of explicit blocking
if (m_sample > 0)
{
	--m_sample;
}
// If the block can fit on one line, it is acceptable to format it as shown below.
// (Note that rules 1 and 2 do not apply, the contents are separated by a space on either side.)
if (m_sample > 0) { --m_sample; }
```

#### Return Statements
Return statements MUST NOT have parenthesis around the returned value.
```cpp
return (bar); // BAD
return bar; // GOOD
```

#### Semicolons
Spaces MUST NOT be added before semicolons.
```cpp
return this ; // BAD
return this; // GOOD
```

#### Infix Operators
Spaces MUST be before and after infix operators (`=`, `+`, `-`, `*`, `/`, etc.).
```cpp
sub_note_key_base=base_note_key+octave_cnt*NOTES_PER_OCTAVE; // BAD
sub_note_key_base = base_note_key + octave_cnt * NOTES_PER_OCTAVE; // GOOD
```

#### Ternary Operator
If long ternary expressions don't fit on one line, they MUST be formatted as one of the below, depending on the readability of the surrounding code. If the expressions are very long or convoluted, you SHOULD use if/else blocks instead.
```cpp
a == condition
	? value
	: otherValue;
// OR, depending on surrounding code readability
a == condition
? value
: otherValue;
```

## Doxygen comments

### Doxygen layout

Doxygen comments SHOULD use `//! ...` for inline comments about the following line, or `//!< ...` for inline comments for the line they are in, or
```
/**
    ...
*/
```
for larger comments. Example:

```
/**
    this
    is a
    larger
    comment
    about `class s`
*/
class s
{
    //! this comment is above `f` and explains what `f` does
    void f();
    int m_i; //!< this comment is behind `m_i` and explains what `m_i` does
};
```

For referencing code, you can use backticks, like above, or e.g. `@p` to reference a parameter name.

### Converting to doxygen

Comments in headers SHOULD use doxygen style whenever possible. For example, if you see code like
```
// This function does ...
void function();
```
then change it to
```
//! This function does ...
void function();
```

When submitting a PR, normal comments should be turned into doxygen comments. However, this must be done with care: In the following examples, blindly replacing `//` by `//!` would lead to bad doxygen comments:

```
// the next two functions do ...
void f();
void g();
```


```
// This class could need some cleanup
class c { /* ... */ };
```

## TODO Comments

Sometimes it's worth merging code even if there are improvements to be made. In these cases its helpful to leave comments highlighting what improvements should be made and where. For the sake of discoverability, please use a searchable keyword in these comments. Some keywords currently used in the codebase are `TODO`, `HACK`, `Workaround`, and `FIXME`. An example from PR #5427: `// TODO: We should do this work outside the event thread`.

### Qt Versions

If a piece of code is only relevant for some versions of Qt, `QT_VERSION` and `QT_VERSION_CHECK(MAJ, MIN, PAT)` can be used to exclude it in other versions. This has the added benefit that when we update our minimum Qt version, a simple search for `QT_VERSION` can be used to remove outdated code. A simplified example based on PR #5777:

```
#if QT_VERSION < QT_VERSION_CHECK(5, 12, 2)
	// Your code here
#endif
```

### C++ Versions

Changes to the C++ standard can simplify or otherwise improve existing code. Since we lag behind the standards, sometimes we can know ahead of time that a particular section of code could be better written if a newer standard were used. In this case, a comment along the lines of `// TODO C++##:` should be added. An example from PR #5589: `// TODO C++17 and above: use std::optional instead`