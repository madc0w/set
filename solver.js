// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = 'https://madc0w.github.io/set/model/';

let model, webcam, maxPredictions, canvas;

// Load the image model and setup the webcam
async function start() {
	const video = document.querySelector('video');

	navigator.mediaDevices
		.getUserMedia({
			audio: false,
			video: {
				facingMode: { exact: 'environment' },
			},
		})
		.then((stream) => {
			video.srcObject = stream;
			document.getElementById('start-button').classList.add('hidden');
			document.getElementById('solve-button').classList.remove('hidden');
			document.getElementById('video-container').classList.remove('hidden');
			document.getElementById('grid').classList.remove('hidden');
			return navigator.mediaDevices.enumerateDevices();
		})
		.then((gotDevices) => {
			// Process for the list of returned devices and get a handle on the video stream
		})
		.catch((error) => {
			console.error('Error accessing media devices.', error);
		});

	setInterval(() => {
		canvas = document.getElementById('canvas');
		const context = canvas.getContext('2d');
		context.drawImage(video, 0, 0, canvas.width, canvas.height);
	}, 80);

	const modelURL = URL + 'model.json';
	const metadataURL = URL + 'metadata.json';

	// load the model and metadata
	// Refer to tmImage.loadFromFiles() in the API to support files from a file picker
	// or files from your local hard drive
	// Note: the pose library adds "tmImage" object to your window (window.tmImage)
	model = await tmImage.load(modelURL, metadataURL);
	maxPredictions = model.getTotalClasses();

	// // Convenience function to setup a webcam
	// const flip = true; // whether to flip the webcam
	// webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
	// await webcam.setup(); // request access to the webcam
	// await webcam.play();
	// window.requestAnimationFrame(loop);

	// // append elements to the DOM
	// // document.getElementById('webcam-container').appendChild(webcam.canvas);
	// labelContainer = document.getElementById('label-container');
	// for (let i = 0; i < maxPredictions; i++) {
	// 	// and class labels
	// 	labelContainer.appendChild(document.createElement('div'));
	// }
}

async function solve() {
	const maxWidth = 536;
	const maxHeight = 400;
	const width = maxWidth / 4;
	const height = maxHeight / 3;
	for (let x = 0; x < 4; x++) {
		for (let y = 0; y < 3; y++) {
			const clip = getClippedCanvas(
				canvas,
				x * width,
				y * height,
				width,
				height
			);
			const prediction = await predict(clip);
			console.log(x, y, prediction);
		}
	}
}

// async function loop() {
// 	// webcam.update(); // update the webcam frame
// 	await predict();
// 	window.requestAnimationFrame(loop);
// }

// run the webcam image through the image model
async function predict(input) {
	// predict can take in an image, video or canvas html element
	if (input) {
		const prediction = await model.predict(input);
		let maxProb = {
			label: null,
			prob: 0,
		};
		for (let i = 0; i < maxPredictions; i++) {
			if (prediction[i].probability > maxProb.prob) {
				maxProb.prob = prediction[i].probability;
				maxProb.label = prediction[i].className;
			}
		}
		return maxProb;
		// document.getElementById('prediction').innerHTML = `${
		// 	maxProb.label
		// } (${maxProb.prob.toFixed(2)})`;
	}
}

function getClippedCanvas(sourceCanvas, x, y, width, height) {
	// Create a temporary canvas
	const tempCanvas = document.createElement('canvas');
	tempCanvas.width = width;
	tempCanvas.height = height;

	// Get the context of the temporary canvas
	const tempCtx = tempCanvas.getContext('2d');

	// Draw the image to the temporary canvas
	tempCtx.drawImage(sourceCanvas, x, y, width, height, 0, 0, width, height);
	return tempCanvas;

	// // Create a new image element
	// const image = new Image();
	// // Set the source of the image to the data URL of the temporary canvas
	// image.src = tempCanvas.toDataURL();
	// return image;
}
