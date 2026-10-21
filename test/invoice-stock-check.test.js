const test = require('node:test');
const assert = require('node:assert/strict');
const { validateShopDay } = require('../src/invoice-stock-check');

const validDay = {
  shop: { id: 'synthetic-shop' },
  date: '2026-10-21',
  openingStock: { 'rice-5kg': 10, 'oil-1l': 8 },
  invoices: [{
    id: 'INV-001',
    taxCategory: 'local',
    items: [
      { sku: 'rice-5kg', quantity: 1, unitPrice: 425 },
      { sku: 'oil-1l', quantity: 2, unitPrice: 150 }
    ],
    total: 725,
    paid: 725
  }],
  stockMoves: [
    { sku: 'rice-5kg', quantity: 1, invoiceId: 'INV-001' },
    { sku: 'oil-1l', quantity: 2, invoiceId: 'INV-001' }
  ]
};

test('accepts a consistent shop day', () => {
  const result = validateShopDay(validDay);
  assert.equal(result.ok, true);
  assert.deepEqual(result.issues, []);
});

test('rejects invoice total mismatch', () => {
  const day = structuredClone(validDay);
  day.invoices[0].total = 700;
  const result = validateShopDay(day);
  assert.equal(result.ok, false);
  assert.match(result.issues.join('\n'), /does not match item total/);
});

test('rejects duplicate invoice ids', () => {
  const day = structuredClone(validDay);
  day.invoices.push(structuredClone(day.invoices[0]));
  const result = validateShopDay(day);
  assert.equal(result.ok, false);
  assert.match(result.issues.join('\n'), /duplicate invoice id/);
});

test('rejects unlinked stock moves', () => {
  const day = structuredClone(validDay);
  day.stockMoves[0].invoiceId = 'INV-UNKNOWN';
  const result = validateShopDay(day);
  assert.equal(result.ok, false);
  assert.match(result.issues.join('\n'), /not linked to a known invoice/);
});

test('requires buyer GSTIN for interstate sales', () => {
  const day = structuredClone(validDay);
  day.invoices[0].taxCategory = 'interstate';
  const result = validateShopDay(day);
  assert.equal(result.ok, false);
  assert.match(result.issues.join('\n'), /buyerGstin/);
});
