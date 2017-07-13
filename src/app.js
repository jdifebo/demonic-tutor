let state = {
	allCards: [],
	prices: {},
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
function changeTab(element, cardName){
	element.outerHTML = renderSingleCard(state.multiNameCards[cardName]);
	addButtonEventListeners();
}

function addButtonEventListeners(){
	var buttons = document.getElementsByClassName("multi-card-button");
	for (let i = 0; i < buttons.length; i++){
		buttons[i].addEventListener("click", event => {
			// LOL
			let parentCardSection = event.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
			changeTab(parentCardSection, event.currentTarget.innerHTML.trim());
		});
	}
}

function renderMultiCardTabs(card) {
	if (card.names == undefined){
		return "";
	}

	let navItems = card.names.map(name => {
		let primaryText = name == card.name ? "btn-primary" : "btn-secondary"
		return `
		<div class="col">
			<button type="button" class="btn ` + primaryText + ` btn-sm btn-block multi-card-button">
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

function renderSingleCard(card) {
	let imgSrc = "http://gatherer.wizards.com/Handlers/Image.ashx?name=" + (card.image ? card.image : card.name) + "&type=card&.jpg";
	let name = card.name;
	let manaCostSymbols = card.manaCost ? card.manaCost.substring(1, card.manaCost.length - 1).split("}{") : [];
	let manaCostImages = manaCostSymbols.map(symbol => renderManaSymbol(symbol)).join("");
	let cmc = card.cmc || 0;
	let type = card.type;
	let ptOrLoyalty = "";
	let printingsText;
	let printingsHover = card.printings.map(code => sets[code]).join("\n");
	let referralLink = "";
	let tcgPriceInfo = state.prices[getNameForTCGPlayer(card)];
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
	addButtonEventListeners();
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
	function formatMatcher(formats) {
		return (formats !== undefined && formats[state.inputs.format] !== undefined &&
			(formats[state.inputs.format] === "Legal" || formats[state.inputs.format] === "Restricted")) || state.inputs.format === "All"
	}

	state.searchResults = state.allCards
		.filter(card =>
			nameFilter.test(card.name) &&
			textFilter.test(card.text) &&
			typesFilters.map(typeFilter => typeFilter.test(card.type)).reduce((b1, b2) => b1 && b2, true) &&
			colorMatcher(card) &&
			formatMatcher(card.formats)
		);
	state.pageNumberZeroIndexed = 0;
	renderCards(state);
}

function sortAndRefilter() {
	state.allCards.sort((c1, c2) => sortFunction(c1, c2, state.inputs.sort));
	filterAndRenderCards();
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
})();

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
		state.prices = JSON.parse(responseText);
		renderCards(state);
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
  "HOU": "Hour of Devastation"
}