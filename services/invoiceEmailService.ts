
import { Invoice, Client, SystemSetting, Payment } from '../types';
import { formatDate, formatCurrency } from '../constants';

/**
 * Responsive Itemized Table (Fluid Layout)
 */
const getInvoiceTableHTML = (invoice: Invoice) => `
  <div style="width: 100%; overflow-x: auto; margin: 20px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; min-width: 300px; font-family: sans-serif;">
      <thead>
        <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
          <th align="left" style="padding: 12px 8px; font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; width: 40%;">Description of Service</th>
          <th align="right" style="padding: 12px 8px; font-size: 9px; color: #64748b; text-transform: uppercase; width: 15%;">Rate</th>
          <th align="center" style="padding: 12px 8px; font-size: 9px; color: #64748b; text-transform: uppercase; width: 10%;">Qty</th>
          <th align="center" style="padding: 12px 8px; font-size: 9px; color: #64748b; text-transform: uppercase; width: 15%;">Months</th>
          <th align="right" style="padding: 12px 8px; font-size: 9px; color: #64748b; text-transform: uppercase; width: 20%;">Total</th>
        </tr>
      </thead>
      <tbody style="color: #1e293b;">
        <tr>
          <td style="padding: 15px 8px; font-size: 11px; font-weight: bold; border-bottom: 1px solid #f1f5f9; vertical-align: top;">${invoice.Description || 'Fleet Services'}</td>
          <td align="right" style="padding: 15px 8px; font-size: 11px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">K ${formatCurrency(invoice.UnitPrice)}</td>
          <td align="center" style="padding: 15px 8px; font-size: 11px; font-weight: bold; border-bottom: 1px solid #f1f5f9; vertical-align: top;">${invoice.NoOfUnits}</td>
          <td align="center" style="padding: 15px 8px; font-size: 11px; font-weight: bold; color: #4f46e5; border-bottom: 1px solid #f1f5f9; vertical-align: top;">${invoice.PeriodMonths || 1}</td>
          <td align="right" style="padding: 15px 8px; font-size: 11px; font-weight: 800; border-bottom: 1px solid #f1f5f9; vertical-align: top;">K ${formatCurrency(invoice.TotalAmount)}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4" align="right" style="padding: 15px 8px 5px 8px; font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Grand Total</td>
          <td align="right" style="padding: 15px 8px 5px 8px; font-size: 12px; color: #0f172a; font-weight: 800;">K ${formatCurrency(invoice.TotalAmount)}</td>
        </tr>
        <tr>
          <td colspan="4" align="right" style="padding: 5px 8px; font-size: 10px; color: #10b981; text-transform: uppercase; font-weight: bold;">Amount Paid</td>
          <td align="right" style="padding: 5px 8px; font-size: 12px; color: #10b981; font-weight: 800;">- K ${formatCurrency(invoice.AmountPaid)}</td>
        </tr>
        <tr>
          <td colspan="4" align="right" style="padding: 10px 8px; font-size: 11px; color: #0f172a; text-transform: uppercase; font-weight: 800; border-top: 1px solid #e2e8f0;">Unsettled Balance</td>
          <td align="right" style="padding: 10px 8px; font-size: 16px; color: #4f46e5; font-weight: 900; border-top: 1px solid #e2e8f0;">K ${formatCurrency(invoice.BalanceDue)}</td>
        </tr>
      </tfoot>
    </table>
  </div>
`;

/**
 * Shared Fluid Email Wrapper (Responsive - No Scrolls)
 */
