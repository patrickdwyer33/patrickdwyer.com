import { promises as fs } from "fs";

const filePath = "./ogFelidae.json";
const outPath = "./felidae.json";

const felidaeFile = fs.readFile(filePath, "utf8");

felidaeFile.then((file) => {
	const felidae = JSON.parse(file);
	const arr = felidae.map((cat) => {
		return cat.toLowerCase().replace("cats", "cat").replace("'", "");
	});
	fs.writeFile(outPath, JSON.stringify(arr, null, 4));
});
