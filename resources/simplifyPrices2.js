var allSets = require('./AllSets.json');

let prices = {};
for (set in allSets){
    for (let i = 0; i < allSets[set].cards.length; i++){
        let card = allSets[set].cards[i];
        if (card && card.prices && card.prices.paper) {
            let paperPrices = Object.keys(card.prices.paper).length > 0 ? card.prices.paper : card.prices.paperFoil;    // fall back to foil if no paper prices
            let mostRecentDate = Object.keys(paperPrices).sort().reverse()[0];
            if (prices[card.name] === undefined) {
                prices[card.name] = {};
            }
            prices[card.name][set] = {
                price: paperPrices[mostRecentDate],
                url: card.purchaseUrls && card.purchaseUrls.tcgplayer
            };
        }
    }
}
console.log(JSON.stringify(prices, null, 4));