#!/bin/bash

curl -O https://www.mtgjson.com/json/AllCards.json
curl -O https://www.mtgjson.com/json/SetList.json
node simplifyPrices2.js > prices.json
node simplifyPrices.js > SimplifiedPrices.json
node convertCards.js > cards.json
node extractSetInfo.js > sets_temp.json
mv sets_temp.json sets.json