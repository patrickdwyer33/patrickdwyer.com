let images = document.querySelectorAll("#all-images img");

const newSelectedImageEvent = new CustomEvent("new-selected-image");

mobilenet.load().then((model) => {
	async function classifyImage(img, model) {
		const preds = model.classify(img);
		preds
			.then((preds) => {
				let foundCat = false;
				preds.forEach((pred) => {
					if (
						!foundCat &&
						pred.className.toLowerCase().includes("cat")
					) {
						console.log(pred.className);
						foundCat = true;
						alert("CAT DETECTED");
					} else if (
						foundCat &&
						pred.className.toLowerCase().includes("cat")
					)
						console.log(pred.className);
				});
				if (!foundCat) alert("no cat :(");
			})
			.catch();
	}

	let allImages = document.querySelector("#all-images");
	let selectedImage = allImages.querySelector("li.vis:nth-child(2) img");
	selectedImage.classList.add("selected");

	document.addEventListener("new-selected-image", () => {
		const selectedParent = selectedImage.parentElement;
		let newVisEles = [selectedParent];
		const prevSibling = selectedParent.previousElementSibling;
		const nextSibling = selectedParent.nextElementSibling;
		if (prevSibling !== null) {
			prevSibling.classList.add("vis");
			newVisEles.push(prevSibling);
		}
		if (nextSibling !== null) {
			nextSibling.classList.add("vis");
			newVisEles.push(nextSibling);
		}
		document.querySelectorAll("#all-images li.vis").forEach((li) => {
			if (!newVisEles.includes(li)) li.classList.remove("vis");
		});
	});

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
			selectedImage.classList.remove("selected");
			nextEle.classList.add("selected");
			selectedImage = nextEle;
			document.dispatchEvent(newSelectedImageEvent);
		}
	}

	document.addEventListener("keydown", (e) => {
		let id;
		if (e.key === "ArrowLeft") id = "left";
		else if (e.key === "ArrowRight") id = "right";
		else return;
		rotateWheel(id);
	});

	const rotateButtons = document.querySelectorAll(".rotate-wheel input");
	rotateButtons.forEach((button) => {
		button.addEventListener("click", () => {
			const id = button.getAttribute("id");
			rotateWheel(id);
		});
	});

	let visImages = allImages.querySelectorAll("li.vis img");
	visImages.forEach((img) => {
		img.addEventListener("click", () => {
			if (img === selectedImage) return;
			selectedImage.classList.remove("selected");
			img.classList.add("selected");
			selectedImage = img;
			document.dispatchEvent(newSelectedImageEvent);
		});
	});

	const classifyButton = document.querySelector("#classify-button");
	classifyButton.addEventListener("click", () => {
		const img = document.querySelector("#all-images img.selected");
		classifyImage(img, model);
	});
});
