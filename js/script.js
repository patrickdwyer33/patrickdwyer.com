let detailsCoursework = document.querySelectorAll("details.coursework");
let detailsOpen = false;

detailsCoursework.forEach((details) => {
	details.addEventListener("click", () => {
		detailsCoursework.forEach((subDetails) => {
			if (details != subDetails && window.innerWidth > 650) {
				subDetails.open = !detailsOpen;
			}
		});
		detailsOpen = !detailsOpen;
	});
});

// let timeout = false;
// const delay = 250;

// introImg = document.querySelector("div.intro img");
// introP = document.querySelector("div.intro div");
// function updateIntroHeight() {
// 	h1 = introImg.offsetHeight;
// 	h2 = introP.offsetHeight;
// 	console.log(h1);
// 	console.log(h2);
// 	newHeight = h1 > h2 ? h1 : h2;
// 	console.log(newHeight);
// 	introP.height = `${parseInt(newHeight)}px`;
// }
// onresize = (event) => {
// 	// if (window.innerWidth > 650) return;
// 	clearTimeout(timeout);
// 	timeout = setTimeout(updateIntroHeight, delay);
// };
