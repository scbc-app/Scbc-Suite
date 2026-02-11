
export enum ClientStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspended = 'Suspended'
}

export enum AssetStatus {
  Active = 'Active'
}

export enum VehicleStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Maintenance = 'Maintenance'
}

export enum ContractStatus {
  Active = 'Active',
  Expired = 'Expired',
  Cancelled = 'Cancelled'
}

export enum InvoiceStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Partial = 'Partial',
  Overdue = 'Overdue'
}

export enum PaymentStatus {
  Completed = 'Completed',
  Pending = 'Pending',
  Failed = 'Failed'
}

export enum TicketStatus {
  Open = 'Open',
  InProgress = 'In Progress',
  Resolved = 'Resolved'
}

export enum MaintenanceStatus {
  Scheduled = 'Scheduled',
  InProgress = 'In Progress',
  Completed = 'Completed'
}

export enum NotificationPriority {
  Critical = 'Critical',
  High = 'High',
  Normal = 'Normal',
  Low = 'Low'
}

export enum DocumentType {
  Invoice = 'Invoice',
  Proforma = 'Proforma',
  Quotation = 'Quotation'
}

export enum PartnerPayoutModel {
  InterestOnly = 'InterestOnly',
  PrincipalPlusInterest = 'PrincipalPlusInterest'
}

export enum InvestmentStatus {
  Draft = 'Draft',
  UnderReview = 'UnderReview',
  CounterProposed = 'CounterProposed',
  Approved = 'Approved',
  Active = 'Active'
}

export interface Referral {
  ID: string;
  ReferrerID: string;
  ReferrerName: string;
  FriendName: string;
  FriendCompany: string;
  FriendPhone: string;
  Date: string;
  Status: 'Pending' | 'Successful' | 'Contacted';
}

export interface Client {
  ClientID: string;
  ClientAccountID?: string;
  CompanyName: string;
  PrimaryContactName: string;
  Phone: string;
  AltPhone?: string;
  Email: string;
  BillingAddress: string;
  Gender?: 'Male' | 'Female' | 'Other' | 'N/A';
  NRC?: string;
  ClientType: 'Corporate' | 'SME' | 'Individual';
  OnboardingDate: string;
  AssignedAgentID: string;
  AgentCommissionRate: number;
  Status: ClientStatus;
  PortalEnabled: boolean;
  ForcePasswordChange: boolean;
  ShowWalkthrough: boolean;
  TempPassword?: string;
}

export interface Asset {
  ID: string;
  Name: string;
}

export interface Vehicle {
  VehicleID: string;
  ClientID: string;
  ClientName: string;
  NumberPlate: string;
  Make: string;
  Model: string;
  Year: string;
  DeviceSerial: string;
  SimNumber: string;
  NetworkProvider: string;
  ServiceType: string;
  InstallationDate: string;
  Status: VehicleStatus;
  Photo?: string;
}

export interface MaintenanceRecord {
  ID: string;
  ClientID: string;
  ClientName: string;
  AssetIDs: string[];
  Description: string;
  TechnicianID: string;
  Date: string;
  Status: MaintenanceStatus;
  Cost: number;
  Notes?: string;
  Email?: string;
}

export interface SimTopup {
  ID: string;
  VehicleID: string;
  Plate: string;
  SimNumber: string;
  Network: string;
  Amount: number;
  Date: string;
  ExpiryDate: string;
  AgentID: string;
  Reference: string;
  Email?: string;
}

export interface Contract {
  ContractID: string;
  ClientID: string;
  ClientName: string;
  PlanType: string;
  ServiceType: string;
  NoOfUnits: number;
  UnitPrice: number;
  AdditionalCost: number;
  Discount: number;
  SubTotal: number;
  TotalAmount: number;
  StartDate: string;
  DurationMonths: number;
  ExpiryDate: string;
  BillingCycle: 'Monthly' | 'Quarterly' | 'Annual' | 'Term' | 'Once-off';
  PaymentMethod: string;
  PaymentDueDate: string;
  ContractStatus: ContractStatus;
  AssignedAgentID: string;
  AssetIDs: string[];
  ProviderSignName?: string;
  ProviderSignTitle?: string;
  ProviderSignDate?: string;
  ProviderSign?: string;
  ProviderSignImage?: string;
  ClientSignName?: string;
  ClientSignTitle?: string;
  ClientSignDate?: string;
  ClientSign?: string;
  ClientSignImage?: string;
  Email?: string;
}

