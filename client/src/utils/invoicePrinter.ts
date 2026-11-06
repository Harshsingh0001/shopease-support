export interface InvoicePrintData {
  orderNumber: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  gstin?: string;
  billedTo?: string;
  carrier?: string;
  trackingNumber?: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
}

export const printTaxInvoice = (data: InvoicePrintData) => {
  const invoiceWindow = window.open("", "_blank");
  if (!invoiceWindow) return;

  const subtotal = Math.round(data.totalAmount / 1.18);
  const gstAmount = data.totalAmount - subtotal;

  invoiceWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>ShopEase Tax Invoice - ${data.orderNumber}</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1f2923; margin: 0; background: #fff; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 20px; }
          .title { font-size: 26px; font-weight: 900; color: #124a38; letter-spacing: -0.5px; }
          .badge { display: inline-block; background: #e6f4ea; color: #059669; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 6px; margin-top: 4px; }
          .meta-grid { display: flex; justify-content: space-between; margin-top: 24px; font-size: 13px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8e2; font-size: 13px; }
          th { background: #f7f7f4; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
          .right { text-align: right; }
          .totals-table { margin-left: auto; width: 320px; margin-top: 20px; font-size: 13px; }
          .totals-table td { border: none; padding: 6px 12px; }
          .grand-total { font-size: 18px; font-weight: 900; color: #124a38; border-top: 2px solid #124a38 !important; padding-top: 10px !important; }
          .footer { margin-top: 50px; font-size: 11px; opacity: 0.7; text-align: center; border-top: 1px solid #e2e8e2; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">ShopEase.ai</div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">Omnichannel E-Commerce & Autonomous AI Platform</div>
            <div style="font-size: 12px; opacity: 0.8;">GSTIN: ${data.gstin || "29AABCU9603R1ZM"} • HSN/SAC: 85183000</div>
            <span class="badge">Official Tax Invoice • Input Tax Credit Compliant</span>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: 900; color: #059669;">TAX INVOICE</div>
            <div style="font-size: 13px; font-weight: bold; margin-top: 4px;">Invoice #: ${data.invoiceNumber || `INV-${data.orderNumber}`}</div>
            <div style="font-size: 12px; opacity: 0.8;">Date: ${data.invoiceDate || new Date().toLocaleDateString("en-IN")}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div>
            <strong>Billed & Shipped To:</strong><br />
            ${data.billedTo || "Valued Customer"}<br />
            <strong>Logistics Carrier:</strong> ${data.carrier || "Delhivery Express"}<br />
            <strong>Air Waybill (AWB):</strong> ${data.trackingNumber || "DL789456123IN"}
          </div>
          <div style="text-align: right;">
            <strong>Fulfillment Warehouse:</strong><br />
            ShopEase Hub Central, Plot 42<br />
            Electronic City Phase 1<br />
            Bengaluru, Karnataka 560100
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th class="right">Qty</th>
              <th class="right">Unit Price</th>
              <th class="right">Total (INR)</th>
            </tr>
          </thead>
          <tbody>
            ${data.items
              .map(
                (item) => `
              <tr>
                <td><strong>${item.name}</strong><br/><span style="font-size: 11px; opacity: 0.7;">1-Year Official Brand Warranty Included</span></td>
                <td class="right">${item.quantity}</td>
                <td class="right">₹${item.price.toLocaleString("en-IN")}</td>
                <td class="right">₹${(item.price * item.quantity).toLocaleString("en-IN")}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <table class="totals-table">
          <tr>
            <td>Taxable Subtotal:</td>
            <td class="right">₹${subtotal.toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td>IGST (18% Integrated GST):</td>
            <td class="right">₹${gstAmount.toLocaleString("en-IN")}</td>
          </tr>
          <tr class="grand-total">
            <td>Grand Total (INR):</td>
            <td class="right">₹${data.totalAmount.toLocaleString("en-IN")}</td>
          </tr>
        </table>

        <div class="footer">
          This is a computer-generated GST tax invoice and does not require a physical signature.<br/>
          For 24/7 autonomous support, order tracking or 7-day doorstep replacement, visit <strong>ShopEase.ai Support Portal</strong>.
        </div>

        <script>
          window.print();
        </script>
      </body>
    </html>
  `);
};
