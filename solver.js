// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = 'https://madc0w.github.io/set/model/';

let model, webcam, maxPredictions, canvas, isDetectingCards, predictions;

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
			document.getElementById('detect-button').classList.remove('hidden');
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
	setInterval(() => {
		const context = canvas.getContext('2d');
		context.font = '32px Arial';
		context.style = '#000';
		if (isDetectingCards) {
			for (let x = 0; x < 4; x++) {
				for (let y = 0; y < 3; y++) {
					const prediction = predictions[`${x}-${y}`];
					// console.log(prediction);
					context.fillStyle = '#fff';
					context.fillRect(
						(x * canvas.width) / 4,
						(y * canvas.height) / 3 + 40,
						200,
						60
					);
					context.fillStyle = '#000';
					console.log(`${x} ${y}`, prediction[0]);
					context.fillText(
						`${prediction[0].className} ${prediction[0].probability.toFixed(
							2
						)}`,
						(x * canvas.width) / 4 + 8,
						(y * canvas.height) / 3 + 80
					);
				}
			}
		} else {
			context.drawImage(video, 0, 0, canvas.width, canvas.height);
		}

		for (let x = 1; x < 4; x++) {
			context.beginPath();
			context.moveTo((x * canvas.width) / 4, 0);
			context.lineTo((x * canvas.width) / 4, canvas.height);
			context.stroke();
		}
		for (let y = 1; y < 3; y++) {
			context.beginPath();
			context.moveTo(0, (y * canvas.height) / 3);
			context.lineTo(canvas.width, (y * canvas.height) / 3);
			context.stroke();
		}
	}, 80);

	const modelURL = URL + 'model.json';
	const metadataURL = URL + 'metadata.json';

	// Refer to tmImage.loadFromFiles() in the API to support files from a file picker
	// or files from your local hard drive
	// Note: the pose library adds "tmImage" object to your window (window.tmImage)
	model = await tmImage.load(modelURL, metadataURL);
	maxPredictions = model.getTotalClasses();
}

async function detectCards() {
	const width = canvas.width / 4;
	const height = canvas.height / 3;

	predictions = {};
	for (let x = 0; x < 4; x++) {
		for (let y = 0; y < 3; y++) {
			const clip = getClippedCanvas(
				canvas,
				x * width,
				y * height,
				width,
				height
			);
			document.getElementById(`clip-${x}-${y}`).appendChild(clip.image);
			predictions[`${x}-${y}`] = await predict(clip.canvas);
			// console.log(x, y, prediction);
		}
	}
	isDetectingCards = true;
	// document.getElementById('clips').classList.remove('hidden');
}

async function predict(input) {
	// predict can take in an image, video or canvas html element
	if (input) {
		const predictions = await model.predict(input);
		predictions.sort((a, b) => (a.probability > b.probability ? 1 : -1));
		return predictions;
		// let maxProb = {
		// 	label: null,
		// 	prob: 0,
		// };
		// for (let i = 0; i < maxPredictions; i++) {
		// 	if (predictions[i].probability > maxProb.prob) {
		// 		maxProb.prob = predictions[i].probability;
		// 		maxProb.label = predictions[i].className;
		// 	}
		// }
		// return maxProb;
		// document.getElementById('prediction').innerHTML = `${
		// 	maxProb.label
		// } (${maxProb.prob.toFixed(2)})`;
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
