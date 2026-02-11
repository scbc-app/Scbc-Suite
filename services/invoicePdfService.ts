
import { Invoice, Client, SystemSetting, DocumentType, InvoiceStatus } from '../types';
import { formatDate, formatCurrency } from '../constants';

export const generateInvoiceHTML = (
  invoice: Partial<Invoice>,
  client: Client | undefined,
  companySettings: SystemSetting | null
) => {
  const companyName = companySettings?.CompanyName || "Sally Chanza Business Café";
  const addressLines = (companySettings?.Address || "House #39 Salam Park, Lusaka - Zambia").split('|');
  const phones = companySettings?.Phone || "260966862012";
  const email = companySettings?.Email || "notifications@sallychanza.com";
  const website = companySettings?.Website || "www.sallychanza.com";
  const companyLogo = companySettings?.Logo || null;
  
  const isQuotation = invoice.DocType === DocumentType.Quotation;
  const isPaid = invoice.Status === InvoiceStatus.Paid;
  const isOverdue = invoice.Status === InvoiceStatus.Overdue;

  let docTitle = invoice.DocType || "Invoice";
  if (isPaid && !isQuotation) docTitle = "Payment Receipt";

  const period = Number(invoice.PeriodMonths) || 1;
  const units = Number(invoice.NoOfUnits) || 1;
  const rate = Number(invoice.UnitPrice) || 0;
  
  const subtotal = (rate * units * period) || (invoice.TotalAmount || 0);
  const amountPaid = Number(invoice.AmountPaid) || 0;
  const balanceDue = isPaid ? 0 : (invoice.BalanceDue !== undefined ? invoice.BalanceDue : Math.max(0, subtotal - amountPaid));

  const resolvedClientName = client?.CompanyName || invoice.ClientName || 'Valued Client';

  // Standardized Description Logic
  const itemDescription = invoice.Description || (
    (rate > 0 && units > 0) 
      ? `Fleet Management Service (${units} Units for ${period} Month${period > 1 ? 's' : ''})`
      : "Professional Technical Services"
  );

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        @page { size: A4; margin: 0; }
        body { font-family: 'Inter', sans-serif; color: #1e293b; margin: 0; padding: 0; background: #ffffff; line-height: 1.5; }
        .page { width: 210mm; min-height: 297mm; padding: 20mm; margin: 0 auto; box-sizing: border-box; position: relative; }
        
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .company-info h1 { font-size: 16pt; font-weight: 800; margin: 0; color: #0f172a; }
        .company-info p { font-size: 9pt; color: #64748b; margin: 2px 0; }
        
        .doc-meta { text-align: right; }
        .status-pill { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 8pt; font-weight: 700; text-transform: uppercase; margin-bottom: 10px; }
        .status-paid { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .status-pending { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
        .status-overdue { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

        .doc-meta h2 { font-size: 22pt; font-weight: 900; margin: 0; color: #0f172a; text-transform: uppercase; }
        .meta-data { margin-top: 10px; font-size: 10pt; display: grid; gap: 4px; }

        .billing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
        .section-label { font-size: 8pt; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; display: block; }
        .client-name { font-size: 12pt; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .address-text { font-size: 9pt; color: #475569; }

        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background: #f8fafc; text-align: left; padding: 12px; font-size: 8pt; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        .items-table td { padding: 15px 12px; font-size: 10pt; border-bottom: 1px solid #f1f5f9; }

        .summary-container { display: flex; justify-content: flex-end; }
        .summary-box { width: 300px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 9pt; color: #475569; }
        .summary-row.total { border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 12px; font-size: 12pt; font-weight: 800; color: #0f172a; }
        .next-due-banner { background: #f0f9ff; border: 1px solid #bae6fd; padding: 12px; border-radius: 8px; margin-top: 20px; color: #0369a1; font-size: 9pt; text-align: center; }

        .footer { position: absolute; bottom: 20mm; left: 20mm; right: 20mm; border-top: 1px solid #f1f5f9; padding-top: 15px; text-align: center; font-size: 8pt; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="company-info">
            ${companyLogo ? `<img src="${companyLogo}" style="height:50px; margin-bottom:10px;" />` : ''}
            <h1>${companyName}</h1>
            ${addressLines.map(line => `<p>${line.trim()}</p>`).join('')}
            <p>${phones} | ${email}</p>
          </div>
          <div class="doc-meta">
            <div class="status-pill ${isPaid ? 'status-paid' : isOverdue ? 'status-overdue' : 'status-pending'}">
               ${isPaid ? 'Payment Confirmed' : isOverdue ? 'Payment Overdue' : 'Payment Pending'}
            </div>
            <h2>${docTitle}</h2>
            <div class="meta-data">
              <div><strong>No:</strong> ${invoice.InvoiceID}</div>
              <div><strong>Date:</strong> ${formatDate(invoice.InvoiceDate)}</div>
              <div><strong>Valid Until:</strong> ${formatDate(invoice.DueDate)}</div>
            </div>
          </div>
        </div>

        <div class="billing-grid">
          <div>
            <span class="section-label">Bill To</span>
            <div class="client-name">${resolvedClientName}</div>
            <div class="address-text">${client?.BillingAddress || 'N/A'}</div>
            <div class="address-text">Email: ${client?.Email || 'N/A'}</div>
          </div>
          <div>
            <span class="section-label">Account Details</span>
            <div class="address-text"><strong>Contract Ref:</strong> ${invoice.ContractID || 'ADHOC'}</div>
            <div class="address-text"><strong>Service Type:</strong> ${invoice.ServiceType || 'Unified Managed Fleet'}</div>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 60%;">Description of Service</th>
              <th style="text-align: center; width: 15%;">Unit Price</th>
              <th style="text-align: center; width: 10%;">Qty</th>
              <th style="text-align: right; width: 15%;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style="font-weight: 600;">${itemDescription}</div>
                <div style="font-size: 8pt; color: #94a3b8; margin-top: 4px;">Includes priority technical support and system access.</div>
              </td>
              <td style="text-align: center;">K ${formatCurrency(rate)}</td>
              <td style="text-align: center;">${units}</td>
              <td style="text-align: right; font-weight: 600;">K ${formatCurrency(subtotal)}</td>
            </tr>
          </tbody>
        </table>

        <div class="summary-container">
          <div class="summary-box">
            <div class="summary-row"><span>Subtotal</span><span>K ${formatCurrency(subtotal)}</span></div>
            <div class="summary-row" style="color: #10b981;"><span>Total Paid</span><span>- K ${formatCurrency(amountPaid)}</span></div>
            <div class="summary-row total">
              <span>${isPaid ? 'Balance' : 'Amount Due'}</span>
              <span>K ${formatCurrency(isPaid ? 0 : balanceDue)}</span>
            </div>
            
            ${isPaid ? `
              <div class="next-due-banner">
                <strong>NEXT PAYMENT DUE:</strong> ${formatDate(invoice.DueDate)}
              </div>
            ` : ''}
          </div>
        </div>

        <div class="footer">
          Thank you for your business. For any inquiries, please contact us at ${email}<br>
          ${website}
        </div>
      </div>
    </body>
    </html>
  `;
};
