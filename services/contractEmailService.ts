
import { Contract, Client, Agent, SystemSetting } from '../types';
import { formatDate, formatCurrency } from '../constants';

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
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding: 20px 0; }
    .container { width: 95%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { padding: 30px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9; text-align: center; }
    .content { padding: 30px; }
    .footer { padding: 25px; background-color: #f8fafc; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
    .button { display: inline-block; padding: 16px 30px; background-color: #0f172a; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; margin-top: 10px; }
    .details-box { background-color: #f1f5f9; border-radius: 10px; padding: 20px; margin: 20px 0; }
    @media only screen and (max-width: 600px) {
      .content, .header, .footer { padding: 20px; }
      .button { width: 100%; text-align: center; padding: 16px 0; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div style="font-size: 18px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: -0.5px;">${companyName}</div>
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

export const generateContractReviewEmailHTML = (
  contract: Contract,
  client: Client,
  settings: SystemSetting | null
): string => {
  const portalUrl = settings?.PortalUrl || "https://sallychanza.com/portal";
  
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px;">Review and Sign Your Contract</h2>
    <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Dear ${client.CompanyName},</p>
    <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">A new service contract has been created for you. Please log in to your portal to review and sign the document.</p>
    
    <div class="details-box">
      <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Contract ID:</strong> ${contract.ContractID}</p>
      <p style="margin: 5px 0 0 0; font-size: 13px; color: #64748b;"><strong>Plan Type:</strong> ${contract.PlanType} (${contract.NoOfUnits} Units)</p>
    </div>

    <div style="text-align: center;">
      <a href="${portalUrl}" class="button">Log In and Sign</a>
    </div>
    <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 20px;">Service starts as soon as the contract is signed and payment is received.</p>
  `;

  return getEmailTemplate(content, settings);
};

export const generateContractRenewalEmailHTML = (
  contract: Contract,
  client: Client,
  settings: SystemSetting | null
): string => {
  const portalUrl = settings?.PortalUrl || "https://sallychanza.com/portal";
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px;">Your Contract Has Been Renewed</h2>
    <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Dear ${client.CompanyName},</p>
    <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Your connectivity contract is now renewed. A new contract record has been added to your account for the next service period.</p>
    
    <div class="details-box">
      <p style="margin: 0; font-size: 13px; color: #166534;"><strong>New Expiry Date:</strong> ${formatDate(contract.ExpiryDate)}</p>
      <p style="margin: 5px 0 0 0; font-size: 13px; color: #166534;"><strong>Contract ID:</strong> ${contract.ContractID}</p>
    </div>

    <div style="text-align: center;">
      <a href="${portalUrl}" class="button">View Renewed Contract</a>
    </div>
  `;
  return getEmailTemplate(content, settings);
};

export const generateContractUpdatedEmailHTML = (
  contract: Contract,
  client: Client,
  settings: SystemSetting | null
): string => {
  const portalUrl = settings?.PortalUrl || "https://sallychanza.com/portal";
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px;">Your Contract Has Been Updated</h2>
    <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Dear ${client.CompanyName},</p>
    <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">We have updated the terms of your contract <strong>${contract.ContractID}</strong>. Please log in to your portal to review the changes.</p>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="${portalUrl}" class="button">Review Changes</a>
    </div>
  `;
  return getEmailTemplate(content, settings);
};

export const generateContractExecutionClientEmailHTML = (
  contract: Contract,
  client: Client,
  settings: SystemSetting | null
): string => {
  const portalUrl = settings?.PortalUrl || "https://sallychanza.com/portal";

  const content = `
    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px;">Contract Successfully Signed</h2>
    <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Dear ${client.CompanyName},</p>
    <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Both parties have signed contract <strong>${contract.ContractID}</strong>. It is now fully active. A signed copy is attached to this email and also available in your portal.</p>
    
    <div style="border-left: 4px solid #10b981; background-color: #f0fdf4; padding: 15px; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 14px; color: #166534; font-weight: 600;">Your service is now officially active.</p>
    </div>

    <div style="text-align: center;">
      <a href="${portalUrl}" class="button">Go to Portal</a>
    </div>
  `;

  return getEmailTemplate(content, settings);
};

export const generateContractSignedAgentEmailHTML = (
  contract: Contract,
  client: Client,
  agent: Agent,
  settings: SystemSetting | null
): string => {
  const portalUrl = settings?.PortalUrl || "https://sallychanza.com/portal";

  const content = `
    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px;">The Client Has Signed the Contract</h2>
    <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Dear ${agent.AgentName},</p>
    <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Client <strong>${client.CompanyName}</strong> has signed contract <strong>${contract.ContractID}</strong>. You now need to countersign this document to finish the process.</p>
    
    <div class="details-box">
      <p style="margin: 0; font-size: 13px;"><strong>Contract:</strong> ${contract.ContractID}</p>
      <p style="margin: 5px 0 0 0; font-size: 13px;"><strong>Value:</strong> K${formatCurrency(contract.TotalAmount)} / ${contract.BillingCycle}</p>
    </div>

    <div style="text-align: center;">
      <a href="${portalUrl}" class="button">Sign Document Now</a>
    </div>
  `;

  return getEmailTemplate(content, settings);
};
