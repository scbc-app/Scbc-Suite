
import { Contract, Client, SystemSetting } from '../types';
import { formatDate } from '../constants';

export const generateExpirationEmailHTML = (
  contract: Contract,
  client: Client,
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
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fef2f2; color: #334155; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #fef2f2; padding: 20px 0; }
        .container { width: 95%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #fee2e2; overflow: hidden; }
        .header { padding: 30px; background-color: #ffffff; text-align: center; border-bottom: 1px solid #f1f5f9; }
        .content { padding: 30px; }
        .footer { padding: 25px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; background-color: #fafafa; }
        .button { display: inline-block; background-color: #0f172a; color: #ffffff !important; padding: 16px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; margin-top: 10px; }
        .details-box { background-color: #f8fafc; border-radius: 10px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0; }
        @media only screen and (max-width: 600px) {
           .button { width: 100%; text-align: center; padding: 16px 0; }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
             <h2 style="margin: 0; color: #ef4444; font-size: 22px;">Your Contract Has Expired</h2>
          </div>
          <div class="content">
            <p style="font-size: 15px; line-height: 1.6;">Dear ${client.CompanyName},</p>
            <p style="font-size: 15px; line-height: 1.6; color: #64748b;">This is a notice that your service contract has expired. To keep your assets protected and your service active, please renew your contract as soon as possible.</p>

            <div class="details-box">
              <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Contract:</strong> ${contract.ContractID}</p>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #ef4444;"><strong>Expired On:</strong> ${formatDate(contract.ExpiryDate)}</p>
            </div>

            <p style="font-size: 14px; line-height: 1.6;">You can renew your contract by logging into your portal or by contacting your account manager.</p>
            
            <div style="text-align: center;">
              <a href="${portalUrl}" class="button">Renew Now</a>
            </div>
          </div>
          <div class="footer">
            ${companyName}<br>
            Official Expiration Notice<br>
            Contact: info@sallychanza.com
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
