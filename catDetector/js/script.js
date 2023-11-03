const DEBUG = false;

const newSelectedImageEvent = new CustomEvent("new-selected-image");
const newImageEvent = new CustomEvent("new-image");
const imageClassifyEvent = new CustomEvent("classify");
const catDetectedEvent = new CustomEvent("cat-detected");
const noCatDetectedEvent = new CustomEvent("no-cat-detected");

const fileInput = document.querySelector("input#file-submit");
const classifyButton = document.querySelector("#classify-button");
const imageWheel = document.querySelector("#image-wheel");
let selectedImage;
let changingSelected = false;
const fileNames = [];

function selectImage(img) {
	if (changingSelected) {
		setTimeout(() => {
			selectImage(img);
		}, 100);
		return;
	}
	changingSelected = true;
	if (selectedImage) selectedImage.classList.remove("selected");
	img.classList.add("selected");
	selectedImage = img;
	imageWheel.dispatchEvent(newSelectedImageEvent);
	changingSelected = false;
}

function rotateWheel(id) {
	let nextEle;
	switch (id) {
		case "left":
			nextEle = selectedImage.parentElement.previousElementSibling;
			if (nextEle !== null) nextEle = nextEle.children[0];
			break;
		case "right":
			nextEle = selectedImage.parentElement.nextElementSibling;
			if (nextEle !== null) nextEle = nextEle.children[0];
			break;
		default:
			throw new Error("Ahhhh!");
	}
	if (nextEle !== null) {
		selectImage(nextEle);
	}
}

document.addEventListener("keydown", (e) => {
	let id;
	if (e.key === "ArrowLeft") id = "left";
	else if (e.key === "ArrowRight") id = "right";
	else return;
	rotateWheel(id);
});

imageWheel.addEventListener("click", function (e) {
	if (e.target === selectedImage || e.target === e.currentTarget) return;
	selectImage(e.target);
});

imageWheel.addEventListener("new-selected-image", () => {
	const selectedParent = selectedImage.parentElement;
	if (!selectedParent.classList.contains("vis"))
		selectedParent.classList.add("vis");
	let newVisEles = [selectedParent];
	const prevSibling = selectedParent.previousElementSibling;
	const nextSibling = selectedParent.nextElementSibling;
	if (prevSibling !== null) {
		prevSibling.classList.add("vis");
		prevSibling.classList.add("left");
		newVisEles.push(prevSibling);
	}
	if (nextSibling !== null) {
		nextSibling.classList.add("vis");
		nextSibling.classList.add("right");
		newVisEles.push(nextSibling);
	}
	if (nextSibling && nextSibling.classList.contains("left"))
		nextSibling.classList.remove("left");
	if (prevSibling && prevSibling.classList.contains("right"))
		prevSibling.classList.remove("right");
	if (selectedParent.classList.contains("left"))
		selectedParent.classList.remove("left");
	if (selectedParent.classList.contains("right"))
		selectedParent.classList.remove("right");

	document.querySelectorAll("#image-wheel li.vis").forEach((li) => {
		if (!newVisEles.includes(li)) {
			li.classList.remove("vis");
			if (li.classList.contains("left")) li.classList.remove("left");
			if (li.classList.contains("right")) li.classList.remove("right");
		}
	});
	visImages = imageWheel.querySelectorAll("li.vis img");
	if (classifyButton.disabled) classifyButton.disabled = false;
});

document.addEventListener("cat-detected", () => {
	alert("CAT DETECTED");
});

document.addEventListener("no-cat-detected", () => {
	alert("no cat :(");
});

fileInput.addEventListener("change", function (e) {
	if (FileReader && e.target.files && e.target.files.length) {
		Array.from(e.target.files).forEach((file) => {
			if (!fileNames.includes(file)) {
				fileNames.push(file);
				const li = document.createElement("li");
				const newImg = document.createElement("img");
				var fr = new FileReader();
				fr.onload = function () {
					newImg.src = fr.result;
					newImg.alt = "Schrödinger's cat";
				};
				fr.readAsDataURL(file);
				li.appendChild(newImg);
				document.querySelector("#image-wheel").appendChild(li);
				selectImage(newImg);
			}
		});
	}
});

function classifyImage(img, model) {
	const preds = model.classify(img);
	preds
		.then((preds) => {
			let foundCat = false;
			preds.forEach((pred) => {
				const catClassCond =
					pred.className.toLowerCase().includes(" cat") ||
					pred.className.toLowerCase() === "cat" ||
					pred.className.toLowerCase().includes("cat ");
				const catThreshold = 0.025;
				if (
					!foundCat &&
					catClassCond &&
					pred.probability >= catThreshold
				) {
					DEBUG &&
						console.log(
							`Model predicted className: ${pred.className} with confidence: ${pred.probability}`
						);
					foundCat = true;
					document.dispatchEvent(catDetectedEvent);
				} else if (foundCat && catClassCond)
					DEBUG &&
						console.log(
							`Model predicted className: ${pred.className} with confidence: ${pred.probability}`
						);
			});
			if (!foundCat) document.dispatchEvent(noCatDetectedEvent);
		})
		.catch((err) => {
			throw err;
		});
}

mobilenet.load().then((model) => {
	classifyButton.addEventListener("click", () => {
		if (selectedImage) classifyImage(selectedImage, model);
	});
});
