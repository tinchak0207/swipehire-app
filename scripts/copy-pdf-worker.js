
const fs = require('fs');
const path = require('path');

const source = path.resolve(
  __dirname,
  '../node_modules/pdfjs-dist/build/pdf.worker.min.mjs'
);
const destination = path.resolve(__dirname, '../public/pdf.worker.min.js');

fs.copyFileSync(source, destination);
