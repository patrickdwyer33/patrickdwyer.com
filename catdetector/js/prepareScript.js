import { promises as fs } from "fs";

const felidaePath = "./felidae.json";
const scriptPath = "./js/scriptTemplate.js";

const felidaeFile = fs.readFile(felidaePath, "utf8");
const scriptFile = fs.readFile(scriptPath, "utf8");

Promise.all([felidaeFile, scriptFile]).then((files) => {
	let out = `const felidae = ${files[0]}\n${files[1]}`;
	fs.writeFile("./js/script.js", out);
});
