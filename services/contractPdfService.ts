
import { Contract, Client, Vehicle, SystemSetting, Agent } from '../types';
import { formatDate, formatCurrency, maskSensitive } from '../constants';

/**
 * Generates a professional, legally-styled HTML template for Service Agreements.
 * Designed for compatibility with Google Apps Script's getAs('application/pdf') engine.
 */
export const generateContractHTML = (
  formData: Partial<Contract>,
  client: Client | undefined,
  vehicles: Vehicle[],
  companySettings: SystemSetting | null,
  agents: Agent[] = []
) => {
  // DYNAMIC BRANDING FROM SETTINGS
  const companyName = companySettings?.CompanyName || "Sally Chanza Business Café";
  const companyAddress = companySettings?.Address || "House #39 Salam Park, Lusaka - Zambia";
  const companyContacts = companySettings?.Phone || "260966862012";
  const companyEmail = companySettings?.Email || "notifications@sallychanza.com";
  const companyLogo = companySettings?.Logo || null;

  // Filter only vehicles explicitly selected for this contract
  const selectedIDs = (formData.AssetIDs || []).map(id => String(id).trim().toLowerCase());
  const linkedAssets = vehicles.filter(v => selectedIDs.includes(String(v.VehicleID).trim().toLowerCase()));
  
  const assetRows = linkedAssets.length > 0 
    ? linkedAssets.map(v => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-size: 11px; font-weight: bold; color: #0f172a;">${v.NumberPlate || 'N/A'}</td>
        <td style="padding: 10px; font-size: 11px; color: #475569;">${v.Make || ''} ${v.Model || ''} (${v.Year || 'N/A'})</td>
        <td style="padding: 10px; font-size: 11px; font-family: monospace; color: #64748b;">${maskSensitive(v.DeviceSerial)}</td>
        <td style="padding: 10px; font-size: 11px; font-family: monospace; color: #64748b;">${maskSensitive(v.SimNumber)}</td>
      </tr>
    `).join('')
    : `<tr><td colspan="4" style="text-align:center; padding: 30px; color: #94a3b8; font-style: italic; background: #f8fafc;">No specific assets were selected for this schedule.</td></tr>`;

  const assignedAgent = agents.find(a => String(a.AgentID) === String(formData.AssignedAgentID));
  const agentName = assignedAgent ? assignedAgent.AgentName : 'Authorized Representative';

  const providerSignature = formData.ProviderSign || formData.ProviderSignImage;
  const clientSignature = formData.ClientSign || formData.ClientSignImage;

  return `
    <html>
    <head>
      <style>
        body { font-family: sans-serif; color: #1e293b; line-height: 1.4; font-size: 10px; margin: 0; padding: 40px; }
        .header-table { width: 100%; border-bottom: 3px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { max-height: 60px; margin-bottom: 5px; }
        .doc-title { font-size: 20pt; font-weight: 900; text-transform: uppercase; color: #0f172a; margin: 15px 0 5px 0; letter-spacing: -1px; }
        .section-header { background: #0f172a; color: #ffffff; padding: 6px 12px; font-weight: 800; text-transform: uppercase; font-size: 8px; letter-spacing: 1px; margin: 20px 0 10px 0; border-radius: 4px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .info-table td { width: 50%; vertical-align: top; padding: 4px 12px 4px 0; }
        .label { font-size: 7px; font-weight: 800; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 1px; }
        .value { font-weight: 700; color: #0f172a; font-size: 10px; }
        .asset-table { width: 100%; border-collapse: collapse; margin: 5px 0; border: 1px solid #e2e8f0; }
        .asset-table th { background: #f8fafc; text-align: left; padding: 8px; font-size: 8px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
        .terms-text { font-size: 8px; color: #475569; text-align: justify; margin-top: 5px; }
        .terms-text p { margin-bottom: 6px; }
        .summary-row { padding: 10px; border-top: 2px solid #0f172a; margin-top: 15px; text-align: right; }
        .total-amount { font-size: 14px; font-weight: 900; color: #059669; }
        .signature-table { width: 100%; margin-top: 30px; border-collapse: collapse; }
        .sig-cell { width: 50%; padding: 10px 20px 10px 0; vertical-align: bottom; }
        .sig-line { border-bottom: 2px solid #cbd5e1; height: 50px; margin-bottom: 10px; position: relative; }
        .sig-img { max-height: 40px; max-width: 150px; display: block; margin: 0 auto; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 7px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 8px; }
        .parameters-grid { width: 100%; border-collapse: collapse; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
        .parameters-grid td { padding: 12px; border: 1px solid #e2e8f0; width: 25%; }
        .highlight-value { font-weight: 900; color: #6366f1; }
        .service-scope-box { background: #f1f5f9; border-left: 4px solid #6366f1; padding: 15px; margin: 15px 0; font-size: 9px; color: #334155; }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td style="width: 60%;">
            ${companyLogo ? `<img src="${companyLogo}" class="logo" />` : ''}
            <div style="font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase;">${companyName}</div>
            <div style="font-size: 8px; color: #64748b;">${companyAddress}</div>
            <div style="font-size: 8px; color: #64748b;">${companyContacts} | ${companyEmail}</div>
          </td>
          <td style="width: 40%; text-align: right; vertical-align: top;">
            <div class="doc-title">Agreement</div>
            <div style="color: #6366f1; font-weight: 900; font-size: 10px;">REF: ${formData.ContractID}</div>
          </td>
        </tr>
      </table>

      <div class="section-header">1. Contracting Entities</div>
      <table class="info-table">
        <tr>
          <td>
            <span class="label">The Service Provider</span>
            <span class="value">${companyName}</span>
            <div style="font-size: 8px; color: #64748b;">Represented by: ${agentName}</div>
          </td>
          <td>
            <span class="label">The Subscriber / Client</span>
            <span class="value">${client?.CompanyName || formData.ClientName || 'Valued Subscriber'}</span>
            <div style="font-size: 8px; color: #64748b;"><strong>NRC / ID Number:</strong> ${client?.NRC || 'N/A'}</div>
            <div style="font-size: 8px; color: #64748b;">Email: ${client?.Email || 'N/A'}</div>
            <div style="font-size: 8px; color: #64748b;">Contact: ${client?.Phone || 'N/A'}</div>
          </td>
        </tr>
      </table>

      <div class="section-header">2. Statement of Service & Product Scope</div>
      <div class="service-scope-box">
        <strong>NATURE OF AGREEMENT:</strong><br/>
        This agreement is for the supply and installation of <strong>GPS Tracking or Dashcam hardware</strong>, 
        and the provision of access to a <strong>digital tracking platform</strong>. 
        The service allows the Client to monitor vehicles in real-time, view route history, 
        and receive technical support for asset management.
      </div>

      <div class="section-header">3. Agreement Lifecycle & Service Parameters</div>
      <table class="parameters-grid">
        <tr>
          <td>
            <span class="label">Effective Start Date</span>
            <span class="value">${formatDate(formData.StartDate)}</span>
          </td>
          <td>
            <span class="label">Contract Maturity (Expiry)</span>
            <span class="value" style="color: #ef4444;">${formatDate(formData.ExpiryDate)}</span>
          </td>
          <td>
            <span class="label">Total Duration</span>
            <span class="value">${formData.DurationMonths || 0} Month(s)</span>
          </td>
          <td>
            <span class="label">Agreement Status</span>
            <span class="value" style="color: #10b981;">${formData.ContractStatus || 'ACTIVE'}</span>
          </td>
        </tr>
        <tr>
          <td>
            <span class="label">Billing Frequency</span>
            <span class="value">${formData.BillingCycle || 'Monthly'}</span>
          </td>
          <td>
            <span class="label">Payment Mode</span>
            <span class="value">${formData.PaymentMethod || 'Not Specified'}</span>
          </td>
          <td>
            <span class="label">Unit Allocation</span>
            <span class="value">${formData.NoOfUnits || 0} Verified Assets</span>
          </td>
          <td>
            <span class="label">Plan Designation</span>
            <span class="value highlight-value">${formData.PlanType || 'Standard'}</span>
          </td>
        </tr>
      </table>

      <div class="section-header">4. Schedule of Assets (Inventory)</div>
      <table class="asset-table">
        <thead>
          <tr>
            <th style="width: 20%;">Plate Number</th>
            <th style="width: 30%;">Description</th>
            <th style="width: 25%;">Hardware ID (Masked)</th>
            <th style="width: 25%;">Connectivity ID</th>
          </tr>
        </thead>
        <tbody>
          ${assetRows}
        </tbody>
      </table>

      <div class="section-header">5. Terms & Conditions of Service</div>
      <div class="terms-text">
        <p><strong>1. MAINTENANCE:</strong> Hardware component failure due to manufacturing defect or normal wear and tear will be repaired or replaced by the Provider. The Client is liable for the full cost of repair or replacement resulting from any accident, misuse, tampering, vandalism, neglect, or intentional damage.</p>
        <p><strong>2. MONITORING DISCLAIMER:</strong> The tracking platform is provided as a self-service tool. The Provider is not a security company, rapid response service, or active monitoring agency. The Provider does not monitor Client assets, dispatch emergency services, or intervene in incidents.</p>
        <p><strong>3. SYSTEM RELIABILITY:</strong> Location accuracy and system functionality depend entirely on the availability and quality of third-party GSM cellular networks and GPS satellite signals. Temporary loss of signal or inaccurate location reporting in tunnels, underground areas, dense urban environments, or remote geographic regions is a known environmental limitation and does not constitute a service failure by the Provider.</p>
        <p><strong>4. CLIENT'S MONITORING OBLIGATION:</strong> The Client is solely responsible for regularly checking the status and location of its assets via the tracking platform. The Client must report any suspected malfunction, anomaly, or offline status of the hardware or software to the Provider immediately to initiate any technical support. Failure to report in a timely manner may limit the Provider's ability to assist.</p>
        <p><strong>5. PAYMENT TERMS & ACCESS:</strong> Service is prepaid. Full access to the platform and tracking services is granted only after the Provider has verified receipt of payment. Service, including all tracking and platform access, will be restricted immediately and automatically upon the expiration of the prepaid term.</p>
        <p><strong>6. DEFAULT AND RECOVERY:</strong> Accounts overdue by more than thirty (30) days are in default. The Provider reserves the right to permanently deactivate services and, upon providing written notice, to physically locate and recover all tracking hardware installed on Client assets. All costs associated with recovery will be billed to the Client.</p>
        <p><strong>7. ASSET SALE OR TRANSFER:</strong> The Client must formally notify the Provider in writing prior to the sale, transfer, or disposal of any asset equipped with the Provider's tracking hardware. The Client must either: 1) Arrange for the physical removal and return of the hardware, or 2) Facilitate the official reassignment of the tracking subscription to the new asset owner through a new contract with the Provider. The Client remains financially responsible for the subscription until one of these actions is completed.</p>
        <p><strong>8. SUBSCRIPTION CHANGES:</strong> The Client may upgrade their service plan at any time. Downgrades to a lower-tier service plan are only permitted upon the expiry of the current prepaid contract term.</p>
        <p><strong>9. DATA PRIVACY:</strong> The Provider will keep all Client location and tracking data confidential. This data will be used solely for the purpose of delivering the service and for authorized technical support. Data will not be sold or shared with unauthorized third parties.</p>
        <p><strong>10. GOVERNING LAW & DISPUTES:</strong> This Agreement shall be governed by and construed in accordance with the laws of the Republic of Zambia. Any dispute arising from this Agreement shall be resolved exclusively through final and binding arbitration in Zambia, in accordance with the Arbitration Act of Zambia or the rules of an agreed-upon Zambian arbitration body.</p>
        <p><strong>11. HARDWARE TITLE & OWNERSHIP:</strong> Tracking hardware remains the property of <strong>${companyName}</strong> unless explicitly purchased outright and documented as a sale in writing.</p>
      </div>

      <div class="summary-row">
        <span style="font-size: 8px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-right: 15px;">Total Subscription Amount (${formData.BillingCycle}):</span>
        <span class="total-amount">K ${formatCurrency(formData.TotalAmount)}</span>
      </div>

      <div class="section-header">6. Authorization & Execution</div>
      <table class="signature-table">
        <tr>
          <td class="sig-cell">
            <span class="label">For the Provider</span>
            <div class="sig-line">
               ${providerSignature ? `<img src="${providerSignature}" class="sig-img" />` : ''}
            </div>
            <div class="value">${formData.ProviderSignName || agentName}</div>
            <div style="font-size: 7px; color: #64748b;">Authenticated: ${formData.ProviderSignDate ? formatDate(formData.ProviderSignDate) : 'Pending'}</div>
          </td>
          <td class="sig-cell">
            <span class="label">For the Subscriber</span>
            <div class="sig-line">
               ${clientSignature ? `<img src="${clientSignature}" class="sig-img" />` : ''}
            </div>
            <div class="value">${formData.ClientSignName || 'Authorized Signatory'}</div>
            <div style="font-size: 7px; color: #64748b;">Signed: ${formData.ClientSignDate ? formatDate(formData.ClientSignDate) : 'Pending'}</div>
          </td>
        </tr>
      </table>

      <div class="footer">
        Digital Agreement • ID: ${formData.ContractID} • Generated by ${companyName} Automated Registry.
      </div>
    </body>
    </html>
  `;
};
