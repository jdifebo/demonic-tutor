let state = {
	allCards: [],
	searchResults: [],
	pageNumberZeroIndexed: 0,
	inputs: {
		name: "",
		types: "",
		text: "",
		colors: {
			W: false,
			U: false,
			B: false,
			R: false,
			G: false,
			excludeUnselected: false,
			requireAll: false,
			colorIdentity: false,
		},
		format: "Vintage",
		power1: -1,
		power2: 15,
		toughness1: -1,
		toughness2: 15,
		cmc1: 0,
		cmc2: 16,
		price1: 0,
		price2: 2000,
		sort: [],
	}
}

const cardsPerPage = 20;

function symbolToUrl(symbol) {
	return "resources/symbols/" + symbol.toLowerCase().replace("/", "") + ".svg"
}

function renderManaSymbol(symbol, size) {
	var size = size || 24;
	return "<img src=" + symbolToUrl(symbol) + " height=" + size + " alt=" + symbol + " />"
}

function getNameForTCGPlayer(card) {
	if (card.layout == "normal" || card.layout == "leveler" || card.layout == "meld") {
		return card.name;
	}
	else if (card.layout == "double-faced" || card.layout == "flip") {
		return card.names[0];
	}
	// split and aftermath cards use both names separated by " // "
	else if (card.layout == "split" || card.layout == "aftermath") {
		return card.names[0] + " // " + card.names[1];
	}
	return undefined
}

/**
 * Sorry for this being so hacky.  It has two separate tasks.  First, it splits the text based on lines
 * so each line can be in its own <p> tag, and then it finds all of the symbols and replaces them with images.
 * 
 * Since all symbols are surrounded by brackets like {g}, we split each line by "{" and "}".  Each element
 * at an even index is text that should be rendered normally, while elements at odd indices are symbols
 * that we replace with images.
 * 
 * @param {*} props 
 */
function renderText(text) {
	if (text !== undefined) {
		let textLines = text.split("\n");
		let textParagraphs = textLines.map((line, lineNumber) => {
			let textAndImages = line.split(/{|}/g).map((value, index) => {
				if (index % 2 === 0) {
					return value;										// even indices are not mana symbols
				}
				else {
					return renderManaSymbol(value, 16);	// odd indices are mana symbols
				}
			}).join("");
			return `<p class="card-text">` + textAndImages + `</p>`;
		});
		return textParagraphs.join("");
	}
	else {
		return "";
	}
}

/*
 * This is really bad because now the stuff that's displayed doesn't actually match up with 
 * our state that we defined above.  It's gross.  But it works.  And I don't want to change it. 
 */
function changeTab(button) {
	let parentCardSection = button.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
	let cardName = button.innerHTML.trim();
	parentCardSection.outerHTML = renderSingleCard(state.multiNameCards[cardName]);
}



function renderMultiCardTabs(card) {
	if (card.names == undefined) {
		return "";
	}

	let navItems = card.names.map(name => {
		let primaryText = name == card.name ? "btn-primary" : "btn-secondary"
		return `
		<div class="col">
			<button type="button" class="btn ` + primaryText + ` btn-sm btn-block">
				` + name + `</button>
		</div>
	`}).join("");

	return `
	<div class="card-header">
		<div class="row">
			` + navItems + `
		</div>
	</div>
	`
}

function debug(card) {
	card.printings.forEach(code => {
		if (sets[code] === undefined) {
			console.log("Couldn't find set name for " + code + " for card " + card.name);
		}
	})
}

function renderSingleCard(card) {
	// debug(card);
	let imgSrc = "http://gatherer.wizards.com/Handlers/Image.ashx?name=" + (card.image ? card.image : card.name) + "&type=card&.jpg";
	let name = card.name;
	let manaCostSymbols = card.manaCost ? card.manaCost.substring(1, card.manaCost.length - 1).split("}{") : [];
	let manaCostImages = manaCostSymbols.map(symbol => renderManaSymbol(symbol)).join("");
	let cmc = card.convertedManaCost;
	let type = card.type;
	let ptOrLoyalty = "";
	let printingsText;
	let printingsHover = card.printings.map(code => sets[code] || code).join("\n");
	let referralLink = "";
	let tcgPriceInfo = card.priceInfo;
	let multiCardTabs = renderMultiCardTabs(card);

	if (tcgPriceInfo != undefined) {
		referralLink = `<a target="_blank" href=` + tcgPriceInfo.link + `>$` + tcgPriceInfo.price + `</a>`
	};

	if (card.printings.length > 3) {
		printingsText = card.printings[card.printings.length - 1] + " and " + (card.printings.length - 1) + " others"
	}
	else {
		printingsText = card.printings.join(", ");
	}

	if (card.power !== undefined) {
		ptOrLoyalty = "(" + card.power + "/" + card.toughness + ")"
	}
	else if (card.loyalty !== undefined) {
		ptOrLoyalty = "(" + card.loyalty + ")"
	}
	let renderedText = renderText(card.text);

	return `
	            <div class="row">
                    <div class="col-4">
                        <img src="` + imgSrc + `" style="max-width:100%"/>
                    </div>
                    <div class="col-8">
                        <div class="card">
							` + multiCardTabs + `
                            <div class="card-header">
                                <div class="row">
                                    <div class="col-6">
                                        <b><span style="float:none">` + name + `</span></b>
                                    </div>
                                    <div class="col-4">
                                        ` + manaCostImages + `
                                    </div>
                                    <div class="col-2">
                                        (` + cmc + `)
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-6">
                                        ` + type + ` ` + ptOrLoyalty + `
                                    </div>
                                    <div class="col-4">
                                        <span title="` + printingsHover + `">` + printingsText + `</span>
                                    </div>
                                    <div class="col-2">
                                        ` + referralLink + `
                                    </div>
                                </div>
                            </div>
                            <div class="card-block">
								` + renderedText + `
                            </div>
                        </div>
                    </div>
					<br />
                </div>
	`
}

