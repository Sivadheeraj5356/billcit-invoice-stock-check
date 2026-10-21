# Billcit Invoice Stock Check

A dependency-free Node.js checker for the kind of billing and inventory workflows Billcit serves: invoices, payments, GST fields, and stock movements for small shops.

The tool reviews one synthetic shop-day export and flags issues before the day is treated as clean: duplicate invoice numbers, negative stock, payment totals that do not match invoice totals, missing GSTIN where required, and stock movements that are not linked to an invoice.

## Run

```bash
npm test
npm run check
```

The included data is synthetic and contains no Billcit, customer, or shop data.

## Output

The CLI prints `PASS` when the day is review-ready and `FAIL` with specific issues when it is not. It is an evidence check, not accounting or tax advice.
