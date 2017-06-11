var sets = require("./AllSets.json");

var setNames = 
    Object.keys(sets)
    .map(key => sets[key])
    .map(set => set.name)

var setToSetNames = {}
Object.keys(sets).forEach(key => {
    setToSetNames[key] = sets[key].name
})

console.log(JSON.stringify(setToSetNames));