function renderCards(state) {
	let startCard = state.pageNumberZeroIndexed * cardsPerPage;
	let endCard = Math.min(startCard + cardsPerPage, state.searchResults.length);

	let cardsToDisplay = state.searchResults.slice(startCard, endCard);
	// state.tabsToDisplay = cardsToDisplay.map(card => card.name);

	let renderedCards = cardsToDisplay.map(renderSingleCard).join("")

	document.getElementById("results").innerHTML = renderedCards;
	document.getElementById("results-count").innerHTML =
		"Showing " +
		(state.searchResults.length > 0 ? (startCard + 1) + " - " + endCard + " of " : "")
		+ state.searchResults.length + " results";
	if (state.searchResults.length <= cardsPerPage) {
		document.getElementById("pagination-top").style.display = "none";
		document.getElementById("pagination-bottom").style.display = "none";
	}
	else {
		document.getElementById("pagination-top").style.display = "";
		document.getElementById("pagination-bottom").style.display = "";
	}
}

function callAjax(url, callback) {
	var xmlhttp;
	// compatible with IE7+, Firefox, Chrome, Opera, Safari
	xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
			callback(xmlhttp.responseText);
		}
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

function createColorMatcherFunction() {
	let cardColors = card => state.inputs.colors.colorIdentity ? card.colorIdentity : card.colors
	let colorMatcher;
	if (state.inputs.colors.excludeUnselected && state.inputs.colors.requireAll) {
		colorMatcher = card => {
			return ["W", "U", "B", "R", "G"].filter(color => state.inputs.colors[color] === false).some(selectedColor => (cardColors(card) && cardColors(card).includes(selectedColor))) == false
				&& ["W", "U", "B", "R", "G"].filter(color => state.inputs.colors[color]).every(selectedColor => (cardColors(card) && cardColors(card).includes(selectedColor)))
		};
	}
	else if (state.inputs.colors.excludeUnselected) {
		colorMatcher = card => ["W", "U", "B", "R", "G"].filter(color => state.inputs.colors[color] === false).some(selectedColor => (cardColors(card) && cardColors(card).includes(selectedColor))) == false
	}
	else if (["W", "U", "B", "R", "G"].some(color => state.inputs.colors[color]) == false) {
		colorMatcher = card => true;
	}
	else if (state.inputs.colors.requireAll) {
		colorMatcher = card => ["W", "U", "B", "R", "G"].filter(color => state.inputs.colors[color]).every(selectedColor => (cardColors(card) && cardColors(card).includes(selectedColor)))
	}
	else {
		colorMatcher = card => ["W", "U", "B", "R", "G"].filter(color => state.inputs.colors[color]).some(selectedColor => (cardColors(card) && cardColors(card).includes(selectedColor)))
	}
	return colorMatcher;
}

function sortFunction(c1, c2, sortCriteria) {
	let field1;
	let field2;
	for (let i = 0; i < sortCriteria.length; i++) {
		if (sortCriteria[i].by === "name") {
			field1 = c1.name;	// All cards have names, that's one of the few things that's guaranteed
			field2 = c2.name;
		}
		else if (sortCriteria[i].by === "color") {
			field1 = c1.colors === undefined ? "" : c1.colors.join("");
			field2 = c2.colors === undefined ? "" : c2.colors.join("");
		}
		else if (sortCriteria[i].by === "cmc") {
			field1 = c1.cmc || 0;
			field2 = c2.cmc || 0;
		}
		else if (sortCriteria[i].by === "power") {
			field1 = c1.power === "*" ? 0 : parseInt(c1.power);
			field2 = c2.power === "*" ? 0 : parseInt(c2.power);
		}
		else if (sortCriteria[i].by === "toughness") {
			field1 = c1.toughness === "*" ? 0 : parseInt(c1.toughness);
			field2 = c2.toughness === "*" ? 0 : parseInt(c2.toughness);
		}
		else if (sortCriteria[i].by === "loyalty") {
			field1 = c1.loyalty === "X" ? 0 : parseInt(c1.loyalty);
			field2 = c2.loyalty === "X" ? 0 : parseInt(c2.loyalty);
		}
		else if (sortCriteria[i].by === "price") {
			field1 = c1.priceInfo ? c1.priceInfo.price : NaN;
			field2 = c2.priceInfo ? c2.priceInfo.price : NaN;
		}

		/**
		 * if doing a numerical sort, return all NaN values last regardless of
		 * sort order.  That's what the first 3 checks are for
		 */
		if (Number.isNaN(field1) && Number.isNaN(field2)) {
			break;
		}
		else if (!Number.isNaN(field1) && Number.isNaN(field2)) {
			return -1;
		}
		else if (Number.isNaN(field1) && !Number.isNaN(field2)) {
			return 1;
		}
		else if (field1 > field2) {
			return sortCriteria[i].order;
		}
		else if (field1 < field2) {
			return sortCriteria[i].order * -1;
		}
	}
	return 0;
}

