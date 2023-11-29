#!/usr/bin/env bash

MPVERSION=$(cat $HOME/OpenplanetNext/OpenplanetNext.json_with_offsets.json | jq .mp | cut -d ' ' -f 1 | tr -d '"')
DESTFILE=op-$MPVERSION.json

echo "VER: $MPVERSION"
echo "DEST: $DESTFILE"

cp $HOME/OpenplanetNext/OpenplanetNext.json_with_offsets.json $DESTFILE
cp $DESTFILE src/OpenplanetNext.json

npm run build-only

git add dist
git add $DESTFILE
git add src/OpenplanetNext.json
