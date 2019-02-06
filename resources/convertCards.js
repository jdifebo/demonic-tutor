/*
 * A quick and dirty script that takes cards in the format provided by http://mtgjson.com/
 * and convert it to a format that I find to be more accessible.  Currently all that it does
 * is turn the object that maps card names to cards and outputs a single array of cards, and
 * also replaces color names with single letters.
 */

let original = require("./AllCards.json");

function simplifyFormats(originalCard){
    if (originalCard.printings.includes("DOM")){
        return {
            "Commander": "Legal",
            "Legacy": "Legal",
            "Vintage": "Legal",
            "Standard": "Legal",
            "Modern": "Legal"
        }
    } else if (originalCard.legalities === undefined){
        return undefined;
    }
    let formats = {}
    console.log(originalCard.name);
    originalCard.legalities.forEach(legality => formats[legality.format] = legality.legality);
    return formats;
}


function modifyCard(originalCard){
    let card = {};
    card.name = originalCard.name;
    card.cmc = originalCard.cmc || 0;
    card.type = originalCard.type;
    card.text = originalCard.text;
    card.legalities = originalCard.legalities;
    card.manaCost = originalCard.manaCost;
    card.power = originalCard.power;
    card.toughness = originalCard.toughness;
    card.loyalty = originalCard.loyalty;
    card.colorIdentity = originalCard.colorIdentity;
    card.printings = originalCard.printings;
    card.layout = originalCard.layout;
    card.names = originalCard.names;

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


    if (originalCard.names && originalCard.names.length > 1) {
        if (originalCard.layout === "split" || originalCard.layout == "aftermath") {
            card.image = originalCard.names.join(" // ");
        }
    }

    // I want to treat meld cards as having 3 names.  Since there are only a handful of cards with this ability, it'll be easiest
    // to just hardcode the necessary changes.  If/when meld returns, this will need to be updated.
    if (card.name == "Bruna, the Fading Light" || card.name == "Gisela, the Broken Blade" || card.name == "Brisela, Voice of Nightmares"){
        card.names = ["Bruna, the Fading Light", "Gisela, the Broken Blade", "Brisela, Voice of Nightmares"];
    }
    else if (card.name == "Hanweir Garrison" || card.name == "Hanweir Battlements" || card.name == "Hanweir, the Writhing Township"){
        card.names = ["Hanweir Garrison", "Hanweir Battlements", "Hanweir, the Writhing Township"]
    }
    else if (card.name == "Midnight Scavengers" || card.name == "Graf Rats" || card.name == "Chittering Host"){
        card.names = ["Midnight Scavengers", "Graf Rats","Chittering Host"]
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