function filterAndRenderCards() {
	let nameFilter = new RegExp(state.inputs.name, "i");
	let textFilter = new RegExp(state.inputs.text, "i");
	let typesFilters = state.inputs.types.split(" ").map(token => new RegExp(token, "i"));
	// for each space-separated token that the user supplies for type, I want to make sure that that type is matched by the card's type

	let colorMatcher = createColorMatcherFunction();
	function formatMatcher(legalities) {
		if (state.inputs.format === "All") return true;
		if (legalities === undefined || legalities[state.inputs.format] === undefined) return false;
		return legalities[state.inputs.format] === "Legal" || legalities[state.inputs.format] === "Restricted" || legalities[state.inputs.format] === "Future"
	}

	function cmcRangeChecker(cmc) {
		let bigger = Math.max(state.inputs.cmc1, state.inputs.cmc2);
		let smaller = Math.min(state.inputs.cmc1, state.inputs.cmc2);
		if (smaller == 0 && bigger == 16) {
			return true;
		} else if (cmc === undefined) {
			return false;
		}
		else {
			return smaller <= cmc && cmc <= bigger
		}
	}
	function powerRangeChecker(power) {
		let bigger = Math.max(state.inputs.power1, state.inputs.power2);
		let smaller = Math.min(state.inputs.power1, state.inputs.power2);
		if (smaller == -1 && bigger == 15) {
			return true;
		} else if (power === undefined) {
			return false;
		}
		else {
			return smaller <= power && power <= bigger
		}
	}
	function toughnessRangeChecker(toughness) {
		let bigger = Math.max(state.inputs.toughness1, state.inputs.toughness2);
		let smaller = Math.min(state.inputs.toughness1, state.inputs.toughness2);
		if (smaller == -1 && bigger == 15) {
			return true;
		} else if (toughness === undefined) {
			return false;
		}
		else {
			return smaller <= toughness && toughness <= bigger
		}
	}

	function priceRangeChecker(price) {
		let bigger = Math.max(state.inputs.price1, state.inputs.price2);
		let smaller = Math.min(state.inputs.price1, state.inputs.price2);
		if (smaller == 0 && bigger == 2000) {
			return true;
		} else if (price === undefined) {
			return false;
		}
		else {
			return smaller <= price && price <= bigger
		}
	}

	state.searchResults = state.allCards
		.filter(card =>
			nameFilter.test(card.name) &&
			textFilter.test(card.text) &&
			typesFilters.map(typeFilter => typeFilter.test(card.type)).reduce((b1, b2) => b1 && b2, true) &&
			colorMatcher(card) &&
			formatMatcher(card.legalities) &&
			cmcRangeChecker(card.convertedManaCost) &&
			powerRangeChecker(card.power) &&
			toughnessRangeChecker(card.toughness) &&
			priceRangeChecker(card.priceInfo ? card.priceInfo.price : undefined)
		);
	state.pageNumberZeroIndexed = 0;
	renderCards(state);
}

function sortAndRefilter() {
	state.allCards.sort((c1, c2) => sortFunction(c1, c2, state.inputs.sort));
	filterAndRenderCards();
}

function modifyPowerLabel() {
	let bigger = Math.max(state.inputs.power1, state.inputs.power2);
	let smaller = Math.min(state.inputs.power1, state.inputs.power2);
	let power = "";
	if (smaller == -1 && bigger == 15) {
		power = "Any";
	} else if (smaller == bigger) {
		power = smaller;
	} else {
		power = smaller + " to " + bigger;
	}
	document.getElementById("power-label").innerHTML = "Power: " + power;
}

function modifyToughnessLabel() {
	let bigger = Math.max(state.inputs.toughness1, state.inputs.toughness2);
	let smaller = Math.min(state.inputs.toughness1, state.inputs.toughness2);
	let toughness = "";
	if (smaller == -1 && bigger == 15) {
		toughness = "Any";
	} else if (smaller == bigger) {
		toughness = smaller;
	} else {
		toughness = smaller + " to " + bigger;
	}
	document.getElementById("toughness-label").innerHTML = "Toughness: " + toughness;
}

function modifyPriceLabel() {
	let bigger = Math.max(state.inputs.price1, state.inputs.price2);
	let smaller = Math.min(state.inputs.price1, state.inputs.price2);
	let price = "";
	if (smaller == 0 && bigger == 2000) {
		price = "Any";
	} else if (smaller == bigger) {
		price = smaller;
	} else {
		price = smaller + " to " + bigger;
	}
	document.getElementById("price-label").innerHTML = "Price: " + price;
}

function modifyCmcLabel() {
	let bigger = Math.max(state.inputs.cmc1, state.inputs.cmc2);
	let smaller = Math.min(state.inputs.cmc1, state.inputs.cmc2);
	let cmc = "";
	if (smaller == 0 && bigger == 16) {
		cmc = "Any";
	} else if (smaller == bigger) {
		cmc = smaller;
	} else {
		cmc = smaller + " to " + bigger;
	}
	document.getElementById("cmc-label").innerHTML = "CMC: " + cmc;
}

function checkDisableExcludeUnselected() {
	
	if (document.getElementById("color-identity").checked == true) {
		document.getElementById("exclude-unselected").checked = true;
		document.getElementById("exclude-unselected").disabled = true;
	}
	else {
		document.getElementById("exclude-unselected").checked = false;
		document.getElementById("exclude-unselected").disabled = false;
	}
}

