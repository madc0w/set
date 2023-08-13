// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

let model, webcam, maxPredictions, canvas, predictions;
let detectedCards = {};

async function start() {
	const video = document.querySelector('video');

	navigator.mediaDevices
		.getUserMedia({
			audio: false,
			video: {
				// facingMode: { exact: 'environment' },
				facingMode: 'environment',
			},
		})
		.then((stream) => {
			video.srcObject = stream;
			document.getElementById('start-button').classList.add('hidden');
			document.getElementById('video-container').classList.remove('hidden');
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
		const context = canvas.getContext('2d');
		context.font = '32px Arial';
		context.style = '#000';
		context.drawImage(video, 0, 0, canvas.width, canvas.height);

		if (model) {
			const predictions = await predict(canvas);
			// console.log('best prediction', predictions[0]);
			if (
				predictions[0].probability > 0.9 &&
				Object.keys(detectedCards).length < 12
			) {
				const detectedCard = predictions[0].className;
				// console.log('detected ', detectedCard);
				detectedCards[detectedCard] = predictions;
				renderDetectedCards();
			}
		}
	}, 80);

	// the link to model provided by Teachable Machine export panel
	const baseUrl = 'https://madc0w.github.io/set/model/';
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
		const predictions = await model.predict(input);
		predictions.sort((a, b) => (a.probability < b.probability ? 1 : -1));
		return predictions;
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

function renderDetectedCards() {
	const detectedCardsTable = document.getElementById('detected-cards-table');
	let html = '<tr>';
	let i = 0;
	const detectedCardsArray = Object.keys(detectedCards);
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
	openModal('choose-card-modal');

	const cardChoicesTable = document.getElementById('card-choices-table');
	let html = '';
	if (detectedCards[card]) {
		for (const prediction of detectedCards[card]) {
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
}

function replaceCard(card, replacementCard) {
	delete detectedCards[card];
	if (!detectedCards[replacementCard]) {
		detectedCards[replacementCard] = null;
	}
	closeModals();
	renderDetectedCards();
}

function openModal(id) {
	document.getElementById(id).style.display = 'block';
}

function closeModals() {
	const modals = document.getElementsByClassName('modal');
	let i = 0;
	do {
		modals.item(i).style.display = 'none';
	} while (modals.item(++i));
}
