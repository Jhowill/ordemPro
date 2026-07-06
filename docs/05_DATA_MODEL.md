# 05_DATA_MODEL — OrdemPro

**Arquivo:** `docs/05_DATA_MODEL.md`  
**App:** OrdemPro  
**Stack prevista:** Expo + React Native + TypeScript + Expo Router + SQLite local  
**Modo:** Offline-first  
**Objetivo:** definir os tipos TypeScript, tabelas SQLite, relacionamentos, índices, regras de validação, migrações, cálculo, backup e serviços locais do OrdemPro.

---

## 1. Premissas do modelo de dados

O OrdemPro deve funcionar como um sistema local de ordens de serviço. A camada de dados precisa sustentar:

```txt
Empresa → Cliente → Equipamento → OS → Peças/Serviços → Valores → Fotos → Assinaturas → PDF → Histórico → Backup
```

### 1.1. Princípios obrigatórios

- O app deve funcionar offline para cadastro, edição, busca, histórico, assinatura, fotos, PDF e backup local.
- Telas não devem acessar SQLite diretamente.
- Toda entidade principal deve ter `id`, `createdAt`, `updatedAt` e `deletedAt` opcional.
- Exclusão física deve ser evitada em entidades com histórico.
- Dinheiro deve ser salvo como inteiro em centavos.
- Datas devem ser salvas como string ISO 8601.
- Booleanos devem ser salvos no SQLite como `0` ou `1`.
- Arquivos locais devem ser salvos por referência (`localUri`), não dentro do banco em base64.
- Dados do catálogo copiados para a OS devem permanecer congelados na OS, mesmo se o catálogo mudar depois.
- PDF gerado deve guardar snapshot/metadados suficientes para saber se está desatualizado.

### 1.2. Convenções

```txt
TypeScript: camelCase
SQLite: snake_case
IDs: string UUID local
Datas: ISO string UTC/local padronizado
Dinheiro: integer em centavos
Status: union types no TypeScript + TEXT no SQLite
JSON em SQLite: somente para arrays simples e configurações auxiliares
```

### 1.3. Organização sugerida de arquivos

```txt
src/
  types/
    common.ts
    company.ts
    customer.ts
    equipment.ts
    order.ts
    catalog.ts
    payment.ts
    media.ts
    pdf.ts
    backup.ts
    settings.ts
  database/
    db.ts
    migrations.ts
    schema.ts
    seed.ts
  repositories/
    companyRepository.ts
    customerRepository.ts
    equipmentRepository.ts
    orderRepository.ts
    catalogRepository.ts
    paymentRepository.ts
    mediaRepository.ts
    pdfRepository.ts
    backupRepository.ts
    settingsRepository.ts
  services/
    orders/orderCalculations.ts
    orders/orderNumberService.ts
    orders/orderStatusService.ts
    pdf/pdfTemplate.ts
    pdf/pdfGenerator.ts
    backup/backupService.ts
    files/fileStorageService.ts
  hooks/
    useCompanyProfile.ts
    useCustomers.ts
    useEquipments.ts
    useServiceOrders.ts
    useOrderDraft.ts
    useCatalog.ts
    usePdfGenerator.ts
    useBackup.ts
    useAppSettings.ts
```

---

## 2. Tipos comuns

```ts
export type ISODateString = string;
export type UUID = string;
export type MoneyCents = number;

export type EntityStatus = 'active' | 'inactive' | 'blocked' | 'archived';

export type SyncStatus = 'local_only' | 'exported' | 'imported';

export type SoftDeleteFields = {
  deletedAt?: ISODateString | null;
  deletedReason?: string | null;
};

export type BaseEntity = SoftDeleteFields & {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type Address = {
  addressLine?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
};

export type ContactInfo = {
  phone?: string;
  whatsapp?: string;
  email?: string;
};

export type FileReference = {
  localUri: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
};
```

### 2.1. Regras de formato

- `phone`, `whatsapp`, `document` e `zipCode` devem guardar preferencialmente a versão normalizada sem máscara.
- A máscara deve ser aplicada apenas na UI.
- `MoneyCents` deve ser exibido como BRL na UI.
- Campos opcionais vazios devem ser salvos como `NULL`, não como strings com espaço.

---

## 3. Enums e unions de domínio

```ts
export type CustomerKind = 'person' | 'company';

export type CustomerProfileType =
  | 'particular'
  | 'company'
  | 'vip'
  | 'recurring'
  | 'delinquent'
  | 'other';

export type CustomerOrigin =
  | 'referral'
  | 'google'
  | 'instagram'
  | 'store'
  | 'recurring'
  | 'whatsapp'
  | 'other';

export type ContactPreference = 'phone' | 'whatsapp' | 'email' | 'any';

export type EquipmentCategory =
  | 'phone'
  | 'notebook'
  | 'computer'
  | 'printer'
  | 'monitor'
  | 'tablet'
  | 'tv'
  | 'air_conditioner'
  | 'refrigerator'
  | 'washing_machine'
  | 'microwave'
  | 'power_tool'
  | 'vehicle'
  | 'industrial_equipment'
  | 'other';

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

export type ServiceOrderOrigin =
  | 'counter'
  | 'field_visit'
  | 'whatsapp'
  | 'phone'
  | 'contract'
  | 'other';

export type OrderItemType = 'service' | 'part' | 'other_cost';

export type PartCondition =
  | 'new'
  | 'used'
  | 'refurbished'
  | 'customer_supplied';

export type PaymentMethod =
  | 'cash'
  | 'pix'
  | 'debit_card'
  | 'credit_card'
  | 'bank_transfer'
  | 'bank_slip'
  | 'payment_link'
  | 'other';

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'cancelled';

export type SignatureType =
  | 'customer_opening'
  | 'customer_approval'
  | 'customer_withdrawal'
  | 'technician'
  | 'company_responsible';

export type PhotoType =
  | 'entry'
  | 'defect'
  | 'diagnosis'
  | 'replaced_part'
  | 'completed_service'
  | 'delivery'
  | 'document'
  | 'other';

export type PdfStatus = 'generated' | 'outdated' | 'deleted';

export type ThemeMode = 'system' | 'light' | 'dark';

export type SecurityLockType = 'none' | 'pin' | 'biometric';
```

---

## 4. Entidades TypeScript

## 4.1. CompanyProfile

Usado no onboarding, configurações da empresa e cabeçalho/rodapé do PDF.

```ts
export type CompanyProfile = BaseEntity & Address & ContactInfo & {
  name: string;
  tradeName?: string;
  document?: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  responsibleName?: string;
  site?: string;
  instagram?: string;
  logoUri?: string;
  defaultResponsibleSignatureUri?: string;
  isOnboardingCompleted: boolean;
};
```

### Regras

- Obrigatório: `name` e pelo menos `phone` ou `whatsapp`.
- Deve existir no máximo um perfil de empresa ativo na V1.
- Alterar a empresa não altera PDFs antigos; somente PDFs futuros ou regenerados.

