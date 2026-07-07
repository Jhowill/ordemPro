import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { createEmptyAppData, initialData } from '@/data/seed';
import { normalizeAppData } from '@/data/normalizeAppData';
import { loadAppData, replaceAppData } from '@/database/appDatabase';
import { AppData, CatalogPart, CatalogService, CompanyProfile, Customer, DefaultTerms, Equipment, Payment, PdfSettings, PhotoAttachment, SecuritySettings, ServiceOrder, ServiceOrderItem, ServiceOrderPdf, ServiceOrderStatusHistory, SignatureRecord, TechnicianProfile } from '@/types';
import { calculateOrderTotals } from '@/services/calculations';
import { clearStoredMedia } from '@/services/media';
import { makeId, nowIso } from '@/utils/formatters';

type AppDataContextValue = {
  data: AppData;
  loading: boolean;
  loadError: string | null;
  saveCompany: (company: Partial<CompanyProfile>) => Promise<void>;
  saveTerms: (terms: Partial<DefaultTerms>) => Promise<void>;
  savePdfSettings: (settings: Partial<PdfSettings>) => Promise<void>;
  addCustomer: (input: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<Customer>;
  addEquipment: (input: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<Equipment>;
  addCatalogService: (input: Pick<CatalogService, 'name' | 'category' | 'defaultPriceCents'>) => Promise<void>;
  saveCatalogService: (input: Partial<CatalogService> & Pick<CatalogService, 'name' | 'defaultPriceCents'>) => Promise<void>;
  removeCatalogService: (id: string) => Promise<void>;
  addCatalogPart: (input: Pick<CatalogPart, 'name' | 'category' | 'salePriceCents'>) => Promise<void>;
  saveCatalogPart: (input: Partial<CatalogPart> & Pick<CatalogPart, 'name' | 'salePriceCents'>) => Promise<void>;
  removeCatalogPart: (id: string) => Promise<void>;
  saveTechnician: (input: Partial<TechnicianProfile> & Pick<TechnicianProfile, 'name'>) => Promise<TechnicianProfile>;
  removeTechnician: (id: string) => Promise<void>;
  createOrder: (input: {
    customerId: string;
    equipmentId?: string | null;
    technicianId?: string | null;
    isServiceWithoutEquipment: boolean;
    reportedIssue: string;
    diagnosis?: string;
    performedService?: string;
    expectedCompletionAt?: string;
    priority?: ServiceOrder['priority'];
    warrantyDays?: number;
    items: Pick<ServiceOrderItem, 'type' | 'description' | 'quantity' | 'unitPriceCents' | 'discountCents'>[];
  }) => Promise<ServiceOrder>;
  updateOrder: (id: string, input: Partial<Pick<ServiceOrder, 'technicianId' | 'expectedCompletionAt' | 'priority' | 'reportedIssue' | 'diagnosis' | 'performedService' | 'warrantyDays' | 'isApprovedByCustomer'>>) => Promise<void>;
  replaceOrderItems: (orderId: string, items: Pick<ServiceOrderItem, 'type' | 'description' | 'quantity' | 'unitPriceCents' | 'discountCents'>[]) => Promise<void>;
  updateOrderStatus: (id: string, status: ServiceOrder['status'], input?: { reason?: string; notes?: string }) => Promise<void>;
  addOrderPhoto: (orderId: string, input: Pick<PhotoAttachment, 'localUri' | 'caption' | 'includeInPdf'>) => Promise<void>;
  updateOrderPhoto: (photoId: string, input: Partial<Pick<PhotoAttachment, 'caption' | 'includeInPdf'>>) => Promise<void>;
  removeOrderPhoto: (photoId: string) => Promise<void>;
  addSignature: (orderId: string, input: Pick<SignatureRecord, 'kind' | 'localUri' | 'signerName' | 'signerDocument'>) => Promise<void>;
  addPayment: (orderId: string, input: Pick<Payment, 'amountCents' | 'method' | 'paidAt'>) => Promise<void>;
  removePayment: (paymentId: string) => Promise<void>;
  updatePdfRecord: (pdf: ServiceOrderPdf) => Promise<void>;
  exportBackup: () => Promise<string>;
  importBackup: (json: string) => Promise<void>;
  saveSecuritySettings: (settings: SecuritySettings) => Promise<void>;
  resetDemo: () => Promise<void>;
  clearAllData: () => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

function withEntityDates<T extends object>(input: T) {
  const date = nowIso();
  return {
    id: makeId('entity'),
    createdAt: date,
    updatedAt: date,
    ...input,
  };
}

function recalculateOrder(order: ServiceOrder, items: ServiceOrderItem[], payments: Payment[]) {
  const totals = calculateOrderTotals(items, payments, order.discountCents);
  return {
    ...order,
    laborTotalCents: totals.laborTotalCents,
    partsTotalCents: totals.partsTotalCents,
    otherCostsCents: totals.otherCostsCents,
    subtotalCents: totals.subtotalCents,
    totalCents: totals.totalCents,
    paidCents: totals.paidCents,
    pendingCents: totals.pendingCents,
  };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(initialData);
  const dataRef = useRef<AppData>(initialData);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadAppData()
      .then((storedData) => {
        dataRef.current = storedData;
        setData(storedData);
        setLoadError(null);
      })
      .catch((error) => {
        console.error('Falha ao carregar SQLite do OrdemPro:', error);
        setLoadError(error instanceof Error ? error.message : 'Nao foi possivel carregar o banco local.');
      })
      .finally(() => setLoading(false));
  }, []);

  const commit = useCallback(async (updater: (current: AppData) => AppData) => {
    const nextData = updater(dataRef.current);
    dataRef.current = nextData;
    setData(nextData);
    await replaceAppData(nextData);
  }, []);

  const saveCompany = useCallback<AppDataContextValue['saveCompany']>(
    async (companyInput) => {
      await commit((current) => {
        const date = nowIso();
        const company: CompanyProfile = {
          id: current.company?.id ?? makeId('company'),
          createdAt: current.company?.createdAt ?? date,
          updatedAt: date,
          name: companyInput.name?.trim() || current.company?.name || 'Minha Empresa',
          tradeName: companyInput.tradeName,
          document: companyInput.document,
          responsibleName: companyInput.responsibleName,
          phone: companyInput.phone,
          whatsapp: companyInput.whatsapp,
          email: companyInput.email,
          addressLine: companyInput.addressLine,
          number: companyInput.number,
          neighborhood: companyInput.neighborhood,
          city: companyInput.city,
          state: companyInput.state,
          zipCode: companyInput.zipCode,
          logoUri: companyInput.logoUri,
          isOnboardingCompleted: true,
        };
        return { ...current, company };
      });
    },
    [commit],
  );

  const saveTerms = useCallback<AppDataContextValue['saveTerms']>(
    async (termsInput) => {
      await commit((current) => ({
        ...current,
        terms: {
          ...current.terms,
          ...termsInput,
          updatedAt: nowIso(),
        },
      }));
    },
    [commit],
  );

  const savePdfSettings = useCallback<AppDataContextValue['savePdfSettings']>(
    async (settingsInput) => {
      await commit((current) => ({
        ...current,
        pdfSettings: {
          ...current.pdfSettings,
          ...settingsInput,
          updatedAt: nowIso(),
        },
      }));
    },
    [commit],
  );

  const addCustomer = useCallback<AppDataContextValue['addCustomer']>(
    async (input) => {
      const customer: Customer = { ...withEntityDates(input), status: 'active' };
      await commit((current) => ({ ...current, customers: [customer, ...current.customers] }));
      return customer;
    },
    [commit],
  );

  const addEquipment = useCallback<AppDataContextValue['addEquipment']>(
    async (input) => {
      const equipment: Equipment = { ...withEntityDates(input), status: 'active' };
      await commit((current) => ({ ...current, equipments: [equipment, ...current.equipments] }));
      return equipment;
    },
    [commit],
  );

  const saveCatalogService = useCallback<AppDataContextValue['saveCatalogService']>(
    async (input) => {
      const date = nowIso();
      const service: CatalogService = {
        id: input.id ?? makeId('service'),
        createdAt: input.createdAt ?? date,
        updatedAt: date,
        name: input.name.trim() || 'Servico',
        category: input.category?.trim() || 'Geral',
        defaultPriceCents: Math.max(0, input.defaultPriceCents),
        defaultWarrantyDays: input.defaultWarrantyDays ?? 30,
        status: input.status ?? 'active',
      };
      await commit((current) => ({
        ...current,
        services: [service, ...current.services.filter((item) => item.id !== service.id)],
      }));
    },
    [commit],
  );

  const addCatalogService = useCallback<AppDataContextValue['addCatalogService']>(
    async (input) => {
      await saveCatalogService({ ...input, defaultWarrantyDays: 30, status: 'active' });
    },
    [saveCatalogService],
  );

  const removeCatalogService = useCallback<AppDataContextValue['removeCatalogService']>(
    async (id) => {
      await commit((current) => ({
        ...current,
        services: current.services.filter((item) => item.id !== id),
      }));
    },
    [commit],
  );

  const saveCatalogPart = useCallback<AppDataContextValue['saveCatalogPart']>(
    async (input) => {
      const date = nowIso();
      const part: CatalogPart = {
        id: input.id ?? makeId('part'),
        createdAt: input.createdAt ?? date,
        updatedAt: date,
        name: input.name.trim() || 'Peca',
        category: input.category?.trim() || 'Geral',
        salePriceCents: Math.max(0, input.salePriceCents),
        unit: input.unit ?? 'unit',
        status: input.status ?? 'active',
      };
      await commit((current) => ({
        ...current,
        parts: [part, ...current.parts.filter((item) => item.id !== part.id)],
      }));
    },
    [commit],
  );

  const addCatalogPart = useCallback<AppDataContextValue['addCatalogPart']>(
    async (input) => {
      await saveCatalogPart({ ...input, unit: 'unit', status: 'active' });
    },
    [saveCatalogPart],
  );

  const removeCatalogPart = useCallback<AppDataContextValue['removeCatalogPart']>(
    async (id) => {
      await commit((current) => ({
        ...current,
        parts: current.parts.filter((item) => item.id !== id),
      }));
    },
    [commit],
  );

  const saveTechnician = useCallback<AppDataContextValue['saveTechnician']>(
    async (input) => {
      const date = nowIso();
      const saved: TechnicianProfile = {
        id: input.id ?? makeId('technician'),
        createdAt: input.createdAt ?? date,
        updatedAt: date,
        name: input.name.trim() || 'Tecnico',
        document: input.document,
        phone: input.phone,
        email: input.email,
        role: input.role,
        signatureUri: input.signatureUri,
        isDefault: input.isDefault ?? true,
        status: input.status ?? 'active',
      };
      await commit((current) => ({
        ...current,
        technicians: [saved, ...current.technicians.filter((item) => item.id !== saved.id)].map((item) => ({
          ...item,
          isDefault: saved.isDefault ? item.id === saved.id : item.isDefault,
        })),
      }));
      return saved;
    },
    [commit],
  );

  const removeTechnician = useCallback<AppDataContextValue['removeTechnician']>(
    async (id) => {
      const date = nowIso();
      await commit((current) => {
        const remainingTechnicians = current.technicians.filter((item) => item.id !== id);
        const defaultTechnicianId = remainingTechnicians.find((item) => item.isDefault)?.id ?? remainingTechnicians[0]?.id ?? null;
        return {
          ...current,
          technicians: remainingTechnicians.map((item, index) => ({
            ...item,
            isDefault: item.id === defaultTechnicianId || (!defaultTechnicianId && index === 0),
          })),
          orders: current.orders.map((order) =>
            order.technicianId === id
              ? { ...order, technicianId: defaultTechnicianId, updatedAt: date, isPdfOutdated: true }
              : order,
          ),
        };
      });
    },
    [commit],
  );

  const createOrder = useCallback<AppDataContextValue['createOrder']>(
    async (input) => {
      const currentData = dataRef.current;
      const number = currentData.lastOrderNumber + 1;
      const date = nowIso();
      const orderId = makeId('order');
      const items: ServiceOrderItem[] = input.items.map((item) => ({
        ...withEntityDates(item),
        id: makeId('item'),
        orderId,
        totalCents: Math.max(0, item.quantity * item.unitPriceCents - item.discountCents),
      }));
      const totals = calculateOrderTotals(items, []);
      const order: ServiceOrder = {
        id: orderId,
        createdAt: date,
        updatedAt: date,
        number,
        shortCode: `OS-${String(number).padStart(6, '0')}`,
        customerId: input.customerId,
        equipmentId: input.equipmentId ?? null,
        technicianId: input.technicianId ?? currentData.technicians.find((item) => item.isDefault)?.id ?? currentData.technicians[0]?.id ?? null,
        isServiceWithoutEquipment: input.isServiceWithoutEquipment,
        openedAt: date,
        expectedCompletionAt: input.expectedCompletionAt,
        status: 'open',
        priority: input.priority ?? 'normal',
        reportedIssue: input.reportedIssue,
        diagnosis: input.diagnosis,
        performedService: input.performedService,
        laborTotalCents: totals.laborTotalCents,
        partsTotalCents: totals.partsTotalCents,
        otherCostsCents: totals.otherCostsCents,
        discountCents: totals.discountCents,
        subtotalCents: totals.subtotalCents,
        totalCents: totals.totalCents,
        paidCents: totals.paidCents,
        pendingCents: totals.pendingCents,
        warrantyDays: input.warrantyDays ?? 90,
        isApprovedByCustomer: false,
        isPdfOutdated: false,
      };
      await commit((current) => ({
        ...current,
        lastOrderNumber: number,
        orders: [order, ...current.orders],
        items: [...items, ...current.items],
      }));
      return order;
    },
    [commit],
  );

  const updateOrder = useCallback<AppDataContextValue['updateOrder']>(
    async (id, input) => {
      const date = nowIso();
      await commit((current) => ({
        ...current,
        orders: current.orders.map((order) =>
          order.id === id
            ? {
                ...order,
                ...input,
                expectedCompletionAt: input.expectedCompletionAt?.trim() ? input.expectedCompletionAt : undefined,
                diagnosis: input.diagnosis?.trim() ? input.diagnosis : undefined,
                performedService: input.performedService?.trim() ? input.performedService : undefined,
                updatedAt: date,
                isPdfOutdated: true,
              }
            : order,
        ),
      }));
    },
    [commit],
  );

  const replaceOrderItems = useCallback<AppDataContextValue['replaceOrderItems']>(
    async (orderId, inputItems) => {
      const date = nowIso();
      const nextItems: ServiceOrderItem[] = inputItems.map((item) => ({
        id: makeId('item'),
        orderId,
        type: item.type,
        description: item.description,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        discountCents: item.discountCents,
        totalCents: Math.max(0, item.quantity * item.unitPriceCents - item.discountCents),
        createdAt: date,
        updatedAt: date,
      }));
      await commit((current) => ({
        ...current,
        items: [...nextItems, ...current.items.filter((item) => item.orderId !== orderId)],
        orders: current.orders.map((order) =>
          order.id === orderId
            ? {
                ...recalculateOrder(
                  { ...order, updatedAt: date, isPdfOutdated: true },
                  nextItems,
                  current.payments.filter((payment) => payment.orderId === orderId),
                ),
              }
            : order,
        ),
      }));
    },
    [commit],
  );

  const updateOrderStatus = useCallback<AppDataContextValue['updateOrderStatus']>(
    async (id, status, input) => {
      const date = nowIso();
      await commit((current) => ({
        ...current,
        orders: current.orders.map((order) => (order.id === id ? { ...order, status, updatedAt: date, isPdfOutdated: true } : order)),
        statusHistory: [
          ...current.orders
            .filter((order) => order.id === id)
            .map<ServiceOrderStatusHistory>((order) => {
              return {
                id: makeId('status_history'),
                orderId: order.id,
                fromStatus: order.status,
                toStatus: status,
                changedAt: date,
                reason: input?.reason?.trim() || undefined,
                notes: input?.notes?.trim() || undefined,
                createdAt: date,
                updatedAt: date,
              };
            }),
          ...current.statusHistory,
        ],
      }));
    },
    [commit],
  );

  const addOrderPhoto = useCallback<AppDataContextValue['addOrderPhoto']>(
    async (orderId, input) => {
      const date = nowIso();
      const photo: PhotoAttachment = {
        id: makeId('photo'),
        orderId,
        localUri: input.localUri,
        caption: input.caption,
        includeInPdf: input.includeInPdf,
        createdAt: date,
        updatedAt: date,
      };
      await commit((current) => ({
        ...current,
        photos: [photo, ...current.photos],
        orders: current.orders.map((order) => (order.id === orderId ? { ...order, updatedAt: date, isPdfOutdated: true } : order)),
      }));
    },
    [commit],
  );

  const updateOrderPhoto = useCallback<AppDataContextValue['updateOrderPhoto']>(
    async (photoId, input) => {
      const date = nowIso();
      await commit((current) => {
        const photo = current.photos.find((item) => item.id === photoId);
        return {
          ...current,
          photos: current.photos.map((item) => (item.id === photoId ? { ...item, ...input, updatedAt: date } : item)),
          orders: photo?.orderId ? current.orders.map((order) => (order.id === photo.orderId ? { ...order, updatedAt: date, isPdfOutdated: true } : order)) : current.orders,
        };
      });
    },
    [commit],
  );

  const removeOrderPhoto = useCallback<AppDataContextValue['removeOrderPhoto']>(
    async (photoId) => {
      const date = nowIso();
      await commit((current) => {
        const photo = current.photos.find((item) => item.id === photoId);
        return {
          ...current,
          photos: current.photos.filter((item) => item.id !== photoId),
          orders: photo?.orderId ? current.orders.map((order) => (order.id === photo.orderId ? { ...order, updatedAt: date, isPdfOutdated: true } : order)) : current.orders,
        };
      });
    },
    [commit],
  );

  const addSignature = useCallback<AppDataContextValue['addSignature']>(
    async (orderId, input) => {
      const date = nowIso();
      const signature: SignatureRecord = {
        id: makeId('signature'),
        orderId,
        kind: input.kind,
        localUri: input.localUri,
        signerName: input.signerName,
        signerDocument: input.signerDocument,
        signedAt: date,
        createdAt: date,
        updatedAt: date,
      };
      await commit((current) => ({
        ...current,
        signatures: [signature, ...current.signatures.filter((item) => !(item.orderId === orderId && item.kind === input.kind))],
        orders: current.orders.map((order) => (order.id === orderId ? { ...order, updatedAt: date, isPdfOutdated: true, isApprovedByCustomer: input.kind === 'customer' ? true : order.isApprovedByCustomer } : order)),
      }));
    },
    [commit],
  );

  const addPayment = useCallback<AppDataContextValue['addPayment']>(
    async (orderId, input) => {
      const date = nowIso();
      const payment: Payment = {
        id: makeId('payment'),
        orderId,
        amountCents: Math.max(0, input.amountCents),
        method: input.method,
        paidAt: input.paidAt ?? date,
        createdAt: date,
        updatedAt: date,
      };
      await commit((current) => {
        const nextPayments = [payment, ...current.payments];
        return {
          ...current,
          payments: nextPayments,
          orders: current.orders.map((order) =>
            order.id === orderId
              ? {
                  ...recalculateOrder(
                    { ...order, updatedAt: date, isPdfOutdated: true },
                    current.items.filter((item) => item.orderId === orderId),
                    nextPayments.filter((item) => item.orderId === orderId),
                  ),
                }
              : order,
          ),
        };
      });
    },
    [commit],
  );

  const removePayment = useCallback<AppDataContextValue['removePayment']>(
    async (paymentId) => {
      const date = nowIso();
      await commit((current) => {
        const payment = current.payments.find((item) => item.id === paymentId);
        if (!payment) return current;
        const nextPayments = current.payments.filter((item) => item.id !== paymentId);
        return {
          ...current,
          payments: nextPayments,
          orders: current.orders.map((order) =>
            order.id === payment.orderId
              ? {
                  ...recalculateOrder(
                    { ...order, updatedAt: date, isPdfOutdated: true },
                    current.items.filter((item) => item.orderId === order.id),
                    nextPayments.filter((item) => item.orderId === order.id),
                  ),
                }
              : order,
          ),
        };
      });
    },
    [commit],
  );

  const updatePdfRecord = useCallback<AppDataContextValue['updatePdfRecord']>(
    async (pdf) => {
      await commit((current) => ({
        ...current,
        pdfs: [pdf, ...current.pdfs.filter((item) => item.id !== pdf.id)],
        orders: current.orders.map((order) => (order.id === pdf.orderId ? { ...order, isPdfOutdated: false, updatedAt: nowIso() } : order)),
      }));
    },
    [commit],
  );

  const exportBackup = useCallback(async () => {
    const json = JSON.stringify({ app: 'OrdemPro', backupVersion: 1, exportedAt: nowIso(), data }, null, 2);
    await commit((current) => ({ ...current, backup: { lastBackupAt: nowIso(), lastBackupJson: json } }));
    return json;
  }, [commit, data]);

  const importBackup = useCallback(
    async (json: string) => {
      const parsed = JSON.parse(json) as { app: string; backupVersion: number; data: AppData };
      if (parsed.app !== 'OrdemPro' || parsed.backupVersion !== 1) throw new Error('Backup invalido.');
      if (!parsed.data || typeof parsed.data !== 'object') throw new Error('Dados do backup ausentes.');
      await commit(() => normalizeAppData(parsed.data, 'empty'));
    },
    [commit],
  );

  const saveSecuritySettings = useCallback<AppDataContextValue['saveSecuritySettings']>(
    async (settings) => {
      await commit((current) => ({ ...current, security: { ...settings, updatedAt: nowIso() } }));
    },
    [commit],
  );

  const resetDemo = useCallback(async () => {
    dataRef.current = initialData;
    setData(initialData);
    await replaceAppData(initialData);
  }, []);

  const clearAllData = useCallback(async () => {
    const emptyData = createEmptyAppData();
    await replaceAppData(emptyData);
    await clearStoredMedia();
    dataRef.current = emptyData;
    setData(emptyData);
  }, []);

  const value = useMemo(
    () => ({
      data,
      loading,
      loadError,
      saveCompany,
      saveTerms,
      savePdfSettings,
      addCustomer,
      addEquipment,
      addCatalogService,
      saveCatalogService,
      removeCatalogService,
      addCatalogPart,
      saveCatalogPart,
      removeCatalogPart,
      saveTechnician,
      removeTechnician,
      createOrder,
      updateOrder,
      replaceOrderItems,
      updateOrderStatus,
      addOrderPhoto,
      updateOrderPhoto,
      removeOrderPhoto,
      addSignature,
      addPayment,
      removePayment,
      updatePdfRecord,
      exportBackup,
      importBackup,
      saveSecuritySettings,
      resetDemo,
      clearAllData,
    }),
    [addCatalogPart, addCatalogService, addCustomer, addEquipment, addOrderPhoto, addPayment, addSignature, clearAllData, createOrder, data, exportBackup, importBackup, loadError, loading, removeCatalogPart, removeCatalogService, removeOrderPhoto, removePayment, removeTechnician, replaceOrderItems, resetDemo, saveCatalogPart, saveCatalogService, saveCompany, savePdfSettings, saveSecuritySettings, saveTechnician, saveTerms, updateOrder, updateOrderPhoto, updateOrderStatus, updatePdfRecord],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used inside AppDataProvider');
  return context;
}
