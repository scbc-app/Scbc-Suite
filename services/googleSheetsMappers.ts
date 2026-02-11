
import { 
  AppState, Client, Vehicle, Contract, Invoice, Agent, Payment, AppNotification,
  ClientStatus, VehicleStatus, ContractStatus, InvoiceStatus, PaymentStatus, 
  NotificationPriority, DocumentType, SystemSetting, Ticket, TicketStatus, 
  MaintenanceRecord, MaintenanceStatus, SimTopup, Referral, PartnerPayoutModel, InvestmentStatus,
  /* Fix: Added missing LoginRecord import required for the loginRecords mapping */
  LoginRecord
} from '../types';
import { getValue, arrayToObjects, parseNumber, parseBoolean } from './googleSheetsUtils';

export const mapRawDataToState = (rawData: any): Partial<AppState> => {
  const clients: Client[] = arrayToObjects(rawData['Clients'] || []).map((row: any) => ({ 
    ClientID: getValue(row, ['ClientID', 'ID']),
    ClientAccountID: getValue(row, ['ClientAccountID', 'AccountID']),
    CompanyName: getValue(row, ['Company', 'CompanyName', 'Client Name']),
    PrimaryContactName: getValue(row, ['PrimaryContactName', 'Contact Name']),
    Phone: getValue(row, ['Phone']),
    AltPhone: getValue(row, ['Alternative Phone', 'AltPhone', 'Secondary Phone']),
    Email: getValue(row, ['Email']),
    BillingAddress: getValue(row, ['Address', 'BillingAddress', 'Full Address']),
    Gender: (getValue(row, ['Gender']) || 'N/A') as any,
    NRC: getValue(row, ['NRC Number', 'NRC', 'ID Number']),
    ClientType: (getValue(row, ['ClientType', 'Type']) || 'Corporate') as any,
    OnboardingDate: getValue(row, ['OnboardingDate', 'Date']),
    AssignedAgentID: getValue(row, ['AssignedAgentID', 'AgentID']),
    AgentCommissionRate: parseNumber(getValue(row, ['AgentCommissionRate', 'CommRate'])),
    Status: (getValue(row, ['Status']) || 'Active') as ClientStatus,
    PortalEnabled: parseBoolean(getValue(row, ['PortalEnabled'])),
    ForcePasswordChange: parseBoolean(getValue(row, ['ForcePasswordChange'])),
    ShowWalkthrough: parseBoolean(getValue(row, ['ShowWalkthrough']))
  }));

  const vehicles: Vehicle[] = arrayToObjects(rawData['Vehicles'] || []).map((row: any) => ({ 
    VehicleID: getValue(row, ['VehicleID', 'ID']),
    ClientID: getValue(row, ['ClientID']),
    ClientName: getValue(row, ['ClientName', 'Client']),
    NumberPlate: getValue(row, ['Plate', 'NumberPlate']),
    Make: getValue(row, ['Make']),
    Model: getValue(row, ['Model']),
    Year: getValue(row, ['Year']),
    DeviceSerial: getValue(row, ['DeviceSerial', 'IMEI']),
    SimNumber: getValue(row, ['SimNumber']),
    NetworkProvider: getValue(row, ['Network', 'NetworkProvider']),
    ServiceType: getValue(row, ['Service', 'ServiceType']),
    InstallationDate: getValue(row, ['InstallDate']),
    Status: (getValue(row, ['Status']) || 'Active') as VehicleStatus,
    Photo: getValue(row, ['Photo'])
  }));

  const maintenance: MaintenanceRecord[] = arrayToObjects(rawData['Maintenance'] || []).map((row: any) => ({
    ID: getValue(row, ['ID', 'MaintenanceID']),
    ClientID: getValue(row, ['ClientID']),
    ClientName: getValue(row, ['ClientName']),
    AssetIDs: String(getValue(row, ['AssetIDs', 'Assets']) || '').split(',').map(s => s.trim()).filter(Boolean),
    Description: getValue(row, ['Description', 'WorkDone']),
    TechnicianID: getValue(row, ['TechnicianID', 'AgentID']),
    Date: getValue(row, ['Date', 'ServiceDate']),
    Status: (getValue(row, ['Status']) || MaintenanceStatus.Scheduled) as MaintenanceStatus,
    Cost: parseNumber(getValue(row, ['Cost'])),
    Notes: getValue(row, ['Notes'])
  }));

  const simTopups: SimTopup[] = arrayToObjects(rawData['SimTopups'] || []).map((row: any) => ({
    ID: getValue(row, ['ID', 'TopupID']),
    VehicleID: getValue(row, ['VehicleID']),
    Plate: getValue(row, ['Plate', 'NumberPlate']),
    SimNumber: getValue(row, ['SimNumber']),
    Network: getValue(row, ['Network', 'Provider']),
    Amount: parseNumber(getValue(row, ['Amount'])),
    Date: getValue(row, ['Date', 'TopupDate']),
    ExpiryDate: getValue(row, ['ExpiryDate', 'DueDate']),
    AgentID: getValue(row, ['AgentID']),
    Reference: getValue(row, ['Reference', 'Ref']),
    Email: getValue(row, ['Email'])
  }));

  const contracts: Contract[] = arrayToObjects(rawData['Contracts'] || []).map((row: any) => {
    const rawAssets = getValue(row, ['AssetIDs', 'Vehicles', 'Assets', 'Asset IDs']);
    const assetList = rawAssets ? String(rawAssets).split(',').map(id => id.trim()).filter(id => id && id !== '0') : [];
    return {
      ContractID: getValue(row, ['ContractID', 'ID']),
      ClientID: getValue(row, ['ClientID']),
      ClientName: getValue(row, ['Name', 'ClientName', 'Client']),
      PlanType: getValue(row, ['Plan', 'PlanType', 'Plan Tier']),
      ServiceType: getValue(row, ['ServiceType', 'Service']),
      NoOfUnits: parseNumber(getValue(row, ['Units', 'Units Count', 'Count'])),
      UnitPrice: parseNumber(getValue(row, ['Price', 'Unit Price'])),
      AdditionalCost: parseNumber(getValue(row, ['Extra', 'Maint Fee'])),
      Discount: parseNumber(getValue(row, ['Discount'])),
      SubTotal: parseNumber(getValue(row, ['SubTotal'])),
      TotalAmount: parseNumber(getValue(row, ['Total', 'Total Amount'])),
      StartDate: getValue(row, ['Start', 'Date', 'Start Date']),
      DurationMonths: parseNumber(getValue(row, ['Duration', 'Term'])),
      ExpiryDate: getValue(row, ['Expiry', 'Expiry Date']),
      BillingCycle: (getValue(row, ['Cycle', 'Billing Cycle']) || 'Monthly') as any,
      PaymentMethod: getValue(row, ['PaymentMethod', 'Method']),
      PaymentDueDate: getValue(row, ['PaymentDueDate', 'DueDate']),
      ContractStatus: (getValue(row, ['ContractStatus', 'Status', 'Contract Status']) || 'Active') as ContractStatus,
      AssignedAgentID: getValue(row, ['AgentID', 'AssignedAgentID', 'ID']),
      AssetIDs: assetList,
      ProviderSignName: getValue(row, ['ProviderSignName']),
      ProviderSignDate: getValue(row, ['ProviderSignDate']),
      ProviderSign: getValue(row, ['ProviderSign']),
      ProviderSignImage: getValue(row, ['ProviderSignImage']),
      ClientSignName: getValue(row, ['ClientSignName']),
      ClientSignDate: getValue(row, ['ClientSignDate']),
      ClientSign: getValue(row, ['ClientSign']),
      ClientSignImage: getValue(row, ['ClientSignImage'])
    };
  });

  const referrals: Referral[] = arrayToObjects(rawData['Referrals'] || []).map((row: any) => ({
    ID: getValue(row, ['ID', 'ReferralID']),
    ReferrerID: getValue(row, ['ReferrerID', 'ClientID']),
    ReferrerName: getValue(row, ['ReferrerName']),
    FriendName: getValue(row, ['FriendName', 'LeadName']),
    FriendCompany: getValue(row, ['FriendCompany', 'Company']),
    FriendPhone: getValue(row, ['FriendPhone', 'Phone']),
    Date: getValue(row, ['Date']),
    Status: (getValue(row, ['Status']) || 'Pending') as any
  }));

  const invoices: Invoice[] = arrayToObjects(rawData['Invoices'] || []).map((row: any) => ({
    InvoiceID: getValue(row, ['InvoiceID', 'ID', 'Number']),
    InvoiceDate: getValue(row, ['InvoiceDate', 'Date', 'Issued']),
    DueDate: getValue(row, ['DueDate', 'Due', 'Expiry']),
    ClientID: getValue(row, ['ClientID', 'Client']),
    ClientName: getValue(row, ['ClientName', 'Name']),
    ContractID: getValue(row, ['ContractID', 'Contract']),
    Description: getValue(row, ['Description', 'Service', 'Notes']),
    PeriodMonths: parseNumber(getValue(row, ['PeriodMonths', 'Months', 'Period'])),
    UnitPrice: parseNumber(getValue(row, ['UnitPrice', 'Rate', 'Price'])),
    NoOfUnits: parseNumber(getValue(row, ['NoOfUnits', 'Units', 'Qty'])),
    TotalAmount: parseNumber(getValue(row, ['TotalAmount', 'Total', 'Sum'])),
    AmountPaid: parseNumber(getValue(row, ['AmountPaid', 'Paid'])),
    BalanceDue: parseNumber(getValue(row, ['BalanceDue', 'Balance', 'Due'])),
    Status: (getValue(row, ['Status']) || 'Pending') as InvoiceStatus,
    DocType: (getValue(row, ['DocType', 'Type']) || DocumentType.Invoice) as DocumentType,
    Notes: getValue(row, ['Notes'])
  }));

  const payments: Payment[] = arrayToObjects(rawData['Payments'] || []).map((row: any) => ({
    PaymentID: getValue(row, ['PaymentID', 'ID']),
    Date: getValue(row, ['Date', 'PaymentDate']),
    InvoiceID: getValue(row, ['InvoiceID', 'Invoice']),
    ClientID: getValue(row, ['ClientID', 'Client']),
    ClientName: getValue(row, ['ClientName', 'Name']),
    ContractID: getValue(row, ['ContractID', 'Contract']),
    Amount: parseNumber(getValue(row, ['Amount', 'Value'])),
    Method: (getValue(row, ['Method']) || 'Bank Transfer') as any,
    MonthsCovered: parseNumber(getValue(row, ['MonthsCovered', 'Months', 'Cycle'])),
    AgentID: getValue(row, ['AgentID', 'Agent']),
    Status: (getValue(row, ['Status']) || 'Completed') as PaymentStatus,
    Reference: getValue(row, ['Reference', 'Ref', 'TransactionID']),
    /* Fix: Added mapping for Remarks, NoOfUnits and UnitPrice in Payment records */
    Remarks: getValue(row, ['Remarks', 'Description', 'Notes']),
    NoOfUnits: parseNumber(getValue(row, ['NoOfUnits', 'Units', 'Qty'])),
    UnitPrice: parseNumber(getValue(row, ['UnitPrice', 'Rate', 'Price']))
  }));

  const notifications: AppNotification[] = arrayToObjects(rawData['Notifications'] || []).map((row: any) => ({
    ID: getValue(row, ['ID', 'NotificationID']),
    Time: getValue(row, ['Time', 'Timestamp', 'Date']),
    Type: getValue(row, ['Type', 'Category']),
    Priority: (getValue(row, ['Priority']) || 'Normal') as NotificationPriority,
    ClientID: getValue(row, ['ClientID']),
    ClientName: getValue(row, ['ClientName']),
    ContractID: getValue(row, ['ContractID']),
    Message: getValue(row, ['Message', 'Alert', 'Content']),
    DueDate: getValue(row, ['DueDate', 'ExpiryDate']),
    Status: (getValue(row, ['Status']) || 'Unread') as any,
    AssignedTo: getValue(row, ['AssignedTo', 'AgentID']),
    Sent: parseBoolean(getValue(row, ['Sent', 'IsSent'])),
    ActionTaken: getValue(row, ['ActionTaken']),
    ActionTime: getValue(row, ['ActionTime']),
    Notes: getValue(row, ['Notes']),
    Email: getValue(row, ['Email'])
  }));

  const tickets: Ticket[] = arrayToObjects(rawData['Tickets'] || []).map((row: any) => ({
    TicketID: getValue(row, ['TicketID', 'ID']),
    ClientID: getValue(row, ['ClientID']),
    Email: getValue(row, ['Email']),
    Subject: getValue(row, ['Subject']),
    Description: getValue(row, ['Description']),
    Resolution: getValue(row, ['Resolution', 'Response']),
    AssignedAgentID: getValue(row, ['AgentID', 'AssignedAgentID']),
    Status: (getValue(row, ['Status']) || 'Open') as TicketStatus,
    Priority: getValue(row, ['Priority']) || 'Normal',
    CreatedAt: getValue(row, ['CreatedAt', 'Date']),
    UpdatedAt: getValue(row, ['UpdatedAt', 'LastUpdated', 'Updated'])
  }));

  const loginRecords: LoginRecord[] = arrayToObjects(rawData['Logins'] || []).map((row: any) => ({
    Email: getValue(row, ['Email', 'User', 'email', 'user']),
    Password: getValue(row, ['Password', 'Pass', 'password', 'pass']),
    AgentID: getValue(row, ['AgentID', 'ID', 'agentid', 'id']),
    Role: getValue(row, ['Role', 'role', 'Type', 'type']),
    LastLogin: getValue(row, ['LastLogin', 'lastlogin']),
    Status: (getValue(row, ['Status', 'status']) || 'Active') as any,
    LoginAttempts: parseNumber(getValue(row, ['LoginAttempts', 'attempts']))
  }));

  const systemSettings: SystemSetting = arrayToObjects(rawData['SystemSettings'] || rawData['Settings'] || []).map((row: any) => ({
    ID: getValue(row, ['ID', 'SettingID']),
    CompanyName: getValue(row, ['CompanyName', 'Company']),
    Address: getValue(row, ['Address']),
    Phone: getValue(row, ['Phone']),
    Email: getValue(row, ['Email']),
    Website: getValue(row, ['Website']),
    Logo: getValue(row, ['Logo']),
    DisbursementDay: parseNumber(getValue(row, ['DisbursementDay', 'PayDay'])) || 5,
    DefaultCommissionRate: parseNumber(getValue(row, ['DefaultCommissionRate', 'BaseComm'])),
    DefaultBonusRate: parseNumber(getValue(row, ['DefaultBonusRate', 'BaseBonus'])),
    IncentivesActive: parseBoolean(getValue(row, ['IncentivesActive', 'RewardsActive'])),
    EmailInvoicesEnabled: parseBoolean(getValue(row, ['EmailInvoicesEnabled'])),
    EmailPaymentsEnabled: parseBoolean(getValue(row, ['EmailPaymentsEnabled'])),
    EmailContractsEnabled: parseBoolean(getValue(row, ['EmailContractsEnabled'])),
    EmailTicketNewEnabled: parseBoolean(getValue(row, ['EmailTicketNewEnabled'])),
    EmailTicketUpdateEnabled: parseBoolean(getValue(row, ['EmailTicketUpdateEnabled'])),
    EmailTicketResolvedEnabled: parseBoolean(getValue(row, ['EmailTicketResolvedEnabled'])),
    MobileAppLink: getValue(row, ['MobileAppLink', 'AppLink']),
    PortalUrl: getValue(row, ['PortalUrl', 'Portal'])
  }))[0] || null;

  const agents: Agent[] = arrayToObjects(rawData['Agents'] || []).map((row: any) => ({
    AgentID: getValue(row, ['ID', 'AgentID', 'id', 'agentid']),
    AgentName: getValue(row, ['Name', 'AgentName', 'name', 'agentname']),
    Phone: getValue(row, ['Phone', 'phone']),
    Email: getValue(row, ['Email', 'email']),
    Role: (getValue(row, ['Role', 'role']) || 'Agent') as any,
    Department: getValue(row, ['Department', 'Dept', 'dept']),
    BaseSalary: parseNumber(getValue(row, ['Salary', 'salary'])),
    CommissionRate: parseNumber(getValue(row, ['CommRate', 'commrate'])),
    Status: (getValue(row, ['Status', 'status']) || 'Active') as any,
    Privileges: getValue(row, ['Privileges', 'previleges', 'permissions']),
    BankName: getValue(row, ['BankName', 'bank']),
    AccountNumber: getValue(row, ['AccountNumber', 'account']),
    StartDate: getValue(row, ['StartDate', 'startdate']),
    EndDate: getValue(row, ['EndDate', 'enddate']),
    Notes: getValue(row, ['Notes', 'notes', 'OtherInfo']),
    Scope: getValue(row, ['Scope', 'scope'])
  }));

  return { referrals, clients, vehicles, maintenance, simTopups, contracts, invoices, payments, notifications, tickets, loginRecords, systemSettings, agents };
};