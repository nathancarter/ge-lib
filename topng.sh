#!/bin/bash

#
# Convert a PDF to PNG using ImageMagick.
# Get it from https://imagemagick.org.
#

BASE=${1%.*}

echo "Doing: convert $BASE.pdf $BASE.png"
convert $BASE.pdf $BASE.png
echo "Done."

