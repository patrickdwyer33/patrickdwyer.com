import fs from "fs";
import { exec, spawn } from "child_process";
import path from "path";
import convertPdfJsonToText from "./pdf-json-output-to-text.js";
import screenshotPdf from "./ss-pdf.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get the PDF filename from command line arguments
const pdfFile = process.argv[2];

// Check if filename was provided
if (!pdfFile) {
	console.error("Error: No PDF file specified.");
	console.log("Usage: node pdf-to-text.js <pdf-file.pdf>");
	process.exit(1);
}

// Check if file exists
if (!fs.existsSync(pdfFile)) {
	console.error(`Error: File "${pdfFile}" not found.`);
	console.log("Usage: node pdf-to-text.js <pdf-file.pdf>");
	process.exit(1);
}

// Function to wait for a specified amount of time
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to clean up Docker resources
async function cleanupDocker(dockerRef) {
	if (dockerRef.process) {
		console.log("\nCleaning up Docker resources...");
		try {
			// First try to kill the spawned process
			dockerRef.process.kill();
		} catch (err) {
			console.error(`Error killing Docker process: ${err.message}`);
		}

		try {
			// Then make sure the container is stopped
			await stopDockerContainer();
			console.log("Docker cleanup completed successfully.");
		} catch (err) {
			console.error(`Error in Docker cleanup: ${err.message}`);
		}
	}
}

// Function to start the Docker container and wait for it to be ready
async function startDockerContainer(dockerRef) {
	console.log("Starting Docker container...");

	// Start the Docker container
	dockerRef.process = spawn("docker", [
		"run",
		"--rm",
		"--platform",
		"linux/amd64",
		"--name",
		"pdf-document-layout-analysis",
		"-p",
		"5060:5060",
		"--entrypoint",
		"./start.sh",
		"huridocs/pdf-document-layout-analysis:v0.0.21",
	]);

	// Initialize variables for the retry logic
	let isReady = false;
	let retryCount = 0;
	const maxRetries = 10;
	const checkInterval = 10000; // 10 seconds between checks

	// Set up the output handlers to check for readiness message in both stdout and stderr
	// Some Docker containers may output their logs to stderr instead of stdout

	// Helper function used for checking stdout and stderr
	const checkDataString = (data) => {
		if (data.includes("[INFO] Application startup complete")) {
			console.log("Docker container is ready!");
			isReady = true;
		}
	};

	// Check stdout for readiness
	dockerRef.process.stdout.on("data", (data) => {
		const output = data.toString();
		console.log(`Docker stdout: ${output}`);

		// Check if the server is ready in stdout
		checkDataString(output);
	});

	// Check stderr for readiness - important as many containers output logs to stderr
	dockerRef.process.stderr.on("data", (data) => {
		const output = data.toString();
		console.error(`Docker stderr: ${output}`);

		// Check if the server is ready in stderr
		checkDataString(output);
	});

	dockerRef.process.on("error", (error) => {
		console.error(`Error starting Docker: ${error.message}`);
		throw new Error(`Failed to start Docker container: ${error.message}`);
	});

	// Wait for the container to be ready with retries
	while (!isReady && retryCount < maxRetries) {
		console.log(
			`Waiting for container to be ready... (attempt ${
				retryCount + 1
			}/${maxRetries})`
		);
		await sleep(checkInterval);
		retryCount++;
	}

	// Check if we timed out
	if (!isReady) {
		dockerRef.process.kill();
		throw new Error(
			`Docker container failed to start after ${maxRetries} attempts.`
		);
	}
}

// Function to process the PDF file
function processPdf(pdfFile) {
	console.log(`Processing PDF: ${pdfFile}`);
	return new Promise((resolve, reject) => {
		exec(
			`curl -X POST -F 'language=en' -F 'file=@${pdfFile}' localhost:5060`,
			{ maxBuffer: 10 * 1024 * 1024 }, // Increase buffer size for large responses
			(error, stdout, stderr) => {
				if (error) {
					console.error(`Error processing PDF: ${error.message}`);
					return reject(error);
				}
				if (stderr) {
					console.error(`curl stderr: ${stderr}`);
				}
				try {
					const jsonData = JSON.parse(stdout);
					resolve(jsonData);
				} catch (parseError) {
					console.error(
						`Error parsing JSON response: ${parseError.message}`
					);
					console.error(
						`Raw response: ${stdout.substring(0, 500)}...`
					);
					reject(parseError);
				}
			}
		);
	});
}

// Function to stop the Docker container
function stopDockerContainer() {
	console.log("Stopping Docker container...");
	return new Promise((resolve, reject) => {
		exec(
			"docker stop pdf-document-layout-analysis",
			(error, stdout, stderr) => {
				if (error) {
					console.error(`Error stopping Docker: ${error.message}`);
					return reject(error);
				}
				if (stderr) {
					console.error(`Docker stop stderr: ${stderr}`);
				}
				console.log(`Docker stop stdout: ${stdout}`);
				resolve();
			}
		);
	});
}

// Main execution function
export async function main() {
	// Create an object to hold the Docker process reference
	const dockerRef = { process: null };

	// Setup SIGINT handler (must be done before starting Docker)
	process.on("SIGINT", async function () {
		console.log("\nReceived SIGINT (Ctrl+C). Stopping gracefully...");
		await cleanupDocker(dockerRef);
		process.exit(0);
	});

	try {
		// Start Docker container and modify the process reference
		await startDockerContainer(dockerRef);

		// Give a little extra time for the server to stabilize
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Process the PDF file
		const jsonData = await processPdf(pdfFile);
		console.log(jsonData);

		// Convert JSON to text
		const result = convertPdfJsonToText(jsonData);
		const formattedText = result.text;
		let mediaItems = result.mediaItems;
		console.log(mediaItems);

		const pdfFileAbsolutePath = path.join(__dirname, pdfFile);

		mediaItems = await screenshotPdf(pdfFileAbsolutePath, mediaItems);
		console.log(mediaItems);

		// Create tmp directory in the same directory as the script
		const tmpDir = path.join(__dirname, "tmp");

		// Ensure the tmp directory exists
		if (!fs.existsSync(tmpDir)) {
			fs.mkdirSync(tmpDir, { recursive: true });
			console.log(`Created temporary directory: ${tmpDir}`);
		}

		// Save each image in mediaItems to the temporary directory
		mediaItems.forEach((item, index) => {
			if (item.base64) {
				const base64Data = item.base64.replace(
					/^data:image\/png;base64,/,
					""
				);
				const filePath = path.join(tmpDir, `image-${index + 1}.png`);
				fs.writeFileSync(filePath, base64Data, "base64");
				console.log(`Saved image to ${filePath}`);
			}
		});

		// Log the result
		console.log("\nPDF Text Conversion Result:");
		console.log(formattedText);
	} catch (error) {
		console.error(`Error in processing pipeline: ${error.message}`);
		await cleanupDocker(dockerRef);
		process.exit(1);
	} finally {
		// Always try to clean up the Docker container
		await cleanupDocker(dockerRef);
	}
}

// Run the main function
main();
