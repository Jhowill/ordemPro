export type ISODateString = string;
export type UUID = string;
export type MoneyCents = number;

export type BaseEntity = {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  deletedAt?: ISODateString | null;
};

export type EntityStatus = 'active' | 'inactive' | 'blocked' | 'archived';
export type ThemeMode = 'system' | 'light' | 'dark';

export type CompanyProfile = BaseEntity & {
  name: string;
  tradeName?: string;
  document?: string;
  responsibleName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  addressLine?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  logoUri?: string;
  isOnboardingCompleted: boolean;
};

export type PdfSettings = BaseEntity & {
  primaryColor: string;
  documentModel: 'classic' | 'compact' | 'detailed';
  showPhotos: boolean;
  showSignatures: boolean;
  showValues: boolean;
  showAppBranding: boolean;
  footerText?: string;
};

export type DefaultTerms = BaseEntity & {
  warrantyText: string;
  serviceAuthorizationText: string;
  withdrawalText: string;
  dataResponsibilityText: string;
  unclaimedEquipmentText: string;
};

export type CustomerKind = 'person' | 'company';

export type Customer = BaseEntity & {
  kind: CustomerKind;
  name: string;
  tradeName?: string;
  document?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  notes?: string;
  status: EntityStatus;
};

export type EquipmentCategory =
  | 'phone'
  | 'notebook'
  | 'computer'
  | 'printer'
  | 'tv'
  | 'air_conditioner'
  | 'vehicle'
  | 'other';

export type Equipment = BaseEntity & {
  customerId: UUID;
  category: EquipmentCategory;
  type?: string;
  description?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  patrimonyCode?: string;
  accessories?: string[];
  physicalState?: string;
  technicalNotes?: string;
  status: EntityStatus;
};

export type ServiceOrderStatus =
  | 'open'
  | 'diagnosis'
  | 'waiting_approval'
  | 'approved'
  | 'in_progress'
  | 'waiting_part'
  | 'completed'
  | 'delivered'
  | 'cancelled';

export type ServiceOrderPriority = 'low' | 'normal' | 'high' | 'urgent';
export type OrderItemType = 'service' | 'part' | 'other_cost';
export type PaymentMethod = 'cash' | 'pix' | 'debit_card' | 'credit_card' | 'bank_transfer' | 'other';

export type ServiceOrderItem = BaseEntity & {
  orderId: UUID;
  type: OrderItemType;
  description: string;
  quantity: number;
  unitPriceCents: MoneyCents;
  discountCents: MoneyCents;
  totalCents: MoneyCents;
};

export type Payment = BaseEntity & {
  orderId: UUID;
  amountCents: MoneyCents;
  method: PaymentMethod;
  paidAt?: ISODateString;
};

export type ServiceOrder = BaseEntity & {
  number: number;
  shortCode: string;
  customerId: UUID;
  equipmentId?: UUID | null;
  isServiceWithoutEquipment: boolean;
  openedAt: ISODateString;
  expectedCompletionAt?: ISODateString;
  status: ServiceOrderStatus;
  priority: ServiceOrderPriority;
  reportedIssue: string;
  diagnosis?: string;
  performedService?: string;
  laborTotalCents: MoneyCents;
  partsTotalCents: MoneyCents;
  otherCostsCents: MoneyCents;
  discountCents: MoneyCents;
  subtotalCents: MoneyCents;
  totalCents: MoneyCents;
  paidCents: MoneyCents;
  pendingCents: MoneyCents;
  warrantyDays?: number;
  isApprovedByCustomer: boolean;
  isPdfOutdated: boolean;
};

export type PhotoAttachment = BaseEntity & {
  orderId?: UUID;
  equipmentId?: UUID;
  localUri: string;
  caption?: string;
  includeInPdf: boolean;
};

export type SignatureRecord = BaseEntity & {
  orderId: UUID;
  localUri: string;
  signerName: string;
  signerDocument?: string;
  signedAt: ISODateString;
};

export type ServiceOrderPdf = BaseEntity & {
  orderId: UUID;
  version: number;
  localUri: string;
  generatedAt: ISODateString;
  totalCents: MoneyCents;
};

export type ServiceOrderStatusHistory = BaseEntity & {
  orderId: UUID;
  fromStatus?: ServiceOrderStatus | null;
  toStatus: ServiceOrderStatus;
  changedAt: ISODateString;
  reason?: string;
  notes?: string;
};

export type CatalogService = BaseEntity & {
  name: string;
  category?: string;
  defaultPriceCents: MoneyCents;
  defaultWarrantyDays?: number;
  status: 'active' | 'inactive';
};

export type CatalogPart = BaseEntity & {
  name: string;
  category?: string;
  salePriceCents: MoneyCents;
  unit: 'unit' | 'kit' | 'other';
  status: 'active' | 'inactive';
};

export type BackupMetadata = {
  lastBackupAt?: ISODateString | null;
  lastBackupJson?: string | null;
};

export type AppData = {
  company: CompanyProfile | null;
  pdfSettings: PdfSettings;
  terms: DefaultTerms;
  customers: Customer[];
  equipments: Equipment[];
  orders: ServiceOrder[];
  items: ServiceOrderItem[];
  payments: Payment[];
  photos: PhotoAttachment[];
  signatures: SignatureRecord[];
  pdfs: ServiceOrderPdf[];
  statusHistory: ServiceOrderStatusHistory[];
  services: CatalogService[];
  parts: CatalogPart[];
  backup: BackupMetadata;
  themeMode: ThemeMode;
  lastOrderNumber: number;
};
