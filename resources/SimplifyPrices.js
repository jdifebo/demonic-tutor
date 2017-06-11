let prices = require("./prices.json");
let fs = require("fs");

let simplifiedPrices = {};

Object.keys(prices).forEach(key => {
    lowestPricePrinting = getLowestPricePrinting(prices[key]);
    simplifiedPrices[key] = {
        price: getLowerNonzero(lowestPricePrinting.averagePrice, lowestPricePrinting.foilAveragePrice),
        link: lowestPricePrinting.link   
    };
});

console.log(JSON.stringify(simplifiedPrices));

// If two printings both have both foil and non-foil, 
function getLowestPricePrinting(printings){
    return printings.reduce((acc, val) => {
        let accPrice = getLowerNonzero(acc.averagePrice, acc.foilAveragePrice);
        let valPrice = getLowerNonzero(val.averagePrice, val.foilAveragePrice)
        if (accPrice > valPrice){
            return val;
        }
        else {
            return acc;
        }
    })
}

function getLowerNonzero(x, y){
    if (x === 0){
        return y;
    }
    else if (y === 0){
        return x;
    }
    else return Math.min(x, y);
}