#!/bin/bash

#
# Convert an SVG to PDF using rsvg-convert.
# Mac users can install it with brew install librsvg.
# Linux users can probably apt-get librsvg or something.
#

BASE=${1%.*}

echo "Doing: rsvg-convert -f pdf -o $BASE.pdf $BASE.svg"
rsvg-convert -f pdf -o $BASE.pdf $BASE.svg
echo "Done."