---

## 4.2. PdfSettings

Define aparência e dados exibidos no PDF.

```ts
export type PdfDocumentModel = 'classic' | 'compact' | 'detailed';

export type PdfSettings = BaseEntity & {
  primaryColor: string;
  documentModel: PdfDocumentModel;
  showPhotos: boolean;
  showSignatures: boolean;
  showValues: boolean;
  showDiagnosis: boolean;
  showAppBranding: boolean;
  footerText?: string;
};
```

### Regras

- Modelo `classic` deve estar disponível na V1.
- Modelos `compact` e `detailed` podem ficar preparados para futuro/premium.
- As configurações afetam novos PDFs e PDFs regenerados.

---

## 4.3. DefaultTerms

Textos reutilizados em OS e PDF.

```ts
export type DefaultTerms = BaseEntity & {
  warrantyText?: string;
  serviceAuthorizationText?: string;
  withdrawalText?: string;
  dataResponsibilityText?: string;
  unclaimedEquipmentText?: string;
  rejectedBudgetText?: string;
  customerSuppliedPartsText?: string;
  paymentTermsText?: string;
  showWarrantyText: boolean;
  showServiceAuthorizationText: boolean;
  showWithdrawalText: boolean;
  showDataResponsibilityText: boolean;
  showUnclaimedEquipmentText: boolean;
  showRejectedBudgetText: boolean;
  showCustomerSuppliedPartsText: boolean;
  showPaymentTermsText: boolean;
};
```

### Regras

- Termos podem ser vazios.
- Termos padrão devem ser copiados/snapshotados para o PDF no momento da geração.
- Observações internas da OS não devem ir para o PDF por padrão.

---

## 4.4. Customer

Cliente pessoa física ou jurídica.

```ts
export type Customer = BaseEntity & Address & ContactInfo & {
  kind: CustomerKind;
  name: string;
  tradeName?: string;
  document?: string;
  secondaryDocument?: string;
  secondaryContactName?: string;
  secondaryPhone?: string;
  origin?: CustomerOrigin;
  profileType?: CustomerProfileType;
  contactPreference?: ContactPreference;
  generalNotes?: string;
  internalNotes?: string;
  status: EntityStatus;
  lastServiceAt?: ISODateString;
};
```

### Regras

- Obrigatório: `name` e pelo menos `phone` ou `whatsapp`.
- Cliente com OS vinculada não deve ser apagado fisicamente sem confirmação forte.
- Preferir `status = 'inactive'` a exclusão.
- Duplicidade provável: mesmo documento, telefone ou WhatsApp.

---

## 4.5. Equipment

Equipamento vinculado a um cliente.

```ts
export type Equipment = BaseEntity & {
  customerId: UUID;
  category: EquipmentCategory;
  type?: string;
  description?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  patrimonyCode?: string;
  color?: string;
  voltage?: string;
  year?: string;
  physicalState?: string;
  accessories?: string[];
  technicalNotes?: string;
  status: EntityStatus;
  lastServiceAt?: ISODateString;
};
```

### Regras

- Obrigatório: `customerId` e `category` ou `description`.
- Equipamento sempre pertence a um cliente.
- OS antiga mantém vínculo mesmo se o equipamento for editado depois.
- Excluir equipamento com OS vinculada deve ser bloqueado ou exigir confirmação forte.

---

## 4.6. ServiceCatalogItem

Serviço reutilizável para agilizar OS.

```ts
export type ServiceCatalogItem = BaseEntity & {
  name: string;
  category?: string;
  defaultDescription?: string;
  defaultPriceCents: MoneyCents;
  estimatedTimeMinutes?: number;
  defaultWarrantyDays?: number;
  notes?: string;
  status: 'active' | 'inactive';
};
```

### Regras

- Alterar serviço no catálogo não altera OS antigas.
- Serviço manual pode ser lançado sem cadastro no catálogo.
- `defaultPriceCents` pode ser zero.

---

## 4.7. PartCatalogItem

Peça reutilizável sem controle completo de estoque na V1.

```ts
export type PartCatalogItem = BaseEntity & {
  name: string;
  internalCode?: string;
  category?: string;
  brand?: string;
  compatibleModel?: string;
  costCents?: MoneyCents;
  salePriceCents: MoneyCents;
  unit: 'unit' | 'meter' | 'kit' | 'pair' | 'liter' | 'other';
  notes?: string;
  status: 'active' | 'inactive';
};
```

### Regras

- V1 não controla estoque.
- Alterar peça no catálogo não altera OS antigas.
- Peça fornecida pelo cliente pode ter valor zero na OS.

---

## 4.8. ServiceOrder

Entidade central do app.

```ts
export type ServiceOrder = BaseEntity & {
  number: number;
  shortCode: string;
  customerId: UUID;
  equipmentId?: UUID | null;
  isServiceWithoutEquipment: boolean;
  technicianName?: string;
  openedAt: ISODateString;
  expectedCompletionAt?: ISODateString;
  completedAt?: ISODateString;
  deliveredAt?: ISODateString;
  approvedAt?: ISODateString;
  cancelledAt?: ISODateString;
  cancelReason?: string;
  status: ServiceOrderStatus;
  priority: ServiceOrderPriority;
  origin?: ServiceOrderOrigin;

  reportedIssue: string;
  customerConditions?: string;
  problemStartedAtDescription?: string;
  isIntermittent?: boolean;
  hadFall?: boolean;
  hadLiquidContact?: boolean;
  hadPowerSurge?: boolean;
  hadMisuse?: boolean;
  hadPreviousRepairAttempt?: boolean;
  initialNotes?: string;

  diagnosis?: string;
  performedTests?: string;
  probableCause?: string;
  recommendedService?: string;
  performedService?: string;
  replacedPartsDescription?: string;
  notReplacedPartsDescription?: string;
  customerRecommendations?: string;
  internalNotes?: string;
  customerVisibleNotes?: string;

  laborTotalCents: MoneyCents;
  partsTotalCents: MoneyCents;
  otherCostsCents: MoneyCents;
  discountCents: MoneyCents;
  subtotalCents: MoneyCents;
  totalCents: MoneyCents;
  paidCents: MoneyCents;
  pendingCents: MoneyCents;

  paymentCondition?: string;
  warrantyDays?: number;
  budgetValidityDays?: number;
  isApprovedByCustomer: boolean;

  lastPdfId?: UUID | null;
  lastPdfGeneratedAt?: ISODateString | null;
  isPdfOutdated: boolean;
};
```

### Regras

- Obrigatório: `customerId`, `reportedIssue`, `status`, `openedAt`.
- `number` deve ser único e sequencial.
- `shortCode` deve ser curto, legível e único.
- OS pode existir sem equipamento quando `isServiceWithoutEquipment = true`.
- OS entregue não deve ser alterada sem confirmação.
- OS cancelada deve manter histórico.
- Alterar dados relevantes depois do PDF deve marcar `isPdfOutdated = true`.

---