const getFluidWrapper = (content: string, title: string, settings: SystemSetting | null) => {
  const companyName = settings?.CompanyName || "Sally Chanza Business Café";
  const supportEmail = settings?.Email || "info@sallychanza.com";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; color: #1e293b; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    .wrapper { width: 100%; background-color: #f1f5f9; padding: 20px 0; }
    .container { width: 95%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { padding: 30px 20px; background-color: #0f172a; text-align: center; color: #ffffff; }
    .content { padding: 30px 20px; }
    .footer { padding: 25px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; background-color: #fafafa; }
    .button { display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; margin-top: 20px; text-align: center; }
    @media only screen and (max-width: 480px) {
      .content { padding: 20px 15px; }
      .button { width: 100%; box-sizing: border-box; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #6366f1; margin-bottom: 5px;">Digital Document Dispatch</div>
        <div style="font-size: 20px; font-weight: 900; text-transform: uppercase;">${companyName}</div>
      </div>
      <div class="content">
        <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">${title}</h2>
        ${content}
      </div>
      <div class="footer">
        <strong>${companyName}</strong><br>
        Zambia Operations • Registry Dispatch Hub<br>
        &copy; ${new Date().getFullYear()} All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
`;
};

export const generateInvoiceDispatchEmailHTML = (invoice: Invoice, client: Client, settings: SystemSetting | null): string => {
  const content = `
    <p style="font-size: 14px; line-height: 1.6;">Dear ${client.CompanyName},</p>
    <p style="font-size: 14px; line-height: 1.6;">A new service invoice <strong>#${invoice.InvoiceID}</strong> has been issued for your fleet management account. Please review the itemized breakdown below.</p>

    ${getInvoiceTableHTML(invoice)}

    <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 20px; margin-top: 20px; text-align: center;">
       <div style="font-size: 9px; color: #991b1b; font-weight: 800; text-transform: uppercase; margin-bottom: 5px;">Settlement Due By</div>
       <div style="font-size: 18px; color: #991b1b; font-weight: 900;">${formatDate(invoice.DueDate)}</div>
       <div style="font-size: 10px; color: #ef4444; font-weight: 700; margin-top: 5px;">Cycle Coverage: ${invoice.PeriodMonths || 1} Month(s)</div>
    </div>

    <div style="text-align: center;">
      <a href="${settings?.PortalUrl || '#'}" class="button">View & Pay Online</a>
    </div>
  `;
  return getFluidWrapper(content, 'New Invoice Notification', settings);
};

export const generateInvoicePaidEmailHTML = (invoice: Invoice, client: Client, settings: SystemSetting | null): string => {
  return getPaymentConfirmationEmailHTML(invoice, client, settings);
};

export const getPaymentConfirmationEmailHTML = (invoice: Invoice, client: Client, settings: SystemSetting | null): string => {
  const content = `
    <p style="font-size: 14px; line-height: 1.6;">Dear ${client.CompanyName},</p>
    <p style="font-size: 14px; line-height: 1.6;">We have successfully processed your payment. Your service period has been updated as follows:</p>

    <div style="background-color: #f8fafc; border-radius: 16px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
      <table width="100%">
        <tr>
          <td style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Amount Paid</td>
          <td align="right" style="font-size: 16px; color: #10b981; font-weight: 800;">K ${formatCurrency(invoice.AmountPaid)}</td>
        </tr>
        <tr>
          <td style="padding-top: 10px; font-size: 10px; color: #94a3b8; font-weight: bold; text-transform: uppercase;">Duration Covered</td>
          <td align="right" style="padding-top: 10px; font-size: 12px; color: #0f172a; font-weight: 800;">${invoice.PeriodMonths || 1} Month(s)</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 12px; padding: 20px; text-align: center;">
       <div style="font-size: 9px; color: #1e40af; font-weight: 800; text-transform: uppercase; margin-bottom: 5px;">Next Payment Schedule</div>
       <div style="font-size: 18px; color: #1e3a8a; font-weight: 900;">${formatDate(invoice.DueDate)}</div>
    </div>

    <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin-top: 25px;">Thank you for choosing our fleet solutions. A PDF version of this receipt is attached for your records.</p>
  `;
  return getFluidWrapper(content, 'Payment Receipt Confirmation', settings);
};

export const generateInvoiceUpdateEmailHTML = (invoice: Invoice, client: Client, settings: SystemSetting | null): string => {
  const content = `
    <p style="font-size: 14px; line-height: 1.6;">Dear ${client.CompanyName},</p>
    <p style="font-size: 14px; line-height: 1.6;">The details for invoice <strong>#${invoice.InvoiceID}</strong> have been updated in the system. The latest summary is below:</p>
    ${getInvoiceTableHTML(invoice)}
  `;
  return getFluidWrapper(content, 'Invoice Details Updated', settings);
};

export const generateInvoiceReminderEmailHTML = (invoice: Invoice, client: Client, isPastDue: boolean, settings: SystemSetting | null): string => {
  const content = `
    <p style="font-size: 14px; line-height: 1.6;">Dear ${client.CompanyName},</p>
    <p style="font-size: 14px; line-height: 1.6;">
      ${isPastDue 
        ? `Our records show that invoice <strong>#${invoice.InvoiceID}</strong> is now past its due date. Please settle the balance immediately to avoid service restrictions.` 
        : `This is a friendly reminder that payment for invoice <strong>#${invoice.InvoiceID}</strong> is due soon.`}
    </p>
    
    <div style="background-color: ${isPastDue ? '#fef2f2' : '#fffbeb'}; border: 1px solid ${isPastDue ? '#fee2e2' : '#fef3c7'}; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
       <div style="font-size: 9px; color: ${isPastDue ? '#991b1b' : '#92400e'}; font-weight: 800; text-transform: uppercase;">Outstanding Amount</div>
       <div style="font-size: 22px; color: ${isPastDue ? '#991b1b' : '#92400e'}; font-weight: 900;">K ${formatCurrency(invoice.BalanceDue)}</div>
       <div style="font-size: 10px; font-weight: bold; margin-top: 5px;">Due Date: ${formatDate(invoice.DueDate)}</div>
    </div>

    <p style="font-size: 13px; color: #64748b; text-align: center;">If you have already made this payment, please disregard this notice.</p>
  `;
  return getFluidWrapper(content, isPastDue ? 'Overdue Payment Notice' : 'Upcoming Payment Reminder', settings);
};
