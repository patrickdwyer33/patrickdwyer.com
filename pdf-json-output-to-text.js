/**
 * Converts PDF JSON output (from pdf extraction tools) into a format optimized for LLM understanding
 * @param {Array} jsonData - Array of objects containing PDF text elements and their metadata
 * @returns {string} - Formatted text with preserved structural elements
 */
export function convertPdfJsonToText(jsonData) {
	if (!Array.isArray(jsonData) || jsonData.length === 0) {
		return "No content found in the provided JSON data.";
	}

	// Process each element in its original order
	let result = "";
	let currentPage = null;

	// Iterate through items in their original order
	jsonData.forEach((item) => {
		// Add page marker if we're moving to a new page
		if (item.page_number !== currentPage) {
			if (currentPage !== null) {
				result += `\n\n--- Page ${item.page_number} ---\n\n`;
			}
			currentPage = item.page_number;
		}

		// Skip empty text
		if (!item.text || !item.text.trim()) return;

		// Format based on element type
		switch (item.type) {
			case "Section header":
				result += `\n## ${item.text}\n`;
				break;
			case "List item":
				result += `\n• ${item.text}`;
				break;
			case "Picture":
				if (item.text.trim()) {
					result += `\n$\{Image: ${item.text}\}\n`;
				} else {
					result += "\n${Image]}\n";
				}
				break;
			case "Table":
				result += `\n$\{Table content: ${item.text}\}\n`;
				break;
			case "Text":
			default:
				// Check if this might be a continuation of previous text
				const lastChar = result.slice(-1);
				const needsSpace = lastChar !== "\n" && lastChar !== "";
				result += needsSpace ? ` ${item.text}` : item.text;
		}

		// Add a newline after each item if appropriate and if it doesn't end with one
		if (
			!result.endsWith("\n") &&
			(item.type === "Section header" ||
				item.type === "List item" ||
				item.type === "Picture" ||
				item.type === "Table")
		) {
			result += "\n";
		}
	});

	// Post-processing to clean up excessive whitespace and improve formatting
	return result
		.replace(/\n{3,}/g, "\n\n") // Replace excessive newlines
		.replace(/\s+\n/g, "\n") // Remove trailing spaces before newlines
		.trim();
}
