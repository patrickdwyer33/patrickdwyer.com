document.querySelector("div.math").addEventListener("click", function (e) {
	const matches = document.querySelectorAll("div.math, div.math *");
	if (this.classList.contains("card-showing")) {
		matches.forEach((ele) => {
			ele.classList.remove("card-showing");
		});
	} else {
		matches.forEach((ele) => {
			ele.classList.add("card-showing");
		});
	}
});

document.querySelector("div.cs").addEventListener("click", function (e) {
	const matches = document.querySelectorAll("div.cs, div.cs *");
	if (this.classList.contains("card-showing")) {
		matches.forEach((ele) => {
			ele.classList.remove("card-showing");
		});
	} else {
		matches.forEach((ele) => {
			ele.classList.add("card-showing");
		});
	}
});

document.querySelector("div.other").addEventListener("click", function (e) {
	const matches = document.querySelectorAll("div.other, div.other *");
	if (this.classList.contains("card-showing")) {
		matches.forEach((ele) => {
			ele.classList.remove("card-showing");
		});
	} else {
		matches.forEach((ele) => {
			ele.classList.add("card-showing");
		});
	}
});
