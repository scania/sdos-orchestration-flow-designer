const fs = require("fs");
const path = require("path");

const COMPONENTS_DIR = "./node_modules/@scania/tegel/dist/components";
const OUTPUT_DIR = "./src/extractedStyles";

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

fs.readdirSync(COMPONENTS_DIR).forEach((file) => {
  const componentPath = path.join(COMPONENTS_DIR, file);

  try {
    const componentSource = fs.readFileSync(componentPath, "utf-8");

    // This regex assumes that the CSS strings are wrapped in double quotes and
    // does not contain unescaped double quotes inside.
    const cssRegex = /const (\w+Css) = "([^"]*?)"/gs;
    let match;

    while ((match = cssRegex.exec(componentSource)) !== null) {
      let cssContent = match[2].replace(/\\n/g, "\n").replace(/\\"/g, '"');

      // Validation step (simple check)
      if (!isValidCSS(cssContent)) {
        console.error(`Invalid CSS extracted from ${file}. Skipping.`);
        continue;
      }

      const fileNameWithoutExtension = path.basename(file, path.extname(file));
      const outputFilePath = path.join(
        OUTPUT_DIR,
        `${fileNameWithoutExtension}.module.css`
      );

      fs.writeFileSync(outputFilePath, cssContent, "utf-8");
      console.log(`Styles extracted for ${file} to ${outputFilePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}. Details: ${error.message}`);
  }
});

function isValidCSS(cssContent) {
  // A simple check to ensure every opening curly brace has a closing one
  const openBraces = (cssContent.match(/{/g) || []).length;
  const closeBraces = (cssContent.match(/}/g) || []).length;

  return openBraces === closeBraces;
}