(function addAllEventListeners() {
	document.getElementById("previous").addEventListener("click", function () {
		state.pageNumberZeroIndexed = Math.max(state.pageNumberZeroIndexed - 1, 0);
		renderCards(state);
	});

	document.getElementById("next").addEventListener("click", function () {
		state.pageNumberZeroIndexed = Math.min(state.pageNumberZeroIndexed + 1, Math.floor(state.searchResults.length / cardsPerPage));
		renderCards(state);
	});

	document.getElementById("first").addEventListener("click", function () {
		state.pageNumberZeroIndexed = 0;
		renderCards(state);
	});

	document.getElementById("last").addEventListener("click", function () {
		state.pageNumberZeroIndexed = Math.floor(state.searchResults.length / cardsPerPage);
		renderCards(state);
	});

	document.getElementById("previous-bottom").addEventListener("click", function () {
		state.pageNumberZeroIndexed = Math.max(state.pageNumberZeroIndexed - 1, 0);
		renderCards(state);
		window.scrollTo(0, 0);
	});

	document.getElementById("next-bottom").addEventListener("click", function () {
		state.pageNumberZeroIndexed = Math.min(state.pageNumberZeroIndexed + 1, Math.floor(state.searchResults.length / cardsPerPage));
		renderCards(state);
		window.scrollTo(0, 0);
	});

	document.getElementById("first-bottom").addEventListener("click", function () {
		state.pageNumberZeroIndexed = 0;
		renderCards(state);
		window.scrollTo(0, 0);
	});

	document.getElementById("last-bottom").addEventListener("click", function () {
		state.pageNumberZeroIndexed = Math.floor(state.searchResults.length / cardsPerPage);
		renderCards(state);
		window.scrollTo(0, 0);
	});


	document.getElementById("name-input").addEventListener("input", function (event) {
		state.inputs.name = event.target.value;
		filterAndRenderCards();
	});

	document.getElementById("text-input").addEventListener("input", function (event) {
		state.inputs.text = event.target.value;
		filterAndRenderCards();
	});

	document.getElementById("types-input").addEventListener("input", function (event) {
		state.inputs.types = event.target.value;
		filterAndRenderCards();
	});

	["W", "U", "B", "R", "G"].forEach(symbol => {
		document.getElementById(symbol).addEventListener("change", function (event) {
			state.inputs.colors[symbol] = event.target.checked;
			filterAndRenderCards();
		});
	});

	document.getElementById("require-all").addEventListener("change", function (event) {
		state.inputs.colors.requireAll = event.target.checked;
		filterAndRenderCards();
	});

	document.getElementById("exclude-unselected").addEventListener("change", function (event) {
		state.inputs.colors.excludeUnselected = event.target.checked;
		filterAndRenderCards();
	});

	document.getElementById("color-identity").addEventListener("change", function (event) {
		state.inputs.colors.colorIdentity = event.target.checked;

		checkDisableExcludeUnselected();

		filterAndRenderCards();
	});

	document.getElementById("format-input").addEventListener("change", function (event) {
		state.inputs.format = event.target.value;
		filterAndRenderCards();
	});

	document.getElementById("sort-primary").addEventListener("change", function (event) {
		state.inputs.sort[0] = sortDropdownConverter(event.target.value);
		sortAndRefilter();
	});

	document.getElementById("sort-secondary").addEventListener("change", function (event) {
		state.inputs.sort[1] = sortDropdownConverter(event.target.value);
		sortAndRefilter();
	});

	document.getElementById("cmc-input1").addEventListener("change", function (event) {
		state.inputs.cmc1 = event.target.value;
		modifyCmcLabel();
		filterAndRenderCards();
	});
	document.getElementById("cmc-input2").addEventListener("change", function (event) {
		state.inputs.cmc2 = event.target.value;
		modifyCmcLabel();
		filterAndRenderCards();
	});
	document.getElementById("cmc-input1").addEventListener("input", function (event) {
		state.inputs.cmc1 = event.target.value;
		modifyCmcLabel();
	});
	document.getElementById("cmc-input2").addEventListener("input", function (event) {
		state.inputs.cmc2 = event.target.value;
		modifyCmcLabel();
	});

	document.getElementById("power-input1").addEventListener("change", function (event) {
		state.inputs.power1 = event.target.value;
		modifyPowerLabel();
		filterAndRenderCards();
	});
	document.getElementById("power-input2").addEventListener("change", function (event) {
		state.inputs.power2 = event.target.value;
		modifyPowerLabel();
		filterAndRenderCards();
	});
	document.getElementById("power-input1").addEventListener("input", function (event) {
		state.inputs.power1 = event.target.value;
		modifyPowerLabel();
	});
	document.getElementById("power-input2").addEventListener("input", function (event) {
		state.inputs.power2 = event.target.value;
		modifyPowerLabel();
	});

	document.getElementById("toughness-input1").addEventListener("change", function (event) {
		state.inputs.toughness1 = event.target.value;
		modifyToughnessLabel();
		filterAndRenderCards();
	});
	document.getElementById("toughness-input2").addEventListener("change", function (event) {
		state.inputs.toughness2 = event.target.value;
		modifyToughnessLabel();
		filterAndRenderCards();
	});
	document.getElementById("toughness-input1").addEventListener("input", function (event) {
		state.inputs.toughness1 = event.target.value;
		modifyToughnessLabel();
	});
	document.getElementById("toughness-input2").addEventListener("input", function (event) {
		state.inputs.toughness2 = event.target.value;
		modifyToughnessLabel();
	});

	document.getElementById("price-input1").addEventListener("change", function (event) {
		state.inputs.price1 = scalePrices(event.target.value);
		modifyPriceLabel();
		filterAndRenderCards();
	});
	document.getElementById("price-input2").addEventListener("change", function (event) {
		state.inputs.price2 = scalePrices(event.target.value);
		modifyPriceLabel();
		filterAndRenderCards();
	});
	document.getElementById("price-input1").addEventListener("input", function (event) {
		state.inputs.price1 = scalePrices(event.target.value);
		modifyPriceLabel();
	});
	document.getElementById("price-input2").addEventListener("input", function (event) {
		state.inputs.price2 = scalePrices(event.target.value);
		modifyPriceLabel();
	});

	document.getElementById("results").addEventListener("click", function (event) {
		// We essentially want event listeners on buttons.  But we're in a pickle because buttons
		// constantly get deleted and readded to the dom.  It's annoying to have to re-attach event
		// listeners every time, so instead we have one listener on the parent element and then test
		// to see if a click was on a button or not
		if (event.target.tagName == "BUTTON") {
			changeTab(event.target);
		}
	});
})();

function scalePrices(rawInput) {
	scale = {
		0: 0,
		1: .25,
		2: 1,
		3: 2.50,
		4: 5,
		5: 10,
		6: 25,
		7: 50,
		8: 100,
		9: 500,
		10: 2000,
	}
	return scale[rawInput];
}

function sortDropdownConverter(value) {
	let parts = value.split(" ");
	return {
		by: parts[0].toLowerCase(),
		order: parts[1] === "(Ascending)" ? 1 : -1
	};
}

