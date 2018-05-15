var sets = require("./AllSets.json");
var currentSets = require("./sets.json");

Object.keys(sets).forEach(key => {
    if (currentSets[key] == undefined) {
        currentSets[key] = sets[key].name
    }
})

console.log(JSON.stringify(currentSets));