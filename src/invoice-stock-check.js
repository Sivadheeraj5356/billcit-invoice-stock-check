function money(value) {
  return Math.round(Number(value) * 100) / 100;
}

function validateShopDay(day) {
  const issues = [];
  if (!day || typeof day !== 'object') return { ok: false, issues: ['shop day must be an object'] };
  const invoices = Array.isArray(day.invoices) ? day.invoices : [];
  const stockMoves = Array.isArray(day.stockMoves) ? day.stockMoves : [];
  if (!day.shop || typeof day.shop !== 'object' || !day.shop.id) issues.push('shop.id is required');
  if (!day.date) issues.push('date is required');
  if (invoices.length === 0) issues.push('at least one invoice is required');

  const seen = new Set();
  const invoiceIds = new Set();
  for (const invoice of invoices) {
    if (!invoice.id) issues.push('invoice.id is required');
    if (seen.has(invoice.id)) issues.push(`duplicate invoice id: ${invoice.id}`);
    seen.add(invoice.id);
    invoiceIds.add(invoice.id);
    if (!Array.isArray(invoice.items) || invoice.items.length === 0) {
      issues.push(`${invoice.id}: at least one item is required`);
      continue;
    }
    const itemTotal = money(invoice.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0));
    const invoiceTotal = money(invoice.total);
    if (itemTotal !== invoiceTotal) issues.push(`${invoice.id}: total ${invoiceTotal} does not match item total ${itemTotal}`);
    const paid = money(invoice.paid);
    if (paid < 0 || paid > invoiceTotal) issues.push(`${invoice.id}: paid amount ${paid} is outside invoice total ${invoiceTotal}`);
    if (invoice.taxCategory === 'interstate' && !invoice.buyerGstin) issues.push(`${invoice.id}: buyerGstin is required for interstate sales`);
  }

  const stock = new Map();
  const openingStock = day.openingStock && typeof day.openingStock === 'object' ? day.openingStock : {};
  for (const [sku, quantity] of Object.entries(openingStock)) stock.set(sku, Number(quantity || 0));
  for (const move of stockMoves) {
    if (!move.sku) issues.push('stock move sku is required');
    if (!move.invoiceId || !invoiceIds.has(move.invoiceId)) issues.push(`${move.sku || 'unknown'}: stock move is not linked to a known invoice`);
    const next = Number(stock.get(move.sku) || 0) - Number(move.quantity || 0);
    if (next < 0) issues.push(`${move.sku}: stock would become negative (${next})`);
    stock.set(move.sku, next);
  }

  return { ok: issues.length === 0, issues, endingStock: Object.fromEntries(stock) };
}

module.exports = { validateShopDay };
