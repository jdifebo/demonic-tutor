/*
 * A quick and dirty script that takes cards in the format provided by http://mtgjson.com/
 * and convert it to a format that I find to be more accessible.  Currently all that it does
 * is turn the object that maps card names to cards and outputs a single array of cards, and
 * also replaces color names with single letters.
 */

let original = require("../resources/AllCards-x.json");

function simplifyFormats(originalCard){
    if (originalCard.legalities === undefined){
        if (originalCard.printings.includes("C16")){
            return {
                "Commander": "Legal",
                "Legacy": "Legal",
                "Vintage": "Legal"
            }
        }
        return undefined;
    }
    let formats = {}
    originalCard.legalities.forEach(legality => formats[legality.format] = legality.legality);
    return formats;
}

function modifyCard(originalCard){
    let card = {};
    card.name = originalCard.name;
    card.cmc = originalCard.cmc;
    card.type = originalCard.type;
    card.text = originalCard.text;
    card.formats = simplifyFormats(originalCard);
    card.manaCost = originalCard.manaCost;

    let colorNameToSymbol = {
        "White" : "W",
        "Blue" : "U",
        "Black" : "B",
        "Red" : "R",
        "Green" : "G",

    }

    if (originalCard.colors !== undefined){
        card.colors = originalCard.colors.map(old => colorNameToSymbol[old])
    }

    if (card.names && card.names.length > 1) {
        // We'll do something special for cards with multiple names

        // One case for split cards (to get the right image at least)

        // Something for flip cards

        // Something for other jank too!
    }
    else {
        // delete card.imageName;
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