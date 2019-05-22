#!/bin/bash

echo "Importing ge-lib.js from ../group-explorer-3/build/"
cp ../group-explorer-3/build/ge-lib.js ./src/
echo "Importing all group files from ../group-explorer-3/groups/"
cp ../group-explorer-3/groups/*.group ./groups/
echo "Done."

