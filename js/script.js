document.querySelector("div.math").addEventListener("click", function (e) {
	const matches = document.querySelectorAll("div.math, div.math *:not(h4)");
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
	const matches = document.querySelectorAll("div.cs, div.cs *:not(h4)");
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
	const matches = document.querySelectorAll("div.other, div.other *:not(h4)");
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
