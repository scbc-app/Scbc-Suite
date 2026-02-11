
import { Client, Agent, SystemSetting, Invoice } from '../types';
import { formatCurrency, formatDate } from '../constants';

/**
 * Triggered when a client in an agent's portfolio has an overdue balance.
 */
export const generateAgentOverdueAlertEmailHTML = (
  invoice: Invoice,
  client: Client,
  agent: Agent,
  settings: SystemSetting | null
): string => {
  const companyName = settings?.CompanyName || "Sally Chanza Business Café";
  const portalUrl = settings?.PortalUrl || "https://sallychanza.com/portal";
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #fff1f2; font-family: -apple-system, sans-serif; color: #334155;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fff1f2; padding: 20px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #fecdd3;">
              <tr>
                <td style="padding: 30px;">
                  <h2 style="margin: 0 0 10px 0; color: #e11d48; font-size: 18px; text-transform: uppercase;">Collection Alert</h2>
                  <p style="font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 25px;">Attention: ${agent.AgentName}</p>
                  
                  <p style="font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
                    This is an automated alert. Client <strong>${client.CompanyName}</strong> has an overdue invoice in your portfolio.
                  </p>

                  <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
                    <p style="margin: 5px 0; font-size: 13px;"><strong>Invoice No:</strong> #${invoice.InvoiceID}</p>
                    <p style="margin: 5px 0; font-size: 13px;"><strong>Outstanding:</strong> K${formatCurrency(invoice.BalanceDue)}</p>
                    <p style="margin: 5px 0; font-size: 13px;"><strong>Due Date:</strong> ${formatDate(invoice.DueDate)}</p>
                    <p style="margin: 5px 0; font-size: 13px;"><strong>Client Phone:</strong> ${client.Phone}</p>
                  </div>

                  <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin-bottom: 25px;">
                    Please contact the client to facilitate payment. If payment has been made but not reflected, please verify with accounting.
                  </p>

                  <div style="text-align: center;">
                    <a href="${portalUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px;">View Registry</a>
                  </div>

                  <p style="margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; text-transform: uppercase; letter-spacing: 1px;">
                    Internal Collections Node &bull; ${companyName}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Triggered when a new client is assigned to an existing agent
 */
export const generateAgentAssignmentEmailHTML = (
  client: Client,
  agent: Agent,
  settings: SystemSetting | null
): string => {
  const companyName = settings?.CompanyName || "Sally Chanza Business Café";
  const portalUrl = settings?.PortalUrl || "https://sallychanza.com/portal";
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, sans-serif; color: #334155;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 20px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
              <tr>
                <td style="padding: 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #0f172a; font-size: 18px;">Account Assignment</h2>
                  
                  <p style="font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
                    Hello <strong>${agent.AgentName}</strong>,<br><br>
                    The following client record has been assigned to your portfolio for management.
                  </p>

                  <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                    <p style="margin: 5px 0; font-size: 13px;"><strong>Entity:</strong> ${client.CompanyName}</p>
                    <p style="margin: 5px 0; font-size: 13px;"><strong>Classification:</strong> ${client.ClientType}</p>
                    <p style="margin: 5px 0; font-size: 13px;"><strong>Contact:</strong> ${client.Phone}</p>
                    <p style="margin: 5px 0; font-size: 13px;"><strong>Email:</strong> ${client.Email}</p>
                  </div>

                  <div style="text-align: center;">
                    <a href="${portalUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px;">Open Portal</a>
                  </div>

                  <p style="margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; text-transform: uppercase; letter-spacing: 1px;">
                    System Notice &bull; ${companyName}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Triggered when a new Agent or Partner is added to the system.
 * Uses standard language and responsive layout without scrolls.
 */
export const generateAgentInvitationEmailHTML = (
  agent: Agent,
  settings: SystemSetting | null
): string => {
  const companyName = settings?.CompanyName || "Sally Chanza Business Café";
  const portalUrl = settings?.PortalUrl || "https://sallychanza.com/portal";
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; width: 100% !important; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding: 20px 0; }
        .container { width: 95%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        .header { padding: 30px; background-color: #0f172a; text-align: center; color: #ffffff; }
        .content { padding: 30px; color: #334155; line-height: 1.6; }
        .footer { padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; margin: 20px 0; }
        .info-box { background-color: #f1f5f9; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .label { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 4px; }
        .value { font-size: 14px; font-weight: 600; color: #0f172a; }
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; border-radius: 0; border-left: 0; border-right: 0; }
          .btn { display: block; text-align: center; }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h2 style="margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Account Access Ready</h2>
          </div>
          <div class="content">
            <p>Hello ${agent.AgentName},</p>
            <p>Your account on the <strong>${companyName}</strong> management portal has been created. You can now log in to manage your portfolio and view performance reports.</p>
            
            <div class="info-box">
              <div style="margin-bottom: 15px;">
                <span class="label">Access Link</span>
                <span class="value">${portalUrl}</span>
              </div>
              <div style="margin-bottom: 15px;">
                <span class="label">Your Email</span>
                <span class="value">${agent.Email}</span>
              </div>
              <div>
                <span class="label">Temporary Password</span>
                <span class="value" style="font-family: monospace; letter-spacing: 1px;">${agent.Password}</span>
              </div>
            </div>

            <p><strong>Note:</strong> You will be asked to change this temporary password during your first login for security purposes.</p>
            
            <div style="text-align: center;">
              <a href="${portalUrl}" class="btn">Log In Now</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ${companyName}<br>
            Automated System Notification
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
