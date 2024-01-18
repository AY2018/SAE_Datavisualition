const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const port = 3000;

// Read and store CSV data
let unemploymentRates = {};

fs.createReadStream('path_to_your_csv/unemployment.csv') // Replace with your CSV file path
  .pipe(csv())
  .on('data', (row) => {
    unemploymentRates[row.Year] = parseFloat(row.UnemploymentRate);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

// Serve static files from current directory
app.use(express.static('.'));

// Route to send unemployment data
app.get('/unemployment', (req, res) => {
  res.json(unemploymentRates);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

