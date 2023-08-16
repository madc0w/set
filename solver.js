// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

const version = 'v0.2.14';
const probabilityThreshold = 0.92;
const detectionDelay = 1600;

let model,
	webcam,
	maxPredictions,
	canvas,
	chosenCard,
	predictions,
	lastDetectionTime = new Date(),
	isVideoPaused;
let detectedCards = [];

async function load() {
	reset();
	isVideoPaused = true;
	const video = document.querySelector('video');
	document.getElementById('version').innerHTML = version;

	navigator.mediaDevices
		.getUserMedia({
			audio: false,
			video: {
				// facingMode: { exact: 'environment' },
				facingMode: 'environment',
			},
		})
		.then((stream) => {
			// console.log('stream', stream);
			isVideoPaused = false;
			video.srcObject = stream;
			document.getElementById('reset-button').classList.remove('hidden');
			document.getElementById('video-container').classList.remove('hidden');
			renderDetectedCards();
			return navigator.mediaDevices.enumerateDevices();
		})
		// .then((gotDevices) => {
		// 	// Process for the list of returned devices and get a handle on the video stream
		// })
		.catch((error) => {
			console.error('Error accessing media devices.', error);
		});

	canvas = document.getElementById('video-canvas');
	setInterval(async () => {
		if (isVideoPaused) {
			return;
		}
		const context = canvas.getContext('2d');
		context.font = '32px Arial';
		context.style = '#000';
		context.drawImage(video, 0, 0, canvas.width, canvas.height);

		if (model) {
			await predict(canvas);
			if (
				new Date() - lastDetectionTime > detectionDelay &&
				predictions[0].probability > probabilityThreshold &&
				detectedCards.filter((c) => c).length < 12
			) {
				lastDetectionTime = new Date();
				const detectedCard = predictions[0].className;
				// console.log('detected ', detectedCard);
				if (!detectedCards.find((c) => c?.card == detectedCard)) {
					showCardDetectedModal(predictions);
				}
			}
			if (detectedCards.filter((c) => c).length == 12) {
				document.getElementById('solve-button').classList.remove('hidden');
			}
		}
	}, 80);

	// the link to model provided by Teachable Machine export panel
	const baseUrl = 'https://madc0w.github.io/set/model/model2/';
	// const baseUrl =
	// 	'https://raw.githubusercontent.com/madc0w/set/main/model/model2/';
	const modelURL = baseUrl + 'model.json';
	const metadataURL = baseUrl + 'metadata.json';

	// Refer to tmImage.loadFromFiles() in the API to support files from a file picker
	// or files from your local hard drive
	// Note: the pose library adds "tmImage" object to your window (window.tmImage)
	model = await tmImage.load(modelURL, metadataURL);
	maxPredictions = model.getTotalClasses();
}

async function predict(input) {
	// predict can take in an image, video or canvas html element
	if (input) {
		predictions = await model.predict(input);
		predictions.sort((a, b) => (a.probability < b.probability ? 1 : -1));
	}
}

function getClippedCanvas(sourceCanvas, x, y, width, height) {
	const tempCanvas = document.createElement('canvas');
	tempCanvas.width = width;
	tempCanvas.height = height;
	const tempCtx = tempCanvas.getContext('2d');
	tempCtx.drawImage(sourceCanvas, x, y, width, height, 0, 0, width, height);
	const image = new Image();
	image.src = tempCanvas.toDataURL();
	return {
		canvas: tempCanvas,
		image,
	};
}

