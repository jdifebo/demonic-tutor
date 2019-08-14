var currentSets = require("./sets.json");
var setList = require("./SetList.json");

setList.forEach(set => {
    if (currentSets[set.code] == undefined) {
        currentSets[set.code] = set.name;
    }
})

console.log(JSON.stringify(currentSets, null, 4));