#!/bin/bash

curl -O https://mtgjson.com/json/AllCards.json
curl -O https://www.mtgjson.com/json/SetList.json
node convertCards.js > cards.json
node extractSetInfo.js > sets_temp.json
mv sets_temp.json sets.json