## 4.9. ServiceOrderItem

Itens de serviço, peça ou custo adicional dentro da OS.

```ts
export type ServiceOrderItem = BaseEntity & {
  orderId: UUID;
  type: OrderItemType;
  catalogServiceId?: UUID | null;
  catalogPartId?: UUID | null;
  description: string;
  quantity: number;
  unitPriceCents: MoneyCents;
  discountCents: MoneyCents;
  totalCents: MoneyCents;
  warrantyDays?: number;
  technicianName?: string;
  notes?: string;
  partCondition?: PartCondition;
  sortOrder: number;
};
```

### Regras

```txt
totalCents = max(0, quantity * unitPriceCents - discountCents)
```

- `quantity` deve ser maior que zero.
- Item pode ter valor zero.
- Item copiado do catálogo deve manter descrição e preço independentes do catálogo.

---

## 4.10. Payment

Registro simples de pagamento dentro da OS.

```ts
export type Payment = BaseEntity & {
  orderId: UUID;
  amountCents: MoneyCents;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt?: ISODateString;
  notes?: string;
};
```

### Regras

- V1 pode usar um pagamento único ou múltiplos pagamentos simples.
- `paidCents` da OS deve ser a soma dos pagamentos válidos.
- Pagamento cancelado/refundado não entra no total pago.

---

## 4.11. PhotoAttachment

Fotos e anexos vinculados a equipamento ou OS.

```ts
export type PhotoAttachment = BaseEntity & FileReference & {
  orderId?: UUID | null;
  equipmentId?: UUID | null;
  customerId?: UUID | null;
  type: PhotoType;
  caption?: string;
  includeInPdf: boolean;
  sortOrder: number;
};
```

### Regras

- Deve existir ao menos um vínculo: `orderId`, `equipmentId` ou `customerId`.
- Fotos devem ser comprimidas e copiadas para diretório controlado pelo app.
- Se o arquivo local sumir, o app deve permitir remover a referência ou escolher nova foto.
- Arquivos não devem ser salvos em base64 no banco.

---

## 4.12. SignatureRecord

Assinaturas digitais salvas como imagem local.

```ts
export type SignatureRecord = BaseEntity & FileReference & {
  orderId: UUID;
  type: SignatureType;
  signerName: string;
  signerDocument?: string;
  signedAt: ISODateString;
};
```

### Regras

- Assinatura não é obrigatória para salvar OS.
- Alterar para `delivered` deve sugerir assinatura de retirada.
- Assinatura pode ser ocultada no PDF conforme `PdfSettings`.

---

## 4.13. ServiceOrderPdf

Registro de PDF gerado.

```ts
export type ServiceOrderPdf = BaseEntity & FileReference & {
  orderId: UUID;
  version: number;
  status: PdfStatus;
  generatedAt: ISODateString;
  generatedFromOrderUpdatedAt: ISODateString;
  companySnapshotJson: string;
  customerSnapshotJson: string;
  equipmentSnapshotJson?: string | null;
  orderSnapshotJson: string;
  settingsSnapshotJson: string;
  termsSnapshotJson?: string | null;
  totalCents: MoneyCents;
};
```

### Regras

- PDF deve continuar disponível offline após gerado.
- `generatedFromOrderUpdatedAt` deve ser comparado com `ServiceOrder.updatedAt`.
- Se `ServiceOrder.updatedAt` for posterior ao PDF, marcar PDF como `outdated`.
- Pode manter histórico de versões ou substituir visualmente pela última versão; a tabela deve suportar versões.

---

## 4.14. ServiceOrderStatusHistory

Histórico de alterações de status.

```ts
export type ServiceOrderStatusHistory = BaseEntity & {
  orderId: UUID;
  fromStatus?: ServiceOrderStatus | null;
  toStatus: ServiceOrderStatus;
  changedAt: ISODateString;
  reason?: string;
  notes?: string;
};
```

### Regras

- Toda alteração de status deve registrar data e hora.
- Cancelamento deve registrar motivo.
- Reabertura de OS entregue deve registrar histórico.

---

## 4.15. OrderDraft

Rascunho do fluxo de Nova OS.

```ts
export type OrderDraft = BaseEntity & {
  customerId?: UUID | null;
  equipmentId?: UUID | null;
  isServiceWithoutEquipment: boolean;
  currentStep: 'customer' | 'equipment' | 'problem' | 'items' | 'review';
  draftJson: string;
  lastTouchedAt: ISODateString;
};
```

### Regras

- Salvar rascunho após cliente + descrição mínima ou ao sair com alterações.
- Ao concluir a OS, limpar o rascunho usado.
- Deve haver no máximo um rascunho ativo por vez na V1.

---

## 4.16. BackupMetadata

Controle de backup local/manual.

```ts
export type BackupMetadata = BaseEntity & {
  lastBackupAt?: ISODateString | null;
  lastBackupUri?: string | null;
  lastBackupSizeBytes?: number | null;
  lastImportedAt?: ISODateString | null;
  lastImportedVersion?: number | null;
};
```

---

## 4.17. AppSettings

Preferências gerais.

```ts
export type AppSettings = BaseEntity & {
  themeMode: ThemeMode;
  currency: 'BRL';
  locale: 'pt-BR';
  backupReminderDays: number;
  securityEnabled: boolean;
  securityLockType: SecurityLockType;
  lockAfterMinutes?: number;
  pinHash?: string | null;
};
```

### Regras

- `pinHash` nunca deve salvar PIN em texto puro.
- Se segurança atrasar a V1, manter campos preparados, mas não prometer recurso ativo.

---

## 4.18. AppMeta

Controle de versão do banco e migrações.

```ts
export type AppMeta = {
  key: string;
  value: string;
  updatedAt: ISODateString;
};
```

Chaves sugeridas:

```txt
schema_version
last_order_number
database_created_at
last_integrity_check_at
```

---

## 5. Relacionamentos

```txt
CompanyProfile 1 ── 1 PdfSettings
CompanyProfile 1 ── 1 DefaultTerms
Customer 1 ── N Equipment
Customer 1 ── N ServiceOrder
Equipment 1 ── N ServiceOrder
ServiceOrder 1 ── N ServiceOrderItem
ServiceOrder 1 ── N Payment
ServiceOrder 1 ── N PhotoAttachment
ServiceOrder 1 ── N SignatureRecord
ServiceOrder 1 ── N ServiceOrderPdf
ServiceOrder 1 ── N ServiceOrderStatusHistory
ServiceCatalogItem 1 ── N ServiceOrderItem
PartCatalogItem 1 ── N ServiceOrderItem
```

### 5.1. Regras de integridade

- `ServiceOrder.customerId` é obrigatório.
- `ServiceOrder.equipmentId` é opcional, mas se existir deve apontar para equipamento do mesmo cliente.
- `Equipment.customerId` é obrigatório.
- `ServiceOrderItem.orderId` é obrigatório.
- `Payment.orderId` é obrigatório.
- Fotos podem ter vínculo com OS, equipamento ou cliente.
- Assinaturas sempre pertencem a uma OS.
- PDFs sempre pertencem a uma OS.

