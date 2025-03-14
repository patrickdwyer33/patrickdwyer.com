import puppeteer from "puppeteer";
import { exec } from "child_process";
import path from "path";

// Function to start Vite server
async function startServer() {
	console.log("Starting Vite server...");
	const childProcess = exec("npm run dev");

	// Give the server some time to start up
	return new Promise((resolve) => {
		childProcess.stdout.on("data", (data) => {
			console.log(`Server: ${data}`);
			// When we see the server is ready message, resolve the promise
			if (data.includes("Local:") || data.includes("ready in")) {
				resolve(childProcess);
			}
		});

		childProcess.stderr.on("data", (data) => {
			console.error(`Server Error: ${data}`);
		});

		// Fallback in case we don't see the ready message
		setTimeout(() => resolve(childProcess), 5000);
	});
}

// Function to convert page to PDF
async function convertToPDF() {
	let serverProcess;
	let browser;

	try {
		// Start the Vite server
		serverProcess = await startServer();

		// Launch the browser with options to fix font loading issues
		console.log("Launching browser...");
		browser = await puppeteer.launch({
			headless: "new",
			args: [
				"--no-sandbox",
				// "--disable-setuid-sandbox",
				"--disable-web-security", // Fix for font loading issues
				// "--disable-dev-shm-usage",
			],
		});

		// Create a new page
		const page = await browser.newPage();

		// Set viewport size for better PDF output
		await page.setViewport({
			width: 1200,
			height: 800,
			deviceScaleFactor: 2,
		});

		// Navigate to the page
		const url = "http://localhost:5173";
		console.log(`Navigating to ${url}...`);

		await page.goto(url, {
			waitUntil: "networkidle2",
			timeout: 60000,
		});

		// Apply print media emulation to match Chrome's print behavior
		await page.emulateMediaType("print");

		// Create PDF
		const pdfPath = path.join(process.cwd(), "public/resume.pdf");
		console.log("Generating PDF...");

		// Configure PDF options
		await page.pdf({
			path: pdfPath,
			format: "Letter",
			printBackground: true,
			margin: {
				top: "0.4in",
				bottom: "0.4in",
				left: "0.4in",
				right: "0.4in",
			},
			scale: 0.9,
			preferCSSPageSize: true,
			displayHeaderFooter: false,
		});

		console.log(`PDF saved to: ${pdfPath}`);
	} catch (error) {
		console.error("Error:", error);
	} finally {
		// Close the browser if it was opened
		if (browser) {
			console.log("Closing browser...");
			await browser.close();
		}

		// Kill the server process if it was started
		if (serverProcess) {
			console.log("Stopping server...");
			serverProcess.kill();
		}
	}
}

// Run the script
convertToPDF();
