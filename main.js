function load() {
	const cards = [];

	let html = '';
	for (let row = 0; row < 4; row++) {
		html += '<tr>';
		for (let col = 0; col < 3; col++) {
			const card =
				'123'[rand()] + 'fos'[rand()] + 'gpr'[rand()] + 'dos'[rand()];
			cards.push(card);
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
