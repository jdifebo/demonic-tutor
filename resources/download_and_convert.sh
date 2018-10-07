curl -O http://mtgjson.com/json/AllSets.json.zip
curl -O http://mtgjson.com/json/AllCards-x.json.zip
jar xf AllSets.json.zip
jar xf AllCards-x.json.zip
node convertCards.js > cards.json
node extractSetInfo.js > sets_temp.json
mv sets_temp.json sets.json