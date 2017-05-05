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
			colorIdentity: false
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

function renderSingleCard(card) {
	let imgSrc = "http://gatherer.wizards.com/Handlers/Image.ashx?name=" + (card.image ? card.image : card.name) + "&type=card&.jpg";
	let name = card.name;
	let manaCostSymbols = card.manaCost ? card.manaCost.substring(1, card.manaCost.length - 1).split("}{") : [];
	let manaCostImages = manaCostSymbols.map(symbol => renderManaSymbol(symbol)).join("");
	let cmc = card.cmc || 0;
	let type = card.type;
	let ptOrLoyalty = "";
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
                            <div class="card-header">
                                <div class="row">
                                    <div class="col-6">
                                        <b>` + name + `</b>
                                    </div>
                                    <div class="col-4">
                                        ` + manaCostImages + `
                                    </div>
                                    <div class="col-2">
                                        (` + cmc + `)
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        ` + type + ` ` + ptOrLoyalty + `
                                    </div>
                                </div>
                            </div>
                            <div class="card-block">
								` + renderedText + `
                            </div>
                        </div>
                    </div>
                </div>
				<br />
	`
}

function renderCards(state) {
	let startCard = state.pageNumberZeroIndexed * cardsPerPage;
	let endCard = Math.min(startCard + cardsPerPage, state.searchResults.length);

	let cardsToDisplay = state.searchResults.slice(startCard, endCard);

	let renderedCards = cardsToDisplay.map(renderSingleCard).join("")

	document.getElementById("results").innerHTML = renderedCards;
	document.getElementById("results-count").innerHTML = 
		"Showing " + 
		(state.searchResults.length > 0 ? (startCard + 1) + " - " + endCard + " of " : "")
		 + state.searchResults.length + " results";
	if (state.searchResults.length <= cardsPerPage){
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
	let colorMatcher;
	if (state.inputs.colors.excludeUnselected && state.inputs.colors.requireAll) {
		colorMatcher = card => {
			return ["W", "U", "B", "R", "G"].filter(color => state.inputs.colors[color] === false).some(selectedColor => (card.colors && card.colors.includes(selectedColor))) == false
				&& ["W", "U", "B", "R", "G"].filter(color => state.inputs.colors[color]).every(selectedColor => (card.colors && card.colors.includes(selectedColor)))
		};
	}
	else if (state.inputs.colors.excludeUnselected) {
		colorMatcher = card => ["W", "U", "B", "R", "G"].filter(color => state.inputs.colors[color] === false).some(selectedColor => (card.colors && card.colors.includes(selectedColor))) == false
	}
	else if (["W", "U", "B", "R", "G"].some(color => state.inputs.colors[color]) == false) {
		colorMatcher = card => true;
	}
	else if (state.inputs.colors.requireAll) {
		colorMatcher = card => ["W", "U", "B", "R", "G"].filter(color => state.inputs.colors[color]).every(selectedColor => (card.colors && card.colors.includes(selectedColor)))
	}
	else {
		colorMatcher = card => ["W", "U", "B", "R", "G"].filter(color => state.inputs.colors[color]).some(selectedColor => (card.colors && card.colors.includes(selectedColor)))
	}
	return colorMatcher;
}

function sortFunction(c1, c2, sortCriteria) {
	let field1;
	let field2;
	for (let i = 0; i < sortCriteria.length; i++) {
		if (sortCriteria[i].by === "name"){
			field1 = c1.name;	// All cards have names, that's one of the few things that's guaranteed
			field2 = c2.name;
		}
		else if (sortCriteria[i].by === "color"){
			field1 = c1.colors === undefined ? "" : c1.colors.join("");
			field2 = c2.colors === undefined ? "" : c2.colors.join("");
		}
		else if (sortCriteria[i].by === "cmc"){
			field1 = c1.cmc || 0;
			field2 = c2.cmc || 0;
		}
		else if (sortCriteria[i].by === "power"){
			field1 = c1.power === "*" ? 0 : parseInt(c1.power);
			field2 = c2.power === "*" ? 0 : parseInt(c2.power);
		}
		else if (sortCriteria[i].by === "toughness"){
			field1 = c1.toughness === "*" ? 0 : parseInt(c1.toughness);
			field2 = c2.toughness === "*" ? 0 : parseInt(c2.toughness);
		}
		else if (sortCriteria[i].by === "loyalty"){
			field1 = c1.loyalty === "X" ? 0 : parseInt(c1.loyalty);
			field2 = c2.loyalty === "X" ? 0 : parseInt(c2.loyalty);
		}
		
		/**
		 * if doing a numerical sort, return all NaN values last regardless of
		 * sort order.  That's what the first 3 checks are for
		 */
		if (Number.isNaN(field1) && Number.isNaN(field2)){
			break;
		}
		else if (!Number.isNaN(field1) && Number.isNaN(field2)){
			return -1;
		}
		else if (Number.isNaN(field1) && !Number.isNaN(field2)){
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

function sortDropdownConverter(value){
	let parts = value.split(" ");
	return {
			by : parts[0].toLowerCase(), 
			order : parts[1] === "(Ascending)" ? 1 : -1
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
	state.inputs.format = document.getElementById("format-input").value;
	state.inputs.sort[0] = sortDropdownConverter(document.getElementById("sort-primary").value);
	state.inputs.sort[1] = sortDropdownConverter(document.getElementById("sort-secondary").value);
})();

callAjax("resources/cards.json", responseText => {
	state.allCards = JSON.parse(responseText);
	sortAndRefilter();
});

