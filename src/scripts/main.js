import { initPWA } from "./pwa.js";

// check for updates every minute
const period = 60 * 1000;
initPWA(period);

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