function solve() {
	const cards = [];
	for (const card of detectedCards) {
		card && cards.push(card.card);
	}
	const set = findSet(cards);
	if (set) {
		for (const card of set) {
			document
				.getElementById(`detected-card-${card}`)
				.classList.add('set-card');
		}
	} else {
		openModal('no-set-modal');
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

function renderDetectedCards() {
	const detectedCardsTable = document.querySelector('#detected-cards-table');
	let html = '<tr>';
	let i = 0;
	const detectedCardsArray = [];
	for (const card of detectedCards) {
		detectedCardsArray.push(card?.card);
	}

	while (detectedCardsArray.length < 12) {
		detectedCardsArray.push(null);
	}
	for (const card of detectedCardsArray) {
		html += '<td>';
		if (card) {
			html += `<img src="img/${card}.jpg" id="detected-card-${card}" onclick="chooseCard('${card}')"/>`;
		}
		html += '</td>';
		i++;
		if (i % 4 == 0) {
			html += '</tr><tr>';
		}
	}
	html += '</tr>';
	detectedCardsTable.innerHTML = html;
}

function chooseCard(card) {
	chosenCard = card;
	openModal('choose-card-modal');

	const cardChoicesTable = document.getElementById('card-choices-table');
	let html = '';
	const detectedCard = detectedCards.find((c) => c.card == card);
	if (detectedCard?.predictions) {
		for (const prediction of detectedCard.predictions) {
			html += `<tr><td><img src="img/${
				prediction.className
			}.jpg" id="detected-card-${card}" onclick="replaceCard('${card}', '${
				prediction.className
			}')"/></td><td>${(100 * prediction.probability).toFixed(1)}%</td></tr>`;
		}
	} else {
		for (const num of '123') {
			for (const fill of 'fos') {
				for (const color of 'gpr') {
					for (const shape of 'dos') {
						const replacementCard = `${num}${fill}${color}${shape}`;
						html += `<tr><td><img src="img/${replacementCard}.jpg" id="detected-card-${card}" onclick="replaceCard('${card}', '${replacementCard}')"/></td>`;
					}
				}
			}
		}
	}
	cardChoicesTable.innerHTML = html;
	setTimeout(() => {
		const el = document.getElementById('card-choices-container');
		el.scroll(0, 0);
	}, 20);
}

function replaceCard(card, replacementCard) {
	if (card != replacementCard) {
		{
			let i = 0;
			for (const _card of detectedCards) {
				if (_card?.card == replacementCard) {
					detectedCards[i] = null;
					break;
				}
				i++;
			}
		}
		{
			let i = 0;
			for (const _card of detectedCards) {
				if (_card?.card == card) {
					detectedCards[i] = {
						card: replacementCard,
					};
					break;
				}
				i++;
			}
		}
		renderDetectedCards();
	}
	closeModals();
}

function deleteCard() {
	let i = 0;
	for (const card of detectedCards) {
		if (card?.card == chosenCard) {
			detectedCards[i] = null;
			break;
		}
		i++;
	}
	renderDetectedCards();
	document.getElementById('solve-button').classList.add('hidden');
	closeModals();
}

function showCardDetectedModal(predictions) {
	document.getElementById('reject-detected-card').onclick = closeModals;
	const cardChoicesTable = document.getElementById(
		'detected-card-choices-table'
	);
	let html = '';
	for (const prediction of predictions) {
		html += `<tr><td><img src="img/${
			prediction.className
		}.jpg" onclick="chooseDetectedCard('${prediction.className}')"/></td><td>${(
			100 * prediction.probability
		).toFixed(1)}%</td></tr>`;
	}
	cardChoicesTable.innerHTML = html;

	setTimeout(() => {
		const el = document.getElementById('detected-card');
		el.scroll(0, 0);
	}, 20);
	openModal('card-detected-modal');
}

function chooseDetectedCard(card) {
	if (!detectedCards.find((c) => c?.card == card)) {
		let i = 0;
		for (const _card of detectedCards) {
			if (!_card) {
				detectedCards[i] = {
					card,
					predictions,
				};
				break;
			}
			i++;
		}

		renderDetectedCards();
	}
	closeModals();
}

function reset() {
	detectedCards = [];
	for (let i = 0; i < 12; i++) {
		detectedCards.push(null);
	}

	renderDetectedCards();
	closeModals();
}

function openModal(id) {
	isVideoPaused = true;
	document.getElementById(id).style.display = 'block';
}

function closeModals() {
	// console.log('closeModals');
	isVideoPaused = false;
	lastDetectionTime = new Date();
	const modals = document.getElementsByClassName('modal');
	let i = 0;
	do {
		modals.item(i).style.display = 'none';
	} while (modals.item(++i));
}
