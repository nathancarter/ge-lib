
# Basic `ge-lib` API

## Install the module

You can install the module from npm.

```
$ npm install ge-lib
```

If you want to use the command-line interface, either install globally,
modify your path, or run `npm link` after you've installed locally.

But a local install is sufficient for accessing the module through node.

## Load the module

To start using the module, load it the usual way.

```js
const GE = require( 'ge-lib' );
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

## Finding and showing groups

Although this repository is for visualizing groups in SVG, PDF, or
PNG format, sometimes it's useful to debug a group by dumping it
to the terminal/console.  Here is a quick example of how to do so.

```js
const dumpGroup = g => {
    console.log( `Group name: ${g.shortName}` );
    g.elements.map( a =>
        console.log( '\t' + g.elements.map( b =>
            g.mult( a, b ) ).join( ' ' ) ) );
};
```

This prints the multiplication table of a group, like so.

```js
dumpGroup( GE.Libary.loadByName( 'S_3' ) );
```

```
Group name: S_3
	0 1 2 3 4 5
	1 2 0 5 3 4
	2 0 1 4 5 3
	3 4 5 0 1 2
	4 5 3 2 0 1
	5 3 4 1 2 0
```

It is also possible to go in the other direction; if you have the
multiplication table for a group, you can find the group in the library that
has that multiplication table.  To do so, proceed as follows.

```js
const myMT = [ [ 0, 1, 2 ], [ 1, 2, 0 ], [ 2, 0, 1 ] ];
const myGroup = new GE.BasicGroup( myMT );
const official = GE.IsomorphicGroups.find( myGroup );
if ( official )
    dumpGroup( official );
else
    console.log( 'No group with that table.' );
```

```
Group name: Z_3
    0 1 2
    1 2 0
    2 0 1
```
