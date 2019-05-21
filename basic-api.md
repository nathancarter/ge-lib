
# Basic `ge-lib` API

## Load the module

To start using the module, load it the usual way.

```js
const GE = require( 'ge-lib.js' );
```

## See what groups it knows

To find out which groups are available to load from the filesystem,
call the following function, which returns a list of strings.

```js
GE.Library.allGroupNamesInFilesystem();
```

*None of these groups are actually loaded into memory yet.*

If you try to use any of them, it will fail.  To use a group, you
must first load it.

## Loading groups into memory

You can load a group by passing a group name (as returned by the
function documented above) to the following function.

```js
const A_4 = GE.Library.loadByName( 'A_4' );
```

This first loads the group into memory and then also returns it.
Later, if you needed to get your hands on the same group again,
you could just ask for it from memory rather than from disk, as
shown below.

```js
GE.Library.getByName( 'A_4' );
```

*This will fail if the group has never been loaded before.*

You can also load groups that aren't in `ge-lib`'s database.
You will need a `.group` file in the XML format that Group
Explorer expects, but if you have one, you can load it by passing
the full path to that file directly:

```js
const myGroup = GE.Library.loadFromFilesystem( '/path/to/my.group' );
```

If you want to ensure that all groups are loaded, you can load all
the ones that `ge-lib` knows about with one command, though it may
take several seconds to complete.

```js
GE.Library.loadAllFromFilesystem();  // slow, 2-3sec or more
```
