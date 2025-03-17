/**
 * PDF Screenshot Module
 * Takes screenshots of PDF documents based on coordinates using Puppeteer
 */

import puppeteer from "puppeteer";

export default async function screenshotPdf(pdfUrl) {
	const browser = await puppeteer.launch({
		headless: "new",
		defaultViewport: null,
		args: [
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-web-security",
			"--disable-features=IsolateOrigins",
			"--disable-site-isolation-trials",
		],
	});
	const page = await browser.newPage();
	await page.setContent(previewCreatorPage(pdfUrl));
	await page.waitForSelector("#renderingComplete");
	await page.waitForNetworkIdle();
	const pdfPage = await page.$("#page");
	const screenshot = pdfPage.screenshot({
		type: "png",
		encoding: "base64",
		omitBackground: true,
	});

	return screenshot;
}

function previewCreatorPage(url) {
	return `<html lang="en">

  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
      <style>
          body {
              width: 100vw;
              height: 100vh;
              margin: 0px;
          }
          #page {
              display: flex;
              width: 100%;
          }
      </style>
  
      <title>Document</title>
  </head>
  
  <body>
      <canvas id="page"></canvas>
      <script src="https://mozilla.github.io/pdf.js/build/pdf.js"></script>
      <script>
          var pdfjsLib = window['pdfjs-dist/build/pdf'];
          (async () => {
              const pdf = await pdfjsLib.getDocument('${url}').promise;
              const page = await pdf.getPage(1);
  
              const viewport = page.getViewport({ scale: 1 });
          
              const canvas = document.getElementById('page');
              const context = canvas.getContext('2d');
  
              canvas.height = viewport.height;
              canvas.width = viewport.width;
  
              const renderContext = {
                  canvasContext: context,
                  viewport: viewport
              };
  
            await page.render(renderContext).promise;

            const completeElement = document.createElement("span");
            completeElement.id = 'renderingComplete';
            document.body.append(completeElement);
          })();
      </script>
  </body>
  `;
}