---

## 6. Schema SQLite V1

> Observação: SQLite não tem tipos fortes como PostgreSQL. Usar `TEXT`, `INTEGER` e `REAL` de forma consistente. Dinheiro deve ficar em `INTEGER`.

## 6.1. app_meta

```sql
CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

---

## 6.2. company_profile

```sql
CREATE TABLE IF NOT EXISTS company_profile (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  trade_name TEXT,
  document TEXT,
  state_registration TEXT,
  municipal_registration TEXT,
  responsible_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  site TEXT,
  instagram TEXT,
  address_line TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  logo_uri TEXT,
  default_responsible_signature_uri TEXT,
  is_onboarding_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_reason TEXT
);
```

---

## 6.3. pdf_settings

```sql
CREATE TABLE IF NOT EXISTS pdf_settings (
  id TEXT PRIMARY KEY NOT NULL,
  primary_color TEXT NOT NULL DEFAULT '#0B63F6',
  document_model TEXT NOT NULL DEFAULT 'classic',
  show_photos INTEGER NOT NULL DEFAULT 1,
  show_signatures INTEGER NOT NULL DEFAULT 1,
  show_values INTEGER NOT NULL DEFAULT 1,
  show_diagnosis INTEGER NOT NULL DEFAULT 1,
  show_app_branding INTEGER NOT NULL DEFAULT 1,
  footer_text TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_reason TEXT
);
```

---

## 6.4. default_terms

```sql
CREATE TABLE IF NOT EXISTS default_terms (
  id TEXT PRIMARY KEY NOT NULL,
  warranty_text TEXT,
  service_authorization_text TEXT,
  withdrawal_text TEXT,
  data_responsibility_text TEXT,
  unclaimed_equipment_text TEXT,
  rejected_budget_text TEXT,
  customer_supplied_parts_text TEXT,
  payment_terms_text TEXT,
  show_warranty_text INTEGER NOT NULL DEFAULT 1,
  show_service_authorization_text INTEGER NOT NULL DEFAULT 1,
  show_withdrawal_text INTEGER NOT NULL DEFAULT 1,
  show_data_responsibility_text INTEGER NOT NULL DEFAULT 1,
  show_unclaimed_equipment_text INTEGER NOT NULL DEFAULT 1,
  show_rejected_budget_text INTEGER NOT NULL DEFAULT 1,
  show_customer_supplied_parts_text INTEGER NOT NULL DEFAULT 1,
  show_payment_terms_text INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_reason TEXT
);
```

---

## 6.5. customers

```sql
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL DEFAULT 'person',
  name TEXT NOT NULL,
  trade_name TEXT,
  document TEXT,
  secondary_document TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  secondary_contact_name TEXT,
  secondary_phone TEXT,
  address_line TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  origin TEXT,
  profile_type TEXT,
  contact_preference TEXT,
  general_notes TEXT,
  internal_notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  last_service_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_reason TEXT
);
```

### Índices

```sql
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_whatsapp ON customers(whatsapp);
CREATE INDEX IF NOT EXISTS idx_customers_document ON customers(document);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_updated_at ON customers(updated_at);
```

---

## 6.6. equipments

```sql
CREATE TABLE IF NOT EXISTS equipments (
  id TEXT PRIMARY KEY NOT NULL,
  customer_id TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT,
  description TEXT,
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  patrimony_code TEXT,
  color TEXT,
  voltage TEXT,
  year TEXT,
  physical_state TEXT,
  accessories_json TEXT,
  technical_notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  last_service_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_reason TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

### Índices

```sql
CREATE INDEX IF NOT EXISTS idx_equipments_customer_id ON equipments(customer_id);
CREATE INDEX IF NOT EXISTS idx_equipments_category ON equipments(category);
CREATE INDEX IF NOT EXISTS idx_equipments_brand_model ON equipments(brand, model);
CREATE INDEX IF NOT EXISTS idx_equipments_serial_number ON equipments(serial_number);
CREATE INDEX IF NOT EXISTS idx_equipments_status ON equipments(status);
```

---

## 6.7. service_catalog_items

```sql
CREATE TABLE IF NOT EXISTS service_catalog_items (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  default_description TEXT,
  default_price_cents INTEGER NOT NULL DEFAULT 0,
  estimated_time_minutes INTEGER,
  default_warranty_days INTEGER,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_reason TEXT
);
```

### Índices

```sql
CREATE INDEX IF NOT EXISTS idx_service_catalog_name ON service_catalog_items(name);
CREATE INDEX IF NOT EXISTS idx_service_catalog_category ON service_catalog_items(category);
CREATE INDEX IF NOT EXISTS idx_service_catalog_status ON service_catalog_items(status);
```

---

## 6.8. part_catalog_items

```sql
CREATE TABLE IF NOT EXISTS part_catalog_items (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  internal_code TEXT,
  category TEXT,
  brand TEXT,
  compatible_model TEXT,
  cost_cents INTEGER,
  sale_price_cents INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'unit',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_reason TEXT
);
```

### Índices

```sql
CREATE INDEX IF NOT EXISTS idx_part_catalog_name ON part_catalog_items(name);
CREATE INDEX IF NOT EXISTS idx_part_catalog_code ON part_catalog_items(internal_code);
CREATE INDEX IF NOT EXISTS idx_part_catalog_category ON part_catalog_items(category);
CREATE INDEX IF NOT EXISTS idx_part_catalog_status ON part_catalog_items(status);
```

---

## 6.9. service_orders

```sql
CREATE TABLE IF NOT EXISTS service_orders (
  id TEXT PRIMARY KEY NOT NULL,
  number INTEGER NOT NULL UNIQUE,
  short_code TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  equipment_id TEXT,
  is_service_without_equipment INTEGER NOT NULL DEFAULT 0,
  technician_name TEXT,
  opened_at TEXT NOT NULL,
  expected_completion_at TEXT,
  completed_at TEXT,
  delivered_at TEXT,
  approved_at TEXT,
  cancelled_at TEXT,
  cancel_reason TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  origin TEXT,

  reported_issue TEXT NOT NULL,
  customer_conditions TEXT,
  problem_started_at_description TEXT,
  is_intermittent INTEGER DEFAULT 0,
  had_fall INTEGER DEFAULT 0,
  had_liquid_contact INTEGER DEFAULT 0,
  had_power_surge INTEGER DEFAULT 0,
  had_misuse INTEGER DEFAULT 0,
  had_previous_repair_attempt INTEGER DEFAULT 0,
  initial_notes TEXT,

  diagnosis TEXT,
  performed_tests TEXT,
  probable_cause TEXT,
  recommended_service TEXT,
  performed_service TEXT,
  replaced_parts_description TEXT,
  not_replaced_parts_description TEXT,
  customer_recommendations TEXT,
  internal_notes TEXT,
  customer_visible_notes TEXT,

  labor_total_cents INTEGER NOT NULL DEFAULT 0,
  parts_total_cents INTEGER NOT NULL DEFAULT 0,
  other_costs_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  paid_cents INTEGER NOT NULL DEFAULT 0,
  pending_cents INTEGER NOT NULL DEFAULT 0,

  payment_condition TEXT,
  warranty_days INTEGER,
  budget_validity_days INTEGER,
  is_approved_by_customer INTEGER NOT NULL DEFAULT 0,

  last_pdf_id TEXT,
  last_pdf_generated_at TEXT,
  is_pdf_outdated INTEGER NOT NULL DEFAULT 0,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_reason TEXT,

  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (equipment_id) REFERENCES equipments(id)
);
```

### Índices

```sql
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON service_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_equipment_id ON service_orders(equipment_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_priority ON service_orders(priority);
CREATE INDEX IF NOT EXISTS idx_orders_opened_at ON service_orders(opened_at);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON service_orders(updated_at);
CREATE INDEX IF NOT EXISTS idx_orders_number ON service_orders(number);
CREATE INDEX IF NOT EXISTS idx_orders_short_code ON service_orders(short_code);
```

---

## 6.10. service_order_items

```sql
CREATE TABLE IF NOT EXISTS service_order_items (
  id TEXT PRIMARY KEY NOT NULL,
  order_id TEXT NOT NULL,
  type TEXT NOT NULL,
  catalog_service_id TEXT,
  catalog_part_id TEXT,
  description TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  warranty_days INTEGER,
  technician_name TEXT,
  notes TEXT,
  part_condition TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_reason TEXT,
  FOREIGN KEY (order_id) REFERENCES service_orders(id),
  FOREIGN KEY (catalog_service_id) REFERENCES service_catalog_items(id),
  FOREIGN KEY (catalog_part_id) REFERENCES part_catalog_items(id)
);
```

### Índices

```sql
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON service_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_type ON service_order_items(type);
CREATE INDEX IF NOT EXISTS idx_order_items_sort_order ON service_order_items(order_id, sort_order);
```

---

## 6.11. payments

```sql
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY NOT NULL,
  order_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid',
  paid_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_reason TEXT,
  FOREIGN KEY (order_id) REFERENCES service_orders(id)
);
```

### Índices

```sql
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
```

---

## 6.12. photo_attachments

```sql
CREATE TABLE IF NOT EXISTS photo_attachments (
  id TEXT PRIMARY KEY NOT NULL,
  order_id TEXT,
  equipment_id TEXT,
  customer_id TEXT,
  type TEXT NOT NULL DEFAULT 'other',
  local_uri TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  caption TEXT,
  include_in_pdf INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_reason TEXT,
  FOREIGN KEY (order_id) REFERENCES service_orders(id),
  FOREIGN KEY (equipment_id) REFERENCES equipments(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

### Índices

```sql
CREATE INDEX IF NOT EXISTS idx_photos_order_id ON photo_attachments(order_id);
CREATE INDEX IF NOT EXISTS idx_photos_equipment_id ON photo_attachments(equipment_id);
CREATE INDEX IF NOT EXISTS idx_photos_customer_id ON photo_attachments(customer_id);
CREATE INDEX IF NOT EXISTS idx_photos_type ON photo_attachments(type);
```

---

## 6.13. signature_records

```sql
CREATE TABLE IF NOT EXISTS signature_records (
  id TEXT PRIMARY KEY NOT NULL,
  order_id TEXT NOT NULL,
  type TEXT NOT NULL,
  signer_name TEXT NOT NULL,
  signer_document TEXT,
  local_uri TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  signed_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_reason TEXT,
  FOREIGN KEY (order_id) REFERENCES service_orders(id)
);
```

### Índices

```sql
CREATE INDEX IF NOT EXISTS idx_signatures_order_id ON signature_records(order_id);
CREATE INDEX IF NOT EXISTS idx_signatures_type ON signature_records(type);
```

---

## 6.14. service_order_pdfs

```sql
CREATE TABLE IF NOT EXISTS service_order_pdfs (
  id TEXT PRIMARY KEY NOT NULL,
  order_id TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'generated',
  local_uri TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  generated_at TEXT NOT NULL,
  generated_from_order_updated_at TEXT NOT NULL,
  company_snapshot_json TEXT NOT NULL,
  customer_snapshot_json TEXT NOT NULL,
  equipment_snapshot_json TEXT,
  order_snapshot_json TEXT NOT NULL,
  settings_snapshot_json TEXT NOT NULL,
  terms_snapshot_json TEXT,
  total_cents INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_reason TEXT,
  FOREIGN KEY (order_id) REFERENCES service_orders(id)
);
```

### Índices

```sql
CREATE INDEX IF NOT EXISTS idx_pdfs_order_id ON service_order_pdfs(order_id);
CREATE INDEX IF NOT EXISTS idx_pdfs_status ON service_order_pdfs(status);
CREATE INDEX IF NOT EXISTS idx_pdfs_generated_at ON service_order_pdfs(generated_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pdfs_order_version ON service_order_pdfs(order_id, version);
```

---

## 6.15. service_order_status_history

```sql
CREATE TABLE IF NOT EXISTS service_order_status_history (
  id TEXT PRIMARY KEY NOT NULL,
  order_id TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_at TEXT NOT NULL,
  reason TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_reason TEXT,
  FOREIGN KEY (order_id) REFERENCES service_orders(id)
);
```

### Índices

```sql
CREATE INDEX IF NOT EXISTS idx_status_history_order_id ON service_order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_at ON service_order_status_history(changed_at);
```

---

## 6.16. order_drafts

```sql
CREATE TABLE IF NOT EXISTS order_drafts (
  id TEXT PRIMARY KEY NOT NULL,
  customer_id TEXT,
  equipment_id TEXT,
  is_service_without_equipment INTEGER NOT NULL DEFAULT 0,
  current_step TEXT NOT NULL DEFAULT 'customer',
  draft_json TEXT NOT NULL,
  last_touched_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_reason TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (equipment_id) REFERENCES equipments(id)
);
```

### Índices

```sql
CREATE INDEX IF NOT EXISTS idx_order_drafts_last_touched ON order_drafts(last_touched_at);
```

---

## 6.17. backup_metadata

```sql
CREATE TABLE IF NOT EXISTS backup_metadata (
  id TEXT PRIMARY KEY NOT NULL,
  last_backup_at TEXT,
  last_backup_uri TEXT,
  last_backup_size_bytes INTEGER,
  last_imported_at TEXT,
  last_imported_version INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_reason TEXT
);
```

---

## 6.18. app_settings

```sql
CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY NOT NULL,
  theme_mode TEXT NOT NULL DEFAULT 'system',
  currency TEXT NOT NULL DEFAULT 'BRL',
  locale TEXT NOT NULL DEFAULT 'pt-BR',
  backup_reminder_days INTEGER NOT NULL DEFAULT 7,
  security_enabled INTEGER NOT NULL DEFAULT 0,
  security_lock_type TEXT NOT NULL DEFAULT 'none',
  lock_after_minutes INTEGER,
  pin_hash TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  deleted_reason TEXT
);
```

---

## 7. Regras de cálculo

## 7.1. Cálculo de item

```ts
export function calculateOrderItemTotal(input: {
  quantity: number;
  unitPriceCents: number;
  discountCents: number;
}): number {
  const gross = Math.round(input.quantity * input.unitPriceCents);
  return Math.max(0, gross - input.discountCents);
}
```

## 7.2. Cálculo da OS

```ts
export function calculateOrderTotals(items: ServiceOrderItem[], payments: Payment[], generalDiscountCents = 0) {
  const activeItems = items.filter(item => !item.deletedAt);

  const laborTotalCents = activeItems
    .filter(item => item.type === 'service')
    .reduce((sum, item) => sum + item.totalCents, 0);

  const partsTotalCents = activeItems
    .filter(item => item.type === 'part')
    .reduce((sum, item) => sum + item.totalCents, 0);

  const otherCostsCents = activeItems
    .filter(item => item.type === 'other_cost')
    .reduce((sum, item) => sum + item.totalCents, 0);

  const subtotalCents = laborTotalCents + partsTotalCents + otherCostsCents;
  const totalCents = Math.max(0, subtotalCents - generalDiscountCents);

  const paidCents = payments
    .filter(payment => !payment.deletedAt && payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amountCents, 0);

  const pendingCents = Math.max(0, totalCents - paidCents);

  return {
    laborTotalCents,
    partsTotalCents,
    otherCostsCents,
    discountCents: generalDiscountCents,
    subtotalCents,
    totalCents,
    paidCents,
    pendingCents,
  };
}
```

## 7.3. Regras obrigatórias

- Desconto não pode gerar total negativo.
- Valor pago maior que total exige confirmação.
- Quantidade deve ser maior que zero.
- Item pode ter valor zero.
- Todos os valores financeiros devem ser exibidos em BRL.

---

## 8. Número sequencial da OS

## 8.1. Estratégia

Usar `app_meta.key = 'last_order_number'` para controlar o último número gerado.

```ts
export async function getNextOrderNumber(db: SQLiteDatabase): Promise<number> {
  return db.transactionAsync(async tx => {
    const current = await getAppMetaNumber(tx, 'last_order_number', 0);
    const next = current + 1;
    await setAppMeta(tx, 'last_order_number', String(next));
    return next;
  });
}
```

## 8.2. Geração de shortCode

```ts
export function buildOrderShortCode(orderNumber: number): string {
  return `OS-${String(orderNumber).padStart(6, '0')}`;
}
```

### Regras

- O número deve ser gerado em transação.
- Nunca reutilizar número de OS cancelada.
- Importação de backup deve atualizar `last_order_number` para o maior número existente.

---

## 9. Regras de status da OS

## 9.1. Transições recomendadas

```ts
export const allowedStatusTransitions: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
  open: ['diagnosis', 'waiting_approval', 'cancelled'],
  diagnosis: ['waiting_approval', 'approved', 'waiting_part', 'cancelled'],
  waiting_approval: ['approved', 'cancelled'],
  approved: ['in_progress', 'waiting_part', 'cancelled'],
  in_progress: ['waiting_part', 'completed', 'cancelled'],
  waiting_part: ['in_progress', 'completed', 'cancelled'],
  completed: ['delivered', 'in_progress'],
  delivered: ['open'],
  cancelled: ['open'],
};
```

## 9.2. Efeitos automáticos

```txt
approved       → preencher approved_at quando vazio
completed      → preencher completed_at quando vazio
delivered      → preencher delivered_at quando vazio e sugerir assinatura de retirada
cancelled      → preencher cancelled_at e exigir cancel_reason
qualquer mudança → gravar service_order_status_history
```

## 9.3. Regras

- Reabrir OS entregue exige confirmação.
- Cancelar OS exige motivo.
- OS entregue não deve ser editada sem confirmação.
- Histórico não deve ser apagado.

---

## 10. Regras de validação por entidade

## 10.1. CompanyProfile

```ts
export function validateCompanyProfile(profile: Partial<CompanyProfile>) {
  const errors: Record<string, string> = {};

  if (!profile.name?.trim()) {
    errors.name = 'Informe o nome da empresa.';
  }

  if (!profile.phone?.trim() && !profile.whatsapp?.trim()) {
    errors.phone = 'Informe um telefone ou WhatsApp.';
  }

  return errors;
}
```

## 10.2. Customer

```ts
export function validateCustomer(customer: Partial<Customer>) {
  const errors: Record<string, string> = {};

  if (!customer.name?.trim()) {
    errors.name = 'Informe o nome do cliente.';
  }

  if (!customer.phone?.trim() && !customer.whatsapp?.trim()) {
    errors.phone = 'Informe telefone ou WhatsApp.';
  }

  return errors;
}
```

## 10.3. Equipment

```ts
export function validateEquipment(equipment: Partial<Equipment>) {
  const errors: Record<string, string> = {};

  if (!equipment.customerId) {
    errors.customerId = 'Selecione o cliente proprietário.';
  }

  if (!equipment.category && !equipment.description?.trim()) {
    errors.category = 'Informe a categoria ou uma descrição do equipamento.';
  }

  return errors;
}
```

## 10.4. ServiceOrder

```ts
export function validateServiceOrder(order: Partial<ServiceOrder>) {
  const errors: Record<string, string> = {};

  if (!order.customerId) {
    errors.customerId = 'Selecione um cliente.';
  }

  if (!order.reportedIssue?.trim()) {
    errors.reportedIssue = 'Informe o defeito relatado ou serviço solicitado.';
  }

  if (!order.status) {
    errors.status = 'Informe o status da OS.';
  }

  if (!order.openedAt) {
    errors.openedAt = 'Informe a data de abertura.';
  }

  if (!order.isServiceWithoutEquipment && !order.equipmentId) {
    errors.equipmentId = 'Selecione um equipamento ou marque serviço sem equipamento.';
  }

  return errors;
}
```

## 10.5. PDF

```ts
export function validatePdfGeneration(input: {
  company?: CompanyProfile | null;
  order?: ServiceOrder | null;
  customer?: Customer | null;
}) {
  const errors: string[] = [];

  if (!input.company?.name) errors.push('Empresa configurada.');
  if (!input.order?.number) errors.push('Número da OS.');
  if (!input.customer?.name) errors.push('Cliente.');
  if (!input.order?.reportedIssue) errors.push('Descrição da solicitação.');

  return errors;
}
```

---

## 11. Repositórios locais

## 11.1. Regra geral

Telas chamam hooks. Hooks chamam repositórios/services. Repositórios falam com SQLite.

```txt
Tela → Hook → Repository/Service → SQLite/FileSystem
```

## 11.2. Interfaces sugeridas

```ts
export type ListResult<T> = {
  data: T[];
  total: number;
};

