
# To-do list

## Command-line interface

 * Add the following options/new signatures, adding help for each as
   you create the feature.
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
    * Add support for "brighten" which will set the value of
      "brightHighlights".  Also document that option for the first time.

## Finding groups

Don't forget to document the rest of the `GE.IsomorphicGroups` features
as well.

## Cayley diagrams

 * Support chunking, or document that you don't yet support it.
    * Add to the `.md` doc how to specify whether to chunk: by
      default, `cd.chunk` is undefined; you can set it to an index
      into the strategy table.
