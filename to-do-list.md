
# To-do list

## Cayley diagrams

 * Support chunking, or document that you don't yet support it.
    * Add to the `.md` doc how to specify whether to chunk: by
      default, `cd.chunk` is undefined; you can set it to an index
      into the strategy table.

## Command-line interface

 * Create a `ge-draw` command line application that gets run by
   `npm run` and sits in the `bin` folder when you install from npm.
   Make its signature like `ge-draw <group> <visualizer> [options]`,
   with one option at first, the output file name, from which the
   file type is discerned (SVG/PDF/PNG).
 * Add `ge-draw --help` that prints a help message.
 * Add all options of the form `--x=y`, resulting in a call to
   `renderer.set( x, y )`, plus add help on each.
 * Add the following options/new signatures, adding help for each as
   you create the feature.
    * `ge-draw list`: List all groups in library and stop.
    * `ge-draw <group> list`: List all built-in visualizations
      (Cayley Diagrams and Objects of Symmetry), all elements (by
      index and primary representation) plus all subgroups, then stop.
      To do this, you will probably need to throw together a quick
      replacement for `mathml2text`.
    * `ge-draw <group> <viz> --highlight-<type>=<n>`: Highlight
      subgroup #n with the given highlighting type.  Can be
      accompanied by `--highlight-color=<color>`, in any reasonable
      format.
    * `ge-draw <group> <viz> --highlight-<type>=<json>`: Highlight
      subset with the given elements, using the given highlighting
      type.  The JSON must be an array of element indices or an array
      of strings, element representations.  Support `--highlight-color`.
    * Extend the previous to support an array of arrays partitioning
      the group.
    * `ge-draw <group> <viz> --highlight-<type>=<C>`: Where C is any
      reasonable initial segment of the phrase "conjugacy classes",
      highlight the conjugacy classes partition.
    * `ge-draw <group> <viz> --highlight-<type>=<O>`: Where O is any
      reasonable initial segment of the phrase "order classes",
      highlight the order classes partition.
    * `ge-draw <group> <viz> --highlight-<type>=<H>-<n>`: Where H is any
      reasonable initial segment of the word "cosets" and n is an
      index into the list of subgroups, as with `--highlight-<type>=<n>`.

## Finding groups

Don't forget to document the rest of the `GE.IsomorphicGroups` features
as well.

## Known issues

 * `mathml2text` does not work because no `XSLTProcessor` is
   available.  I couldn't find an equivalent tool on npm,
   though some things are close to what's needed.  (The best
   one seems to process strings instead of XML trees and/or
   DOM hierarchies.)  Thankfully so far I haven't needed this,
   because `mathjax-node` has been doing everthing I need.
