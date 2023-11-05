const felidae = [
    "cat",
    "lion",
    "serval",
    "leopard",
    "caracal",
    "tiger",
    "lynxes",
    "jaguar",
    "panthera",
    "cheetah",
    "cougar",
    "ocelot",
    "felis",
    "felinae",
    "wildcat",
    "snow leopard",
    "leopard cat",
    "sand cat",
    "fishing cat",
    "jaguarundi",
    "pantherinae",
    "saber-toothed cat",
    "pallass cat",
    "oncilla",
    "margay",
    "clouded leopard",
    "black-footed cat",
    "kodkod",
    "proailurus",
    "machairodus",
    "jungle cat",
    "geoffroys cat",
    "mellivorodon",
    "flat-headed cat",
    "machairodontinae",
    "homotherium",
    "iriomote cat",
    "pumapard",
    "rusty-spotted cat",
    "miopanthera",
    "asian golden cat",
    "andean mountain cat",
    "marbled cat"
]
const DEBUG = true;

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
	if (
		e.target === selectedImage ||
		e.target === e.currentTarget ||
		e.target === imageWheel.querySelector("ul")
	)
		return;
	selectImage(e.target);
});

imageWheel.addEventListener("new-selected-image", () => {
	const selectedParent = selectedImage.parentElement;
	if (!selectedParent.classList.contains("vis"))
		selectedParent.classList.add("vis");
	let newVisEles = [selectedParent];
	let prevSibling = selectedParent.previousElementSibling;
	let nextSibling = selectedParent.nextElementSibling;
	const listEle = imageWheel.querySelector("ul");
	if (prevSibling === null) {
		const lastEle = imageWheel.querySelector("li:last-child");
		lastEle.remove();
		listEle.insertBefore(lastEle, listEle.firstChild);
		prevSibling = selectedParent.previousElementSibling;
		DEBUG && console.log(prevSibling);
	}
	if (nextSibling === null) {
		const lastEle = imageWheel.querySelector("li:nth-child(1)");
		lastEle.remove();
		listEle.appendChild(lastEle);
		nextSibling = selectedParent.nextElementSibling;
		DEBUG && console.log(nextSibling);
	}
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
				document.querySelector("#image-wheel ul").appendChild(li);
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
				const catThreshold = 0.025;
				DEBUG &&
					console.log(
						`Model predicted className: ${pred.className} with confidence: ${pred.probability}`
					);
				felidae.forEach((feline) => {
					if (
						!foundCat &&
						` ${pred.className.toLowerCase()}`.includes(
							` ${feline}`
						) &&
						pred.probability >= catThreshold
					) {
						foundCat = true;
						document.dispatchEvent(catDetectedEvent);
					}
				});
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