export type RepositoryResult<T> = {
  data?: T;
  error?: string;
};
```

### CompanyRepository

```ts
export type CompanyRepository = {
  getActive(): Promise<CompanyProfile | null>;
  upsert(profile: CompanyProfile): Promise<CompanyProfile>;
  markOnboardingCompleted(id: UUID): Promise<void>;
};
```

### CustomerRepository

```ts
export type CustomerRepository = {
  list(params?: { query?: string; status?: EntityStatus }): Promise<ListResult<Customer>>;
  getById(id: UUID): Promise<Customer | null>;
  create(input: Customer): Promise<Customer>;
  update(id: UUID, input: Partial<Customer>): Promise<Customer>;
  softDelete(id: UUID, reason?: string): Promise<void>;
  findPossibleDuplicates(input: Pick<Customer, 'name' | 'phone' | 'whatsapp' | 'document'>): Promise<Customer[]>;
};
```

### EquipmentRepository

```ts
export type EquipmentRepository = {
  list(params?: { query?: string; customerId?: UUID; category?: EquipmentCategory }): Promise<ListResult<Equipment>>;
  getById(id: UUID): Promise<Equipment | null>;
  create(input: Equipment): Promise<Equipment>;
  update(id: UUID, input: Partial<Equipment>): Promise<Equipment>;
  softDelete(id: UUID, reason?: string): Promise<void>;
  findPossibleDuplicates(input: Pick<Equipment, 'customerId' | 'serialNumber' | 'brand' | 'model'>): Promise<Equipment[]>;
};
```

### ServiceOrderRepository

```ts
export type ServiceOrderRepository = {
  list(params?: {
    query?: string;
    status?: ServiceOrderStatus;
    customerId?: UUID;
    equipmentId?: UUID;
    from?: ISODateString;
    to?: ISODateString;
  }): Promise<ListResult<ServiceOrder>>;
  getById(id: UUID): Promise<ServiceOrder | null>;
  createFromDraft(draft: OrderDraft): Promise<ServiceOrder>;
  update(id: UUID, input: Partial<ServiceOrder>): Promise<ServiceOrder>;
  updateStatus(id: UUID, status: ServiceOrderStatus, reason?: string): Promise<ServiceOrder>;
  recalculateTotals(id: UUID): Promise<ServiceOrder>;
  markPdfOutdated(id: UUID): Promise<void>;
  cancel(id: UUID, reason: string): Promise<ServiceOrder>;
};
```

---

## 12. Hooks necessários

```ts
export function useCompanyProfile() {
  // get, save, loading, error
}

