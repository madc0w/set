function load() {
	const testSet = findSet(['3sgd', '1oro', '3srs']);
	console.log(testSet);

	const cards = [];

	let html = '';
	for (let row = 0; row < 4; row++) {
		html += '<tr>';
		for (let col = 0; col < 3; col++) {
			let card;
			do {
				card = '123'[rand()] + 'fos'[rand()] + 'gpr'[rand()] + 'dos'[rand()];
			} while (cards.includes(card));
			cards.push(card);
			html += `<td><img id="card-${card}" src="img/${card}.jpg"/></td>`;
		}
		html += '</tr>';
	}
	const gameBoardTable = document.getElementById('game-board');
	gameBoardTable.innerHTML = html;

	const set = findSet(cards);
	// console.log(set);
	if (set) {
		for (const card of set) {
			const img = document.getElementById(`card-${card}`);
			img.classList.add('set-element');
		}
	}
}

function findSet(cards) {
	for (const card1 of cards) {
		const attributes1 = [];
		attributes1.push('123'.indexOf(card1[0]));
		attributes1.push('fos'.indexOf(card1[1]));
		attributes1.push('gpr'.indexOf(card1[2]));
		attributes1.push('dos'.indexOf(card1[3]));
		for (const card2 of cards) {
			if (card1 != card2) {
				const attributes2 = [];
				attributes2.push('123'.indexOf(card2[0]));
				attributes2.push('fos'.indexOf(card2[1]));
				attributes2.push('gpr'.indexOf(card2[2]));
				attributes2.push('dos'.indexOf(card2[3]));

				let card3 = '';
				card3 += '123'[(3 - ((attributes1[0] + attributes2[0]) % 3)) % 3];
				card3 += 'fos'[(3 - ((attributes1[1] + attributes2[1]) % 3)) % 3];
				card3 += 'gpr'[(3 - ((attributes1[2] + attributes2[2]) % 3)) % 3];
				card3 += 'dos'[(3 - ((attributes1[3] + attributes2[3]) % 3)) % 3];
				if (cards.includes(card3)) {
					return [card1, card2, card3];
				}
			}
		}
	}
}

function rand() {
	return Math.floor(Math.random() * 3);
}
