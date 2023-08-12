const numCards = 12;

// const testSet = findSet(['3sgd', '1oro', '3srs']);
// console.log(testSet);
{
	const all = allSets();
	console.log('all possible sets: ', all.length);
	const matchingAttributeCount = [0, 0, 0, 0];
	for (const set of all) {
		let numMatchingAttributes = 0;
		for (let i = 0; i < set[0].length; i++) {
			if (set[0][i] == set[1][i]) {
				numMatchingAttributes++;
			}
		}
		matchingAttributeCount[numMatchingAttributes]++;
	}
	for (const i in matchingAttributeCount) {
		console.log(
			`num matching ${i} attributes`,
			matchingAttributeCount[i],
			`(${((100 * matchingAttributeCount[i]) / all.length).toFixed(2)}%)`
		);
	}
}

{
	const numCards = 15;
	const numIts = 1e5;
	let numSets = 0;
	for (let i = 0; i < numIts; i++) {
		const cards = [];
		for (let i = 0; i < numCards; i++) {
			cards.push(randomCard(cards));
		}
		if (findSet(cards)) {
			numSets++;
		}
	}
	console.log(
		`at least one set was found in ${((100 * numSets) / numIts).toFixed(
			4
		)}% ${numCards}-card boards`
	);
}

function load() {
	const cards = [];
	for (let i = 0; i < numCards; i++) {
		cards.push(randomCard(cards));
	}
	drawBoard(cards);

	let numSets = 0;
	const intervalId = setInterval(() => {
		const set = findSet(cards);
		if (set) {
			numSets++;
			document.getElementById('num-sets').innerHTML = numSets;
			for (const card of set) {
				const img = document.getElementById(`card-${card}`);
				img.classList.add('set-element');
			}
			setTimeout(() => {
				for (const setItem of set) {
					cards[cards.indexOf(setItem)] = randomCard(cards);
				}
				drawBoard(cards);
			}, 2000);
		} else {
			clearInterval(intervalId);
			document.getElementById('num-sets').innerHTML += ' - all done!';
		}
	}, 2800);
}

function findSet(cards) {
	for (const card1 of cards) {
		const attributes1 = getAttributes(card1);
		for (const card2 of cards) {
			if (card1 != card2) {
				const attributes2 = getAttributes(card2);
				const card3 =
					'123'[(3 - ((attributes1[0] + attributes2[0]) % 3)) % 3] +
					'fos'[(3 - ((attributes1[1] + attributes2[1]) % 3)) % 3] +
					'gpr'[(3 - ((attributes1[2] + attributes2[2]) % 3)) % 3] +
					'dos'[(3 - ((attributes1[3] + attributes2[3]) % 3)) % 3];
				if (cards.includes(card3)) {
					return [card1, card2, card3];
				}
			}
		}
	}
}

function getAttributes(card) {
	return [
		'123'.indexOf(card[0]),
		'fos'.indexOf(card[1]),
		'gpr'.indexOf(card[2]),
		'dos'.indexOf(card[3]),
	];
}

function allSets() {
	const sets = [];
	const cards = [];
	for (const number of '123') {
		for (const fill of 'fos') {
			for (const color of 'gpr') {
				for (const shape of 'dos') {
					cards.push(`${number}${fill}${color}${shape}`);
				}
			}
		}
	}

	for (const card1 of cards) {
		const attributes1 = getAttributes(card1);
		for (const card2 of cards) {
			if (card1 != card2) {
				const attributes2 = getAttributes(card2);
				const card3 =
					'123'[(3 - ((attributes1[0] + attributes2[0]) % 3)) % 3] +
					'fos'[(3 - ((attributes1[1] + attributes2[1]) % 3)) % 3] +
					'gpr'[(3 - ((attributes1[2] + attributes2[2]) % 3)) % 3] +
					'dos'[(3 - ((attributes1[3] + attributes2[3]) % 3)) % 3];
				sets.push([card1, card2, card3]);
			}
		}
	}
	return sets;
}

function randomCard(cards) {
	let card;
	do {
		card = '123'[rand()] + 'fos'[rand()] + 'gpr'[rand()] + 'dos'[rand()];
	} while (cards.includes(card));
	return card;
}

function drawBoard(cards) {
	let html = '';
	for (let row = 0; row < 4; row++) {
		html += '<tr>';
		for (let col = 0; col < 3; col++) {
			const card = cards[3 * row + col];
			html += `<td><img id="card-${card}" src="img/${card}.jpg"/></td>`;
		}
		html += '</tr>';
	}
	const gameBoardTable = document.getElementById('game-board');
	gameBoardTable.innerHTML = html;
}

function rand() {
	return Math.floor(Math.random() * 3);
}