export function useCustomers(params?: { query?: string }) {
  // list, create, update, softDelete, loading, error
}

export function useEquipments(params?: { customerId?: string; query?: string }) {
  // list, create, update, softDelete, loading, error
}

export function useServiceOrders(params?: { status?: ServiceOrderStatus; query?: string }) {
  // list, get, create, updateStatus, cancel, loading, error
}

export function useOrderDraft() {
  // draft, updateDraft, recoverDraft, clearDraft
}

export function useCatalog() {
  // services, parts, add/edit/inactivate
}

export function usePdfGenerator(orderId: string) {
  // generate, regenerate, share, loading, error
}

export function useBackup() {
  // exportBackup, importBackup, metadata, loading, error
}
```

---

## 13. Busca local

## 13.1. Termos buscáveis

A busca deve localizar:

- número da OS;
- código curto da OS;
- nome do cliente;
- telefone;
- CPF/CNPJ;
- e-mail;
- marca;
- modelo;
- número de série;
- código patrimonial;
- serviço;
- peça;
- status.

## 13.2. Estratégia V1

Usar `LIKE` com índices simples e normalização básica. FTS pode ficar para V1.1 se necessário.

### Exemplo para lista de OS

```sql
SELECT so.*
FROM service_orders so
LEFT JOIN customers c ON c.id = so.customer_id
LEFT JOIN equipments e ON e.id = so.equipment_id
WHERE so.deleted_at IS NULL
  AND (
    CAST(so.number AS TEXT) LIKE :query
    OR so.short_code LIKE :query
    OR c.name LIKE :query
    OR c.phone LIKE :query
    OR c.whatsapp LIKE :query
    OR c.document LIKE :query
    OR e.brand LIKE :query
    OR e.model LIKE :query
    OR e.serial_number LIKE :query
  )