(function setInitialState() {
	state.inputs.name = document.getElementById("name-input").value;
	state.inputs.text = document.getElementById("text-input").value;
	state.inputs.types = document.getElementById("types-input").value;
	["W", "U", "B", "R", "G"].forEach(symbol => {
		state.inputs.colors[symbol] = document.getElementById(symbol).checked
	});
	state.inputs.colors.requireAll = document.getElementById("require-all").checked;
	state.inputs.colors.excludeUnselected = document.getElementById("exclude-unselected").checked;
	state.inputs.colors.colorIdentity = document.getElementById("color-identity").checked;
	state.inputs.format = document.getElementById("format-input").value;
	state.inputs.sort[0] = sortDropdownConverter(document.getElementById("sort-primary").value);
	state.inputs.sort[1] = sortDropdownConverter(document.getElementById("sort-secondary").value);
	state.inputs.cmc1 = document.getElementById("cmc-input1").value;
	state.inputs.cmc2 = document.getElementById("cmc-input2").value;
	modifyCmcLabel();
	state.inputs.power1 = document.getElementById("power-input1").value;
	state.inputs.power2 = document.getElementById("power-input2").value;
	modifyPowerLabel();
	state.inputs.toughness1 = document.getElementById("toughness-input1").value;
	state.inputs.toughness2 = document.getElementById("toughness-input2").value;
	modifyToughnessLabel();
	state.inputs.price1 = scalePrices(document.getElementById("price-input1").value);
	state.inputs.price2 = scalePrices(document.getElementById("price-input2").value);
	modifyPriceLabel();
})();

callAjax("resources/cards.json", responseText => {
	state.allCards = JSON.parse(responseText);
	state.multiNameCards = {};
	state.allCards.filter(card => card.names != undefined).forEach(card => state.multiNameCards[card.name] = card);
	// localStorage.allCards = state.allCards;
	sortAndRefilter();

	// Prices get loaded from a separate JSON file.  Since we don't use them for sorting criteria (yet),
	// we can just rerender our results once we get price data to show prices too!
	callAjax("resources/SimplifiedPrices.json", responseText => {
		let prices = JSON.parse(responseText);
		state.allCards.forEach(card => {
			card.priceInfo = prices[getNameForTCGPlayer(card)];
		})
		renderCards(state);
		sortAndRefilter();
	});
});

