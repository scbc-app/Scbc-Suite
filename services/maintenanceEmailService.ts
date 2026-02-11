
import { MaintenanceRecord, Client, Vehicle, SimTopup, SystemSetting } from '../types';
import { formatDate, formatCurrency } from '../constants';

// Internal helper for resilient matching
const normalizeID = (id: any): string => String(id || '').trim().toLowerCase().replace(/\s+/g, '');

/**
 * Maintenance Completion Email - Sent to Client, Agent, and Audit
 * Shows asset list (Plate + Model) only - NO SIM/IMEI
 */
export const generateMaintenanceCompletionEmailHTML = (
  record: MaintenanceRecord,
  client: Client,
  servicedVehicles: Vehicle[],
  settings: SystemSetting | null
): string => {
  const companyName = settings?.CompanyName || "Sally Chanza Business Café";
  const supportEmail = settings?.Email || "support@sallychanza.com";

  const assetListHtml = servicedVehicles.length > 0 
    ? servicedVehicles.map(v => `
      <div style="background: #ffffff; padding: 12px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #f1f5f9;">
        <span style="font-weight: 800; color: #0f172a; font-size: 14px; text-transform: uppercase;">${v.NumberPlate}</span><br>
        <span style="font-size: 11px; color: #64748b; font-weight: 500;">${v.Make} ${v.Model}</span>
      </div>
    `).join('')
    : '<p style="font-size: 12px; color: #94a3b8; font-style: italic;">Note: General System Maintenance</p>';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table { border-collapse: collapse !important; table-layout: fixed; width: 100%; }
        .wrapper { width: 100%; background-color: #f8fafc; padding: 20px 0; }
        .container { width: 95%; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #0f172a; padding: 30px; text-align: center; color: #ffffff; }
        .content { padding: 30px; line-height: 1.5; word-wrap: break-word; }
        .footer { padding: 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
        .details { background: #f8fafc; border-radius: 10px; padding: 20px; margin: 20px 0; border: 1px solid #f1f5f9; }
        h1 { margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        h2 { font-size: 16px; color: #0f172a; margin-top: 0; font-weight: 700; }
        .section-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; display: block; }
        @media only screen and (max-width: 600px) {
          .content { padding: 20px !important; }
          .container { width: 95% !important; }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Service Accomplished</h1>
            <p style="opacity: 0.7; font-size: 12px; margin-top: 5px; font-weight: 600;">Official Maintenance Record</p>
          </div>
          <div class="content">
            <h2>Dear ${client.CompanyName},</h2>
            <p>This is to confirm that maintenance on your tracking hardware has been finished. Our technicians have verified that the following assets are fully operational.</p>
            
            <div class="details">
              <span class="section-label">Work Done</span>
              <p style="font-size: 14px; font-weight: 600; color: #334155; margin: 0;">${record.Description}</p>
              <p style="font-size: 11px; color: #64748b; margin-top: 4px;">Completed: ${formatDate(record.Date)}</p>
            </div>

            <span class="section-label">Assets Serviced</span>
            <div style="width: 100%;">${assetListHtml}</div>

            <p style="margin-top: 25px; font-size: 13px; color: #64748b;">No further action is required from you. Your fleet monitoring continues as usual.</p>
          </div>
          <div class="footer">
            ${companyName} &bull; Lusaka, Zambia<br>
            Support: ${supportEmail}<br>
            &copy; ${new Date().getFullYear()} Official Communication
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * SIM Renewal / Service Due Notification - Internal Only
 */
export const generateSimRenewalEmailHTML = (
  topup: SimTopup,
  client: Client,
  vehicle: Vehicle,
  settings: SystemSetting | null
): string => {
  const companyName = settings?.CompanyName || "Internal System";
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: sans-serif; background-color: #f8fafc; color: #1e293b; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        .wrapper { width: 100%; padding: 20px 0; }
        .container { width: 95%; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #1e1b4b; padding: 25px; text-align: center; color: #ffffff; }
        .content { padding: 30px; word-wrap: break-word; }
        .card { background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #f1f5f9; }
        .badge { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #166534; border-radius: 99px; font-weight: 800; font-size: 11px; text-transform: uppercase; }
        h1 { margin: 0; font-size: 18px; font-weight: 800; text-transform: uppercase; }
        @media only screen and (max-width: 600px) {
          .container { width: 95% !important; }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Connectivity Record</h1>
            <p style="opacity: 0.7; font-size: 11px; margin-top: 4px;">Internal Team Update</p>
          </div>
          <div class="content">
            <h2 style="font-size: 16px;">Renewal Logged</h2>
            <p style="font-size: 14px;">The following service has been renewed for <strong>${client.CompanyName}</strong>.</p>
            
            <div class="card">
              <span style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Asset Details</span>
              <p style="font-size: 15px; font-weight: 800; margin: 5px 0;">${vehicle.NumberPlate}</p>
              <p style="font-size: 12px; color: #64748b; margin: 0;">${vehicle.Make} ${vehicle.Model} (${vehicle.NetworkProvider})</p>
              
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                <span style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Next Service Expiry</span><br>
                <div class="badge" style="margin-top: 5px;">${formatDate(topup.ExpiryDate)}</div>
              </div>
            </div>

            <p style="font-size: 13px; color: #64748b; font-style: italic;">Sync successful with database.</p>
          </div>
          <div style="padding: 15px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 10px; color: #94a3b8;">
            ${companyName} Automated Notice
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Bulk Renewal - Internal Only
 */
export const generateBulkSimRenewalEmailHTML = (
  topups: SimTopup[],
  client: Client,
  vehicles: Vehicle[],
  settings: SystemSetting | null
): string => {
  const companyName = settings?.CompanyName || "Internal System";
  const fleetHtml = vehicles.map(v => {
    const topup = topups.find(t => normalizeID(t.VehicleID) === normalizeID(v.VehicleID));
    return `
      <div style="background: #ffffff; padding: 12px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
        <div style="flex: 1; min-width: 0;">
          <span style="font-weight: 800; color: #0f172a; font-size: 13px; font-family: monospace; word-break: break-all;">${v.NumberPlate}</span><br>
          <span style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">${v.Make} ${v.Model}</span>
        </div>
        <div style="text-align: right; min-width: 80px; margin-left: 10px;">
          <span style="font-size: 11px; color: #10b981; font-weight: 800;">${formatDate(topup?.ExpiryDate)}</span>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: sans-serif; background-color: #f1f5f9; color: #1e293b; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        .wrapper { width: 100%; padding: 20px 0; }
        .container { width: 95%; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 15px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #0f172a; padding: 35px; text-align: center; color: #ffffff; }
        .content { padding: 30px; word-wrap: break-word; }
        .list-box { background: #f8fafc; padding: 15px; border-radius: 12px; margin: 20px 0; border: 1px solid #f1f5f9; }
        @media only screen and (max-width: 600px) {
          .container { width: 95% !important; }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1 style="margin:0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Fleet Service Notice</h1>
            <p style="opacity: 0.6; font-size: 11px; margin-top: 5px;">Internal Record</p>
          </div>
          <div class="content">
            <h2 style="font-size: 16px; margin-top: 0;">Service Update Report</h2>
            <p style="font-size: 14px;">Connectivity has been renewed for <strong>${client.CompanyName}</strong>.</p>
            
            <div class="list-box">
              <span style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 12px;">Renewed Assets (${vehicles.length})</span>
              <div style="width: 100%;">${fleetHtml}</div>
            </div>

            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">This batch is now active. No further internal actions required.</p>
          </div>
          <div style="padding: 15px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 10px; color: #94a3b8;">
            ${companyName} &bull; Internal Dispatch
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
