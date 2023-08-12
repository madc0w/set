// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = 'https://madc0w.github.io/set/model/';

let model, webcam, maxPredictions, canvas;

// Load the image model and setup the webcam
async function init() {
	const video = document.querySelector('video');

	navigator.mediaDevices
		.getUserMedia({ video: true })
		.then((stream) => {
			video.srcObject = stream;
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
	}, 200);

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
	window.requestAnimationFrame(loop);

	// // append elements to the DOM
	// // document.getElementById('webcam-container').appendChild(webcam.canvas);
	// labelContainer = document.getElementById('label-container');
	// for (let i = 0; i < maxPredictions; i++) {
	// 	// and class labels
	// 	labelContainer.appendChild(document.createElement('div'));
	// }
}

async function loop() {
	// webcam.update(); // update the webcam frame
	await predict();
	window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
	// predict can take in an image, video or canvas html element
	if (canvas) {
		const prediction = await model.predict(canvas);
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
		document.getElementById('prediction').innerHTML = `${
			maxProb.label
		} (${maxProb.prob.toFixed(2)})`;
	}
}
