
import { Client, Agent, SystemSetting } from '../types';

const getEmailTemplate = (content: string, settings: SystemSetting | null) => {
  const companyName = settings?.CompanyName || "Sally Chanza Business Café";
  const supportEmail = settings?.Email || "info@sallychanza.com";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #334155; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding: 20px 0; }
    .container { width: 95%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { padding: 30px; background-color: #ffffff; text-align: center; border-bottom: 1px solid #f1f5f9; }
    .content { padding: 30px; }
    .footer { padding: 25px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; background-color: #fafafa; }
    .button { display: inline-block; background-color: #0f172a; color: #ffffff !important; padding: 16px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; margin-top: 10px; }
    .details-box { background-color: #f1f5f9; border-radius: 10px; padding: 20px; margin: 20px 0; }
    .feature-item { margin-bottom: 15px; }
    @media only screen and (max-width: 600px) {
       .button { width: 100%; text-align: center; padding: 16px 0; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div style="font-size: 18px; font-weight: 800; color: #0f172a; text-transform: uppercase;">${companyName}</div>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        ${companyName}<br>
        Email: ${supportEmail}<br>
        &copy; ${new Date().getFullYear()} All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
`;
};

export const generateOnboardingEmailHTML = (
  client: Client,
  agent: Agent | undefined,
  settings: SystemSetting | null
): string => {
  const portalUrl = settings?.PortalUrl || "https://sallychanza.com/portal";
  const manager = agent ? agent.AgentName : "Operations Team";

  const content = `
    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px;">Welcome to the Platform</h2>
    <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Dear ${client.CompanyName},</p>
    <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Your account is now active. We have assigned <strong>${manager}</strong> as your dedicated account manager.</p>

    <div class="details-box">
      <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #0f172a;">What is in your portal?</h3>
      <div class="feature-item"><strong>• Fleet Registry:</strong> View and track all your registered vehicles.</div>
      <div class="feature-item"><strong>• Digital Contracts:</strong> Sign and download your service agreements.</div>
      <div class="feature-item"><strong>• Billing & History:</strong> View invoices and payment receipts.</div>
      <div class="feature-item"><strong>• Support Desk:</strong> Report issues and get quick help.</div>
    </div>

    ${client.PortalEnabled ? `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Login Email:</strong> ${client.Email}</p>
        <p style="margin: 0; font-size: 13px;"><strong>Temporary Password:</strong> ${client.TempPassword || 'Already configured'}</p>
      </div>
      <div style="text-align: center;">
        <a href="${portalUrl}" class="button">Log In to Portal</a>
      </div>
    ` : ''}
  `;
  return getEmailTemplate(content, settings);
};

export const generateClientUpdateEmailHTML = (client: Client, settings: SystemSetting | null): string => {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px;">Profile Update Notice</h2>
    <p style="font-size: 15px; line-height: 1.6;">Dear ${client.CompanyName},</p>
    <p style="font-size: 15px; line-height: 1.6;">This is to notify you that your client profile details have been updated in our system by an administrator.</p>
    <p style="font-size: 15px; line-height: 1.6;">Please log in to your portal to review your information and ensure everything is correct.</p>
  `;
  return getEmailTemplate(content, settings);
};

export const generateAgentReassignEmailHTML = (client: Client, newAgent: Agent, settings: SystemSetting | null): string => {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px;">New Account Manager Assigned</h2>
    <p style="font-size: 15px; line-height: 1.6;">Dear ${client.CompanyName},</p>
    <p style="font-size: 15px; line-height: 1.6;">We have assigned a new Account Manager to your profile to provide you with better service.</p>
    <div class="details-box">
      <p style="margin: 0; font-size: 14px;"><strong>Manager Name:</strong> ${newAgent.AgentName}</p>
      <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Contact Email:</strong> ${newAgent.Email}</p>
      <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Contact Phone:</strong> ${newAgent.Phone}</p>
    </div>
    <p style="font-size: 15px; line-height: 1.6;">Your new manager is ready to assist you with any questions.</p>
  `;
  return getEmailTemplate(content, settings);
};

export const generateClientDeleteEmailHTML = (clientName: string, settings: SystemSetting | null): string => {
  const companyName = settings?.CompanyName || "Sally Chanza Business Café";
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #ef4444; font-size: 20px;">Account Deactivated</h2>
    <p style="font-size: 15px; line-height: 1.6;">Dear ${clientName},</p>
    <p style="font-size: 15px; line-height: 1.6;">This email confirms that your account with ${companyName} has been deactivated and archived in our records.</p>
    <p style="font-size: 15px; line-height: 1.6;">Your portal access has been restricted. If you believe this is a mistake, please contact us immediately.</p>
  `;
  return getEmailTemplate(content, settings);
};

export const generateOverdueReminderEmailHTML = (client: Client, balance: number, settings: SystemSetting | null): string => {
  const portalUrl = settings?.PortalUrl || "https://sallychanza.com/portal";
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #ef4444; font-size: 20px;">Important: Payment Reminder</h2>
    <p style="font-size: 15px; line-height: 1.6;">Dear ${client.CompanyName},</p>
    <p style="font-size: 15px; line-height: 1.6;">We noticed that you have an outstanding balance on your account. To avoid any service interruptions, please settle the amount as soon as possible.</p>
    <div class="details-box" style="background-color: #fef2f2; border: 1px solid #fee2e2;">
      <p style="margin: 0; font-size: 16px; color: #ef4444; font-weight: bold;">Outstanding Balance: K${balance.toLocaleString()}</p>
    </div>
    <div style="text-align: center;">
      <a href="${portalUrl}" class="button">View & Pay Invoice</a>
    </div>
  `;
  return getEmailTemplate(content, settings);
};