ORDER BY so.updated_at DESC;
```

### Regra

- Busca deve funcionar offline.
- Busca sem resultado deve permitir criar novo cliente, equipamento ou OS.

---

## 14. Backup e restauração

## 14.1. Estrutura do backup JSON

```ts
export type OrdemProBackup = {
  app: 'OrdemPro';
  backupVersion: 1;
  exportedAt: ISODateString;
  databaseSchemaVersion: number;
  data: {
    appMeta: AppMeta[];
    companyProfile: CompanyProfile[];
    pdfSettings: PdfSettings[];
    defaultTerms: DefaultTerms[];
    customers: Customer[];
    equipments: Equipment[];
    serviceCatalogItems: ServiceCatalogItem[];
    partCatalogItems: PartCatalogItem[];
    serviceOrders: ServiceOrder[];
    serviceOrderItems: ServiceOrderItem[];
    payments: Payment[];
    photoAttachments: PhotoAttachment[];
    signatureRecords: SignatureRecord[];
    serviceOrderPdfs: ServiceOrderPdf[];
    serviceOrderStatusHistory: ServiceOrderStatusHistory[];
    orderDrafts: OrderDraft[];
    backupMetadata: BackupMetadata[];
    appSettings: AppSettings[];
  };
  files?: {
    logos: FileReference[];
    photos: FileReference[];
    signatures: FileReference[];
    pdfs: FileReference[];
  };
};
```

## 14.2. Exportação

```txt
1. Ler dados do SQLite.
2. Verificar referências de arquivos locais.
3. Criar JSON com metadados.
4. Se incluir arquivos, empacotar JSON + arquivos em ZIP.
5. Salvar arquivo local.
6. Atualizar backup_metadata.
7. Abrir share sheet/salvamento do sistema.
```

## 14.3. Importação

```txt
1. Selecionar arquivo.
2. Validar assinatura/estrutura mínima.
3. Validar backupVersion.
4. Criar backup atual antes de importar.
5. Perguntar se deseja mesclar ou substituir.
6. Importar dados em transação.
7. Copiar arquivos para diretório do app.
8. Atualizar last_order_number para maior number de service_orders.
9. Rodar verificação de integridade.
```

## 14.4. Regras

- Não importar arquivo desconhecido sem validação.
- Importação deve ser transacional sempre que possível.
- Se falhar, manter dados anteriores.
- Backup deve incluir dados essenciais e referências a fotos, assinaturas, logos e PDFs.

---

## 15. Migrações

## 15.1. Tabela de versão

Usar `app_meta.schema_version`.

```ts
const CURRENT_SCHEMA_VERSION = 1;
```

## 15.2. Runner de migração

```ts
export async function runMigrations(db: SQLiteDatabase) {
  const currentVersion = await getSchemaVersion(db);

  if (currentVersion < 1) {
    await migrateToV1(db);
    await setSchemaVersion(db, 1);
  }
}
```

## 15.3. Ordem da migração V1

```txt
1. app_meta
2. company_profile
3. pdf_settings
4. default_terms
5. customers
6. equipments
7. service_catalog_items
8. part_catalog_items
9. service_orders
10. service_order_items
11. payments
12. photo_attachments
13. signature_records
14. service_order_pdfs
15. service_order_status_history
16. order_drafts
17. backup_metadata
18. app_settings
19. índices
20. seeds iniciais
```

## 15.4. Seeds iniciais

Criar quando banco estiver vazio:

```txt
pdf_settings padrão
terms padrão editáveis
app_settings padrão
backup_metadata vazio
app_meta.last_order_number = 0
```

---

## 16. Estratégia de arquivos locais

## 16.1. Pastas sugeridas

```txt
FileSystem.documentDirectory/
  ordempro/
    logos/
    photos/
    signatures/
    pdfs/
    backups/
