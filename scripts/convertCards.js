/*
 * A quick and dirty script that takes cards in the format provided by http://mtgjson.com/
 * and convert it to a format that I find to be more accessible.  Currently all that it does
 * is turn the object that maps card names to cards and outputs a single array of cards, and
 * also replaces color names with single letters.
 */


let original = require("../resources/AllCards.json");

function modifyCard(card){
    let colorNameToSymbol = {
        "White" : "W",
        "Blue" : "U",
        "Black" : "B",
        "Red" : "R",
        "Green" : "G",

    }

    if (card.colors !== undefined){
        card.colors = card.colors.map(old => colorNameToSymbol[old])
    }

    if (card.names && card.names.length > 1) {
        // We'll do something special for cards with multiple names

        // One case for split cards (to get the right image at least)

        // Something for flip cards

        // Something for other jank too!
    }
    else {
        delete card.imageName;
    }
    return card;
}

let arrayOfCards = Object
    .keys(original)
    .map(key => modifyCard(original[key]))
    // .filter(card => card.name === "Beck")
    // .filter(card => card.names && card.names.length > 1)
    // .slice(0, 10);

console.log(JSON.stringify(arrayOfCards));