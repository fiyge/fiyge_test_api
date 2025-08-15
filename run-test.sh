#!/bin/zsh
echo "Starting API unit tests in FIYGE"
rm -rf src/models.json
npm run fetch-models
npm run test

