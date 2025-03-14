/**
 * PDF Screenshot Module
 * Takes screenshots of PDF documents based on coordinates using Puppeteer
 */

import puppeteer from "puppeteer";

/**
 * Takes screenshots of multiple regions from a PDF document and returns them as base64 strings
 * @param {string} pdfPath - Path to the PDF file (can be local file path or URL)
 * @param {Array<Object>} options - Array of screenshot configuration options
 * @param {number} options[].page_number - PDF page number (1-based)
 * @param {number} options[].left - X coordinate (left position)
 * @param {number} options[].top - Y coordinate (top position)
 * @param {number} options[].width - Width of the screenshot area
 * @param {number} options[].height - Height of the screenshot area
 * @param {number} options[].page_width - Width of the PDF page
 * @param {number} options[].page_height - Height of the PDF page
 * @param {string} options[].text - Text content (unused in screenshot)
 * @param {string} options[].type - Type of element (unused in screenshot)
 * @param {number} options[].mediaId - Media identifier (unused in screenshot)
 * @param {Object} [browserOptions={}] - Additional options for Puppeteer browser
 * @returns {Promise<Array<{base64: string, options: Object}>>} - Returns a Promise that resolves to an array of base64 image data URLs and their associated options
 */
export default async function screenshotPdf(
	pdfPath,
	options,
	browserOptions = {}
) {
	// Input validation
	if (!pdfPath) {
		throw new Error("PDF path is required");
	}

	if (!Array.isArray(options) || options.length === 0) {
		throw new Error("Options must be a non-empty array");
	}

	// Validate all options contain the required parameters
	options.forEach((opt, index) => {
		if (typeof opt.page_number !== "number" || opt.page_number < 1) {
			throw new Error(`Invalid page number in option at index ${index}`);
		}
		if (typeof opt.left !== "number" || typeof opt.top !== "number") {
			throw new Error(
				`Coordinates (left,top) must be numbers in option at index ${index}`
			);
		}
		if (typeof opt.width !== "number" || typeof opt.height !== "number") {
			throw new Error(
				`Dimensions (width,height) must be numbers in option at index ${index}`
			);
		}
		if (
			typeof opt.page_width !== "number" ||
			typeof opt.page_height !== "number"
		) {
			throw new Error(
				`Page dimensions (page_width,page_height) must be numbers in option at index ${index}`
			);
		}
	});

	let browser = null;
	try {
		// Launch browser once for all screenshots
		browser = await puppeteer.launch({
			headless: "new",
			...browserOptions,
		});

		// Group options by page number for efficiency
		const optionsByPage = groupByPageNumber(options);
		const results = [];

		// Process each page
		for (const [pageNumber, pageOptions] of Object.entries(optionsByPage)) {
			const page = await browser.newPage();

			// Navigate to PDF with specific page
			const url = pdfPath.startsWith("http")
				? `${pdfPath}#page=${pageNumber}`
				: `file://${pdfPath}#page=${pageNumber}`;

			await page.goto(url, { waitUntil: "networkidle2" });

			// Wait for PDF to render fully
			await page.waitForFunction(
				"PDFViewerApplication && PDFViewerApplication.pdfViewer && PDFViewerApplication.pdfViewer.currentPageNumber === PDFViewerApplication.page"
			);

			// Take screenshots for all regions on this page
			for (const opt of pageOptions) {
				const { left, top, width, height } = opt;

				const screenshotBuffer = await page.screenshot({
					clip: {
						x: left,
						y: top,
						width,
						height,
					},
					type: "png",
					omitBackground: false,
				});

				// Convert buffer to base64 and create data URL
				const base64 = screenshotBuffer.toString("base64");
				const dataUrl = `data:image/png;base64,${base64}`;

				// Push only the base64 string and options to results
				results.push({
					base64: dataUrl,
					...opt,
				});
			}

			await page.close();
		}

		return results;
	} catch (error) {
		console.error("Error taking PDF screenshots:", error);
		throw error;
	} finally {
		// Close browser
		if (browser) await browser.close();
	}
}

/**
 * Group options by their page number
 * @param {Array<Object>} options - Array of options
 * @returns {Object} - Options grouped by page number
 * @private
 */
function groupByPageNumber(options) {
	const grouped = {};

	options.forEach((opt) => {
		const pageNumber = opt.page_number;
		if (!grouped[pageNumber]) {
			grouped[pageNumber] = [];
		}
		grouped[pageNumber].push(opt);
	});

	return grouped;
}
