
import { Ticket, Client, SystemSetting } from '../types';

const getEmailTemplate = (content: string, settings: SystemSetting | null) => {
  const companyName = settings?.CompanyName || "Sally Chanza Business Café";
  const supportEmail = settings?.Email || "support@sallychanza.com";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f9; color: #374151; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse !important; }
    .wrapper { width: 100% !important; max-width: 100%; background-color: #f4f7f9; padding: 20px 0; }
    .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    .header { padding: 25px; background-color: #0f172a; text-align: center; }
    .header-text { color: #ffffff; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
    .content { padding: 30px; line-height: 1.6; }
    .footer { padding: 20px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
    .important-notice { background-color: #f9fafb; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .important-title { font-weight: 800; font-size: 11px; color: #4338ca; text-transform: uppercase; margin-bottom: 5px; display: block; }
    .data-box { background-color: #f3f4f6; border-radius: 6px; padding: 15px; margin: 15px 0; }
    .data-row { font-size: 13px; margin-bottom: 4px; }
    .data-label { font-weight: 700; color: #4b5563; }
    h2 { font-size: 18px; color: #111827; margin: 0 0 15px 0; font-weight: 800; }
    p { margin-bottom: 15px; font-size: 14px; }
    @media only screen and (max-width: 600px) {
      .content { padding: 20px; }
      .container { width: 95% !important; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <p class="header-text">Support Division</p>
      </div>
      <div class="content">
        ${content}
        <div class="important-notice">
          <span class="important-title">Important Notice</span>
          <p style="margin: 0; font-size: 12px;">This is an official communication regarding your technical service account. Please preserve the Ticket ID for all future inquiries related to this specific request.</p>
        </div>
      </div>
      <div class="footer">
        ${companyName} &bull; Lusaka, Zambia<br>
        Direct Support Line: ${supportEmail}<br>
        &copy; ${new Date().getFullYear()} Automated System Dispatch.
      </div>
    </div>
  </div>
</body>
</html>
`;
};

export const generateTicketNewEmailHTML = (ticket: Ticket, client: Client, settings: SystemSetting | null): string => {
  const content = `
    <h2>Support Request Recorded</h2>
    <p>Dear ${client.CompanyName},</p>
    <p>This email confirms that your support request has been successfully recorded in our system. Our technical team has been notified and will review your submission shortly.</p>
    <div class="data-box">
      <div class="data-row"><span class="data-label">Ticket ID:</span> #${ticket.TicketID}</div>
      <div class="data-row"><span class="data-label">Subject:</span> ${ticket.Subject}</div>
      <div class="data-row"><span class="data-label">Status:</span> Open / Queued</div>
    </div>
    <p>You may monitor the progress of this request through your client portal.</p>
  `;
  return getEmailTemplate(content, settings);
};

export const generateTicketUpdateEmailHTML = (ticket: Ticket, client: Client, settings: SystemSetting | null): string => {
  const content = `
    <h2>Update: Support Ticket #${ticket.TicketID}</h2>
    <p>Dear ${client.CompanyName},</p>
    <p>The status of your support request has been updated by our technical department. Please review the details below:</p>
    <div class="data-box">
      <div class="data-row"><span class="data-label">Current Status:</span> ${ticket.Status}</div>
      <div class="data-row"><span class="data-label">Recent Activity:</span> ${ticket.Resolution || 'Technical investigation in progress.'}</div>
    </div>
    <p>Further updates will be dispatched as more information becomes available.</p>
  `;
  return getEmailTemplate(content, settings);
};

export const generateTicketResolvedEmailHTML = (ticket: Ticket, client: Client, settings: SystemSetting | null): string => {
  const supportEmail = settings?.Email || "support@sallychanza.com";
  const content = `
    <h2>Resolution: Support Ticket #${ticket.TicketID}</h2>
    <p>Dear ${client.CompanyName},</p>
    <p>Our technical team has marked your support request as resolved. We trust the solution provided meets your requirements.</p>
    <div class="data-box">
      <div class="data-row" style="color: #059669; font-weight: 700;">Final Status: Case Resolved</div>
      <div class="data-row" style="margin-top: 10px;"><span class="data-label">Outcome Details:</span></div>
      <p style="font-size: 13px; color: #4b5563; margin-top: 5px;">${ticket.Resolution || 'The requested action has been completed.'}</p>
    </div>
    <p>If you require additional assistance with this specific issue, please do not hesitate to contact us at ${supportEmail}.</p>
  `;
  return getEmailTemplate(content, settings);
};
