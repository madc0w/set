function load() {
	let html = '';
	for (let row = 0; row < 4; row++) {
		html += '<tr>';
		for (let col = 0; col < 3; col++) {
			let imageFileName =
				[1, 2, 3][rand()] + 'fos'[rand()] + 'gpr'[rand()] + 'dos'[rand()];
			html += `<td><img src="img/${imageFileName}.jpg"/></td>`;
		}
		html += '</tr>';
	}
	const gameBoardTable = document.getElementById('game-board');
	gameBoardTable.innerHTML = html;
}

function rand() {
	return Math.floor(Math.random() * 3);
}