export interface Invoice {
  InvoiceID: string;
  InvoiceDate: string;
  DueDate: string;
  ClientID: string;
  ClientName: string;
  ContractID: string;
  ServiceType?: string;
  Description: string;
  PeriodMonths: number;
  UnitPrice: number;
  NoOfUnits: number;
  TotalAmount: number;
  AmountPaid: number;
  BalanceDue: number;
  Status: InvoiceStatus;
  DocType: DocumentType;
  Notes?: string;
  Email?: string;
}

export interface Payment {
  PaymentID: string;
  Date: string;
  InvoiceID: string;
  ClientID: string;
  ClientName: string;
  ContractID: string;
  Amount: number;
  Method: 'Bank Transfer' | 'Mobile Money' | 'Cash' | 'Card';
  MonthsCovered: number;
  AgentID: string;
  Status: PaymentStatus;
  Reference: string;
  NextDueDate?: string;
  Remarks?: string;
  NoOfUnits?: number;
  UnitPrice?: number;
}

export interface AppNotification {
  ID: string;
  Time: string;
  Type: string;
  Priority: NotificationPriority;
  ClientID: string;
  ClientName: string;
  ContractID: string;
  Message: string;
  DueDate: string;
  Status: 'Unread' | 'Read';
  AssignedTo: string;
  Sent: boolean;
  ActionTaken?: string;
  ActionTime?: string;
  Notes?: string;
  Email?: string;
}

export interface Ticket {
  TicketID: string;
  ClientID: string;
  Email?: string;
  Subject: string;
  Description: string;
  Resolution?: string;
  AssignedAgentID?: string;
  Status: TicketStatus;
  Priority: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface Agent {
  AgentID: string;
  AgentName: string;
  Phone: string;
  Email: string;
  Password?: string;
  Role: 'Admin' | 'Agent' | 'Partner' | 'Support';
  Department?: string;
  BaseSalary: number;
  CommissionRate: number;
  CommissionCap?: number;
  PerformanceBonus?: number;
  Status: 'Active' | 'Inactive';
  Privileges?: string; 
  BankName?: string;
  AccountNumber?: string;
  StartDate: string;
  EndDate?: string;
  Notes?: string;
  Scope?: string;
  EquityShare?: number;
  InvestmentPrincipal?: number;
  InvestmentTermMonths?: number;
  InvestmentDate?: string;
  PartnerPayoutModel?: PartnerPayoutModel;
  SmartYieldActive?: boolean;
  MaxMonthlyROI?: number;
  InvestmentStatus?: InvestmentStatus;
  InvestmentSignature?: string;
  InvestmentSignedDate?: string;
  ProposalNotes?: string;
  ParentAgentID?: string; 
  ExperienceLevel?: 'Trainee' | 'Independent' | 'Mentor' | 'Lead' | 'Partner';
  GraduatedTraineesCount?: number;
  ConsecutiveMonthsOnTarget?: number;
}

export interface LoginRecord {
  Email: string;
  Password?: string;
  AgentID: string;
  Role?: string;
  LastLogin?: string;
  Status: 'Active' | 'Inactive';
  LoginAttempts: number;
}

export interface SystemSetting {
  ID: string;
  CompanyName: string;
  Address: string;
  Phone: string;
  Email: string;
  Website: string;
  Logo?: string;
  DisbursementDay: number;
  DefaultCommissionRate: number;
  DefaultBonusRate: number;
  IncentivesActive: boolean;
  EmailInvoicesEnabled?: boolean;
  EmailPaymentsEnabled?: boolean;
  EmailContractsEnabled?: boolean;
  EmailTicketNewEnabled?: boolean;
  EmailTicketUpdateEnabled?: boolean;
  EmailTicketResolvedEnabled?: boolean;
  InvoiceDueReminderDays?: number;
  MobileAppLink?: string;
  PortalUrl?: string;
}

export interface ModulePermissions {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface UserPermissions {
  [module: string]: ModulePermissions;
}

export interface ServicePlan {
  PlanID: string;
  Category: string;
  Type: string;
  Class: string;
  BasePrice: number;
  MaintenanceFee: number;
  LastUpdated: string;
}

export interface AppState {
  clients: Client[];
  assets: any[];
  vehicles: Vehicle[];
  contracts: Contract[];
  invoices: Invoice[];
  payments: Payment[];
  maintenance: MaintenanceRecord[];
  simTopups: SimTopup[];
  commissions: any[];
  notifications: AppNotification[];
  tickets: Ticket[];
  agents: Agent[];
  referrals: Referral[];
  servicePlans: ServicePlan[];
  loginRecords: LoginRecord[];
  systemSettings: SystemSetting | null;
  currentUser: {
    id: string;
    name: string;
    role: 'Admin' | 'Agent' | 'Partner' | 'Client';
    permissions: UserPermissions;
    lastLogin?: string;
  } | null;
}