```

## 16.2. Regras

- Copiar imagens selecionadas para pasta do app.
- Não depender do arquivo original da galeria.
- Comprimir fotos antes de salvar.
- Salvar apenas `localUri`, `fileName`, `mimeType`, `sizeBytes` no banco.
- Em backup ZIP, incluir arquivos referenciados quando possível.

---

## 17. PDF — snapshot e desatualização

## 17.1. Snapshot mínimo

Ao gerar PDF, salvar:

```txt
company_snapshot_json
customer_snapshot_json
equipment_snapshot_json
order_snapshot_json
settings_snapshot_json
terms_snapshot_json
generated_from_order_updated_at
```

## 17.2. Regra de PDF desatualizado

```ts
export function isPdfOutdated(order: ServiceOrder, pdf: ServiceOrderPdf) {
  return new Date(order.updatedAt).getTime() > new Date(pdf.generatedFromOrderUpdatedAt).getTime();
}
```

## 17.3. Campos que devem marcar PDF como desatualizado

- Dados do cliente na OS.
- Dados do equipamento na OS.
- Defeito relatado.
- Diagnóstico.
- Itens de serviço/peça.
- Valores.
- Pagamentos.
- Termos.
- Fotos incluídas no PDF.
- Assinaturas.
- Status relevante para documento.

---

## 18. Soft delete e proteção de histórico

## 18.1. Regra geral

Entidades com histórico devem usar `deleted_at`.

### Soft delete obrigatório para:

- Customer
- Equipment
- ServiceOrder
- ServiceOrderItem
- Payment
- PhotoAttachment
- SignatureRecord
- ServiceOrderPdf

## 18.2. Bloqueios

- Cliente com OS vinculada: bloquear hard delete.
- Equipamento com OS vinculada: bloquear hard delete.
- OS entregue: editar somente com confirmação.
- OS cancelada: manter histórico e bloquear remoção rápida.

---

## 19. Segurança e privacidade dos dados

## 19.1. Dados sensíveis armazenados

- Nome, documento, telefone, endereço e e-mail de clientes.
- Fotos de equipamentos e documentos.
- Assinaturas.
- PDFs de OS.

## 19.2. Regras

- Dados ficam no aparelho.
- Exportação/compartilhamento depende da ação do usuário.
- Backup deve alertar que contém dados sensíveis.
- PIN deve ser hash, nunca texto puro.
- Não enviar dados automaticamente para servidor na V1.

---

## 20. Premium futuro preparado no modelo

A V1 pode nascer sem premium ativo. O modelo pode deixar campos preparados sem bloquear o app.

```ts
export type PremiumFeature =
  | 'unlimited_orders'
  | 'remove_pdf_branding'
  | 'advanced_pdf_models'
  | 'unlimited_photos'
  | 'advanced_signature'
  | 'csv_export'
  | 'reports'
  | 'advanced_backup'
  | 'biometric_lock'
  | 'custom_fields';

export type PremiumState = BaseEntity & {
  isPremium: boolean;
  entitlementId?: string;
  source?: 'revenuecat' | 'local_mock';
  expiresAt?: ISODateString | null;
};
```

### Regra

Não implementar pagamento premium real antes do app básico funcionar.

---

## 21. Views e helpers recomendados

## 21.1. Resumo da Home

```ts
export type HomeSummary = {
  openOrders: number;
  inProgressOrders: number;
  waitingApprovalOrders: number;
  completedThisMonth: number;
  recentOrders: ServiceOrder[];
  lastBackupAt?: ISODateString | null;
};
```

## 21.2. Resumo de cliente

```ts
export type CustomerSummary = {
  customer: Customer;
  openOrdersCount: number;
  completedOrdersCount: number;
  equipmentsCount: number;
  totalSpentCents: MoneyCents;
  lastServiceAt?: ISODateString;
};
```

## 21.3. Resumo de equipamento

```ts
export type EquipmentSummary = {
  equipment: Equipment;
  customer: Customer;
  ordersCount: number;
  lastServiceAt?: ISODateString;
  activeWarrantyUntil?: ISODateString;
};
```

## 21.4. Resumo de OS

```ts
export type ServiceOrderSummary = {
  order: ServiceOrder;
  customer: Pick<Customer, 'id' | 'name' | 'phone' | 'whatsapp'>;
  equipment?: Pick<Equipment, 'id' | 'category' | 'brand' | 'model' | 'serialNumber'>;
  itemsCount: number;
  photosCount: number;
  signaturesCount: number;
  latestPdf?: ServiceOrderPdf;
};
```

---

## 22. Critérios de aceite do Data Model

O documento `05_DATA_MODEL.md` estará pronto quando:

- todas as entidades previstas nas telas tiverem tipo TypeScript;
- todas as entidades principais tiverem tabela SQLite;
- relacionamentos principais estiverem definidos;
- campos obrigatórios mínimos estiverem claros;
- índices de busca estiverem previstos;
- cálculo de valores estiver padronizado;
- status da OS tiver regra e histórico;
- PDF tiver snapshot e controle de desatualização;
- backup tiver estrutura exportável/importável;
- soft delete estiver previsto para preservar histórico;
- hooks e repositórios estiverem definidos;
- Codex conseguir implementar a camada local sem depender da conversa solta.

---

## 23. Próxima etapa recomendada

Criar o arquivo:

```txt
docs/06_CODEX_TASKS.md
```

Esse arquivo deve transformar o projeto em tarefas pequenas para o Codex, começando por:

```txt
1. auditoria inicial do projeto;
2. criação da base visual;
3. criação do SQLite e migrações;
4. implementação dos tipos TypeScript;
5. repositories e hooks;
6. onboarding;
7. clientes;
8. equipamentos;
9. catálogo;
10. OS;
11. PDF;
12. backup.
```
