#!/usr/bin/env node

/**
 * Flowchart Renderer
 * Renders Mermaid diagrams to PNG using mmdc
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MERMAID_CLI_PATH = '/Users/shiruijun/.npm-global/bin/mmdc';

const renderToPng = (mermaidCode, outputPath, fontFamily = 'Source Han Sans SC, Noto Sans SC, Microsoft YaHei, sans-serif') => {
  // Create temp input file
  const inputFile = '/tmp/flowchart.mmd';

  // Prepend font configuration to mermaid code
  const configBlock = `%%{init: {'theme': 'base', 'themeVariables': { 'fontFamily': '${fontFamily}' } }}%%\n`;
  const fullMermaid = configBlock + mermaidCode;

  fs.writeFileSync(inputFile, fullMermaid);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Render with mmdc
  try {
    execSync(`${MERMAID_CLI_PATH} -i ${inputFile} -o ${outputPath} -w 1200 -H 800 --scale 2`, {
      stdio: 'inherit'
    });
    return true;
  } catch (error) {
    console.error('Render failed:', error.message);
    return false;
  }
};

// Generate output path based on input document path
const generateOutputPath = (inputPath) => {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 16);
  const filename = `flowchart-${timestamp}.png`;

  if (inputPath && inputPath !== 'stdin') {
    const dir = path.dirname(inputPath);
    return path.join(dir, filename);
  }

  // Fallback to current working directory
  return path.join(process.cwd(), filename);
};

module.exports = { renderToPng, generateOutputPath };