var sets = {
    "LEA": "Alpha Edition",
    "LEB": "Beta Edition",
    "ARN": "Arabian Nights",
    "2ED": "Unlimited Edition",
    "CED": "Collector's Edition",
    "CEI": "International Collector's Edition",
    "pDRC": "Dragon Con",
    "ATQ": "Antiquities",
    "3ED": "Revised Edition",
    "LEG": "Legends",
    "DRK": "The Dark",
    "FEM": "Fallen Empires",
    "pMEI": "Media Promos",
    "pLGM": "Arena Promos",
    "4ED": "Fourth Edition",
    "ICE": "Ice Age",
    "CHR": "Chronicles",
    "HML": "Homelands",
    "ALL": "Alliances",
    "RQS": "Rivals Quick Start Set",
    "pARL": "Arena League",
    "pCEL": "Celebration",
    "MIR": "Mirage",
    "MGB": "Multiverse Gift Box",
    "ITP": "Introductory Two-Player Set",
    "VIS": "Visions",
    "5ED": "Fifth Edition",
    "pPOD": "Portal Demo Game",
    "POR": "Portal",
    "VAN": "Vanguard",
    "WTH": "Weatherlight",
    "pPRE": "Prerelease Cards",
    "TMP": "Tempest",
    "STH": "Stronghold",
    "PO2": "Portal Second Age",
    "pJGP": "Judge Promos",
    "EXO": "Exodus",
    "UGL": "Unglued",
    "pALP": "Asia Pacific Land Program",
    "USG": "Urza's Saga",
    "ATH": "Anthologies",
    "ULG": "Urza's Legacy",
    "6ED": "Classic Sixth Edition",
    "PTK": "Portal Three Kingdoms",
    "UDS": "Urza's Destiny",
    "S99": "Starter 1999",
    "pGRU": "Guru",
    "pWOR": "Worlds",
    "pWOS": "Wizards of the Coast Online Store",
    "MMQ": "Mercadian Masques",
    "BRB": "Battle Royale Box Set",
    "pSUS": "Super Series",
    "pFNM": "FNM Promos",
    "pELP": "European Land Program",
    "NMS": "Nemesis",
    "S00": "Starter 2000",
    "PCY": "Prophecy",
    "BTD": "Beatdown Box Set",
    "INV": "Invasion",
    "PLS": "Planeshift",
    "7ED": "7th Edition",
    "pMPR": "Magic Player Rewards",
    "APC": "Apocalypse",
    "ODY": "Odyssey",
    "DKM": "Deckmasters",
    "TOR": "Torment",
    "JUD": "Judgment",
    "ONS": "Onslaught",
    "LGN": "Legions",
    "SCG": "Scourge",
    "pREL": "Release Events",
    "8ED": "8th Edition",
    "MRD": "Mirrodin",
    "DST": "Darksteel",
    "5DN": "Fifth Dawn",
    "CHK": "Champions of Kamigawa",
    "UNH": "Unhinged",
    "BOK": "Betrayers of Kamigawa",
    "SOK": "Saviors of Kamigawa",
    "9ED": "9th Edition",
    "RAV": "Ravnica",
    "p2HG": "Two-Headed Giant Tournament",
    "pGTW": "Gateway",
    "GPT": "Guildpact",
    "pCMP": "Champs and States",
    "DIS": "Dissension",
    "CSP": "Coldsnap",
    "CST": "Coldsnap Theme Deck Reprints",
    "TSP": "Time Spiral",
    "TSB": "Timeshifted",
    "pHHO": "Happy Holidays",
    "PLC": "Planar Chaos",
    "pPRO": "Pro Tour",
    "pGPX": "Grand Prix",
    "FUT": "Future Sight",
    "10E": "10th Edition",
    "pMGD": "Magic Game Day",
    "MED": "Masters Edition",
    "LRW": "Lorwyn",
    "EVG": "Duel Decks: Elves vs. Goblins",
    "pLPA": "Launch Parties",
    "MOR": "Morningtide",
    "p15A": "15th Anniversary",
    "SHM": "Shadowmoor",
    "pSUM": "Summer of Magic",
    "EVE": "Eventide",
    "DRB": "From the Vault: Dragons",
    "ME2": "Masters Edition II",
    "pWPN": "Wizards Play Network",
    "ALA": "Shards of Alara",
    "DD2": "Duel Decks: Jace vs. Chandra",
    "CON": "Conflux",
    "DDC": "Duel Decks: Divine vs. Demonic",
    "ARB": "Alara Reborn",
    "M10": "Magic 2010 (M10)",
    "V09": "From the Vault: Exiled",
    "HOP": "Planechase",
    "ME3": "Masters Edition III",
    "ZEN": "Zendikar",
    "DDD": "Duel Decks: Garruk vs. Liliana",
    "H09": "Premium Deck Series: Slivers",
    "WWK": "Worldwake",
    "DDE": "Duel Decks: Phyrexia vs. the Coalition",
    "ROE": "Rise of the Eldrazi",
    "DPA": "Duels of the Planeswalkers",
    "ARC": "Archenemy",
    "M11": "Magic 2011 (M11)",
    "V10": "From the Vault: Relics",
    "DDF": "Duel Decks: Elspeth vs. Tezzeret",
    "SOM": "Scars of Mirrodin",
    "PD2": "Premium Deck Series: Fire and Lightning",
    "ME4": "Masters Edition IV",
    "MBS": "Mirrodin Besieged",
    "DDG": "Duel Decks: Knights vs. Dragons",
    "NPH": "New Phyrexia",
    "CMD": "Commander",
    "M12": "Magic 2012 (M12)",
    "V11": "From the Vault: Legends",
    "DDH": "Duel Decks: Ajani vs. Nicol Bolas",
    "ISD": "Innistrad",
    "PD3": "Premium Deck Series: Graveborn",
    "DKA": "Dark Ascension",
    "DDI": "Duel Decks: Venser vs. Koth",
    "AVR": "Avacyn Restored",
    "PC2": "Planechase 2012",
    "M13": "Magic 2013 (M13)",
    "V12": "From the Vault: Realms",
    "DDJ": "Duel Decks: Izzet vs. Golgari",
    "RTR": "Return to Ravnica",
    "CM1": "Commander's Arsenal",
    "GTC": "Gatecrash",
    "DDK": "Duel Decks: Sorin vs. Tibalt",
    "pWCQ": "World Magic Cup Qualifiers",
    "DGM": "Dragon's Maze",
    "MMA": "Modern Masters",
    "M14": "Magic 2014 (M14)",
    "V13": "From the Vault: Twenty",
    "DDL": "Duel Decks: Heroes vs. Monsters",
    "THS": "Theros",
    "C13": "Commander 2013",
    "BNG": "Born of the Gods",
    "DDM": "Duel Decks: Jace vs. Vraska",
    "JOU": "Journey into Nyx",
    "MD1": "Magic Modern Event Deck",
    "CNS": "Conspiracy",
    "VMA": "Vintage Masters",
    "M15": "Magic 2015 (M15)",
    "CPK": "Unique and Miscellaneous Promos",
    "V14": "From the Vault: Annihilation",
    "DDN": "Duel Decks: Speed vs. Cunning",
    "KTK": "Khans of Tarkir",
    "C14": "Commander 2014",
    "DD3_DVD": "Duel Decks: Anthology",
    "DD3_EVG": "Duel Decks: Anthology",
    "DD3_GVL": "Duel Decks: Anthology",
    "DD3_JVC": "Duel Decks: Anthology",
    "FRF_UGIN": "Ugin's Fate promos",
    "FRF": "Fate Reforged",
    "DDO": "Duel Decks: Elspeth vs. Kiora",
    "DTK": "Dragons of Tarkir",
    "TPR": "Tempest Remastered",
    "MM2": "Modern Masters 2015",
    "ORI": "Magic Origins",
    "V15": "From the Vault: Angels",
    "DDP": "Duel Decks: Zendikar vs. Eldrazi",
    "BFZ": "Battle for Zendikar",
    "EXP": "Zendikar Expeditions",
    "C15": "Commander 2015",
    "OGW": "Oath of the Gatewatch",
    "DDQ": "Duel Decks: Blessed vs. Cursed",
    "W16": "Welcome Deck 2016",
    "SOI": "Shadows over Innistrad",
    "EMA": "Eternal Masters",
    "EMN": "Eldritch Moon",
    "V16": "From the Vault: Lore",
    "CN2": "Conspiracy: Take the Crown",
    "DDR": "Duel Decks: Nissa vs. Ob Nixilis",
    "KLD": "Kaladesh",
    "MPS": "Masterpiece Series: Kaladesh Inventions",
    "C16": "Commander 2016",
    "PCA": "Planechase Anthology",
    "AER": "Aether Revolt",
    "MM3": "Modern Masters 2017",
    "DDS": "Duel Decks: Mind vs. Might",
    "AKH": "Amonkhet",
    "MPS_AKH": "Masterpiece Series: Amonkhet Invocations",
    "HOU": "Hour of Devastation",
    "E01": "Archenemy: Nicol Bolas",
    "C17": "Commander 2017",
    "XLN": "Ixalan",
    "CMA": "Commander Anthology",
    "UST": "Unstable",
    "IMA": "Iconic Masters",
    "A25": "Masters 25",
    "E02": "Explorers of Ixalan",
    "V17": "From the Vault: Transform",
    "DDU": "Duel Decks: Elves vs. Inventors",
    "DDT": "Duel Decks: Merfolk vs. Goblins",
    "W17": "Welcome Deck 2017",
    "RIX": "Rivals of Ixalan",
    "DOM": "Dominaria",
    "CP3": "Magic Origins Clash Pack",
    "CP2": "Fate Reforged Clash Pack",
    "CP1": "Magic 2015 Clash Pack",
    "GS1": "Global Series: Jiang Yanggu and Mu Yanling",
    "SS1": "Signature Spellbook: Jace",
    "CM2": "Commander Anthology 2018",
    "C18": "Commander 2018",
    "M19": "Core Set 2019",
    "BBD": "Battlebond",
    "GRN": "Guilds of Ravnica",
    "ANA": "Arena New Player Experience",
    "DD1": "Duel Decks: Elves vs. Goblins",
    "DVD": "Duel Decks Anthology: Divine vs. Demonic",
    "F01": "Friday Night Magic 2001",
    "F02": "Friday Night Magic 2002",
    "F03": "Friday Night Magic 2003",
    "F04": "Friday Night Magic 2004",
    "F05": "Friday Night Magic 2005",
    "F06": "Friday Night Magic 2006",
    "F07": "Friday Night Magic 2007",
    "F08": "Friday Night Magic 2008",
    "F09": "Friday Night Magic 2009",
    "F10": "Friday Night Magic 2010",
    "F11": "Friday Night Magic 2011",
    "F12": "Friday Night Magic 2012",
    "F13": "Friday Night Magic 2013",
    "F14": "Friday Night Magic 2014",
    "F15": "Friday Night Magic 2015",
    "F16": "Friday Night Magic 2016",
    "F17": "Friday Night Magic 2017",
    "F18": "Friday Night Magic 2018",
    "FBB": "Foreign Black Border",
    "FNM": "Friday Night Magic 2000",
    "G00": "Judge Gift Cards 2000",
    "G01": "Judge Gift Cards 2001",
    "G02": "Judge Gift Cards 2002",
    "G03": "Judge Gift Cards 2003",
    "G04": "Judge Gift Cards 2004",
    "G05": "Judge Gift Cards 2005",
    "G06": "Judge Gift Cards 2006",
    "G07": "Judge Gift Cards 2007",
    "G08": "Judge Gift Cards 2008",
    "G09": "Judge Gift Cards 2009",
    "G10": "Judge Gift Cards 2010",
    "G11": "Judge Gift Cards 2011",
    "G17": "2017 Gift Pack",
    "G18": "M19 Gift Pack",
    "G99": "Judge Gift Cards 1999",
    "GK1": "GRN Guild Kit",
    "GK2": "RNA Guild Kit",
    "GNT": "Game Night",
    "GVL": "Duel Decks Anthology: Garruk vs. Liliana",
    "H17": "HasCon 2017",
    "HHO": "Happy Holidays",
    "HTR": "2016 Heroes of the Realm",
    "HTR17": "2017 Heroes of the Realm",
    "J12": "Judge Gift Cards 2012",
    "J13": "Judge Gift Cards 2013",
    "J14": "Judge Gift Cards 2014",
    "J15": "Judge Gift Cards 2015",
    "J16": "Judge Gift Cards 2016",
    "J17": "Judge Gift Cards 2017",
    "J18": "Judge Gift Cards 2018",
    "JGP": "Judge Gift Cards 1998",
    "JVC": "Duel Decks Anthology: Jace vs. Chandra",
    "L12": "League Tokens 2012",
    "L13": "League Tokens 2013",
    "L14": "League Tokens 2014",
    "L15": "League Tokens 2015",
    "L16": "League Tokens 2016",
    "L17": "League Tokens 2017",
    "ME1": "Masters Edition",
    "MP2": "Amonkhet Invocations",
    "MPR": "Magic Player Rewards 2001",
    "NEM": "Nemesis",
    "OARC": "Archenemy Schemes",
    "OC13": "Commander 2013 Oversized",
    "OC14": "Commander 2014 Oversized",
    "OC15": "Commander 2015 Oversized",
    "OC16": "Commander 2016 Oversized",
    "OC17": "Commander 2017 Oversized",
    "OC18": "Commander 2018 Oversized",
    "OCM1": "Commander's Arsenal Oversized",
    "OCMD": "Commander 2011 Oversized",
    "OE01": "Archenemy: Nicol Bolas Schemes",
    "OHOP": "Planechase Planes",
    "OLGC": "Legacy Championship",
    "OPC2": "Planechase 2012 Planes",
    "OPCA": "Planechase Anthology Planes",
    "OVNT": "Vintage Championship",
    "P02": "Portal Second Age",
    "P03": "Magic Player Rewards 2003",
    "P04": "Magic Player Rewards 2004",
    "P05": "Magic Player Rewards 2005",
    "P06": "Magic Player Rewards 2006",
    "P07": "Magic Player Rewards 2007",
    "P08": "Magic Player Rewards 2008",
    "P09": "Magic Player Rewards 2009",
    "P10": "Magic Player Rewards 2010",
    "P10E": "Tenth Edition Promos",
    "P11": "Magic Player Rewards 2011",
    "P15A": "15th Anniversary Cards",
    "P2HG": "Two-Headed Giant Tournament",
    "PAER": "Aether Revolt Promos",
    "PAKH": "Amonkhet Promos",
    "PAL00": "Arena League 2000",
    "PAL01": "Arena League 2001",
    "PAL02": "Arena League 2002",
    "PAL03": "Arena League 2003",
    "PAL04": "Arena League 2004",
    "PAL05": "Arena League 2005",
    "PAL06": "Arena League 2006",
    "PAL99": "Arena League 1999",
    "PALP": "Asia Pacific Land Program",
    "PARC": "Promotional Schemes",
    "PARL": "Arena League 1996",
    "PAVR": "Avacyn Restored Promos",
    "PBBD": "Battlebond Promos",
    "PBFZ": "Battle for Zendikar Promos",
    "PBNG": "Born of the Gods Promos",
    "PBOK": "Miscellaneous Book Promos",
    "PCEL": "Celebration Cards",
    "PCMD": "Commander 2011 Launch Party",
    "PCMP": "Champs and States",
    "PDD2": "Duel Decks: Jace vs. Chandra Japanese Promos",
    "PDGM": "Dragon's Maze Promos",
    "PDKA": "Dark Ascension Promos",
    "PDOM": "Dominaria Promos",
    "PDP10": "Duels of the Planeswalkers Promos 2010",
    "PDP11": "Duels of the Planeswalkers Promos 2011",
    "PDP12": "Duels of the Planeswalkers Promos 2012",
    "PDP13": "Duels of the Planeswalkers Promos 2013",
    "PDP14": "Duels of the Planeswalkers Promos 2014",
    "PDRC": "Dragon Con",
    "PDTK": "Dragons of Tarkir Promos",
    "PDTP": "Duels of the Planeswalkers Promos 2009",
    "PELP": "European Land Program",
    "PEMN": "Eldritch Moon Promos",
    "PF19": "MagicFest 2019",
    "PFRF": "Fate Reforged Promos",
    "PG07": "Gateway 2007",
    "PG08": "Gateway 2008",
    "PGPX": "Grand Prix Promos",
    "PGRN": "Guilds of Ravnica Promos",
    "PGRU": "Guru",
    "PGTC": "Gatecrash Promos",
    "PGTW": "Gateway 2006",
    "PHEL": "Open the Helvault",
    "PHOP": "Promotional Planes",
    "PHOU": "Hour of Devastation Promos",
    "PHPR": "HarperPrism Book Promos",
    "PHUK": "Hachette UK",
    "PI13": "IDW Comics 2013",
    "PI14": "IDW Comics 2014",
    "PIDW": "IDW Comics 2012",
    "PISD": "Innistrad Promos",
    "PJAS": "Junior APAC Series",
    "PJJT": "Japan Junior Tournament",
    "PJOU": "Journey into Nyx Promos",
    "PJSE": "Junior Series Europe",
    "PKLD": "Kaladesh Promos",
    "PKTK": "Khans of Tarkir Promos",
    "PLGM": "DCI Legend Membership",
    "PLNY": "2018 Lunar New Year",
    "PLPA": "Launch Parties",
    "PM10": "Magic 2010 Promos",
    "PM11": "Magic 2011 Promos",
    "PM12": "Magic 2012 Promos",
    "PM13": "Magic 2013 Promos",
    "PM14": "Magic 2014 Promos",
    "PM15": "Magic 2015 Promos",
    "PM19": "Core Set 2019 Promos",
    "PMBS": "Mirrodin Besieged Promos",
    "PMEI": "Magazine Inserts",
    "PMOA": "Magic Online Avatars",
    "PMPS": "Magic Premiere Shop 2005",
    "PMPS06": "Magic Premiere Shop 2006",
    "PMPS07": "Magic Premiere Shop 2007",
    "PMPS08": "Magic Premiere Shop 2008",
    "PMPS09": "Magic Premiere Shop 2009",
    "PMPS10": "Magic Premiere Shop 2010",
    "PMPS11": "Magic Premiere Shop 2011",
    "PNAT": "Nationals Promos",
    "PNPH": "New Phyrexia Promos",
    "POGW": "Oath of the Gatewatch Promos",
    "PORI": "Magic Origins Promos",
    "PPC1": "M15 Prerelease Challenge",
    "PPOD": "Portal Demo Game",
    "PPRE": "Prerelease Events",
    "PPRO": "Pro Tour Promos",
    "PR2": "Magic Player Rewards 2002",
    "PRED": "Redemption Program",
    "PREL": "Release Events",
    "PRES": "Resale Promos",
    "PRIX": "Rivals of Ixalan Promos",
    "PRM": "Magic Online Promos",
    "PRN": "Ravnica Allegiance Promos",
    "PROE": "Rise of the Eldrazi Promos",
    "PRTR": "Return to Ravnica Promos",
    "PRW2": "RNA Ravnica Weekend",
    "PRWK": "GRN Ravnica Weekend",
    "PS11": "Salvat 2011",
    "PS14": "San Diego Comic-Con 2014",
    "PS15": "San Diego Comic-Con 2015",
    "PS16": "San Diego Comic-Con 2016",
    "PS17": "San Diego Comic-Con 2017",
    "PS18": "San Diego Comic-Con 2018",
    "PSAL": "Salvat 2005",
    "PSDC": "San Diego Comic-Con 2013",
    "PSOI": "Shadows over Innistrad Promos",
    "PSOM": "Scars of Mirrodin Promos",
    "PSS1": "BFZ Standard Series",
    "PSS2": "XLN Standard Showdown",
    "PSS3": "M19 Standard Showdown",
    "PSUM": "Summer of Magic",
    "PSUS": "Junior Super Series",
    "PTC": "Pro Tour Collector Set",
    "PTHS": "Theros Promos",
    "PTKDF": "Tarkir Dragonfury",
    "PUMA": "Ultimate Box Topper",
    "PURL": "URL/Convention Promos",
    "PUST": "Unstable Promos",
    "PVAN": "Vanguard Series",
    "PWCQ": "World Magic Cup Qualifiers",
    "PWOR": "Worlds",
    "PWOS": "Wizards of the Coast Online Store",
    "PWP09": "Wizards Play Network 2009",
    "PWP10": "Wizards Play Network 2010",
    "PWP11": "Wizards Play Network 2011",
    "PWP12": "Wizards Play Network 2012",
    "PWPN": "Wizards Play Network 2008",
    "PWWK": "Worldwake Promos",
    "PXLN": "Ixalan Promos",
    "PXTC": "XLN Treasure Chest",
    "PZ1": "Legendary Cube",
    "PZ2": "You Make the Cube",
    "PZEN": "Zendikar Promos",
    "REN": "Renaissance",
    "RIN": "Rinascimento",
    "RNA": "Ravnica Allegiance",
    "SUM": "Summer Magic / Edgar",
    "TBTH": "Battle the Horde",
    "TD0": "Magic Online Theme Decks",
    "TD2": "Duel Decks: Mirrodin Pure vs. New Phyrexia",
    "TDAG": "Defeat a God",
    "TFTH": "Face the Hydra",
    "THP1": "Theros Hero's Path",
    "THP2": "Born of the Gods Hero's Path",
    "THP3": "Journey into Nyx Hero's Path",
    "UGIN": "Ugin's Fate",
    "UMA": "Ultimate Masters",
    "WC00": "World Championship Decks 2000",
    "WC01": "World Championship Decks 2001",
    "WC02": "World Championship Decks 2002",
    "WC03": "World Championship Decks 2003",
    "WC04": "World Championship Decks 2004",
    "WC97": "World Championship Decks 1997",
    "WC98": "World Championship Decks 1998",
    "WC99": "World Championship Decks 1999"
};