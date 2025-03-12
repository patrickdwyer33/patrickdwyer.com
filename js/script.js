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
