#!/usr/bin/env node
const fs = require('fs');
const { validateShopDay } = require('./invoice-stock-check');

const path = process.argv[2];
if (!path) {
  console.error('Usage: node src/cli.js <shop-day.json>');
  process.exit(2);
}

let day;
try {
  day = JSON.parse(fs.readFileSync(path, 'utf8'));
} catch (error) {
  console.error(`Could not read shop-day JSON: ${error.message}`);
  process.exit(2);
}

const result = validateShopDay(day);
if (result.ok) {
  console.log('PASS: shop day is review-ready');
  console.log(JSON.stringify(result.endingStock, null, 2));
} else {
  console.log('FAIL: shop day is not review-ready');
  result.issues.forEach((issue) => console.log(`- ${issue}`));
}
process.exit(result.ok ? 0 : 1);
