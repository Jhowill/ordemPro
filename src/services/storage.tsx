import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { initialData } from '@/data/seed';
import { loadAppData, replaceAppData } from '@/database/appDatabase';
import { AppData, CatalogPart, CatalogService, CompanyProfile, Customer, DefaultTerms, Equipment, PdfSettings, PhotoAttachment, ServiceOrder, ServiceOrderItem, ServiceOrderPdf, ServiceOrderStatusHistory } from '@/types';
import { calculateOrderTotals } from '@/services/calculations';
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
  addCatalogPart: (input: Pick<CatalogPart, 'name' | 'category' | 'salePriceCents'>) => Promise<void>;
  createOrder: (input: {
    customerId: string;
    equipmentId?: string | null;
    isServiceWithoutEquipment: boolean;
    reportedIssue: string;
    diagnosis?: string;
    items: Pick<ServiceOrderItem, 'type' | 'description' | 'quantity' | 'unitPriceCents' | 'discountCents'>[];
  }) => Promise<ServiceOrder>;
  updateOrderStatus: (id: string, status: ServiceOrder['status']) => Promise<void>;
  addOrderPhoto: (orderId: string, input: Pick<PhotoAttachment, 'localUri' | 'caption' | 'includeInPdf'>) => Promise<void>;
  updatePdfRecord: (pdf: ServiceOrderPdf) => Promise<void>;
  exportBackup: () => Promise<string>;
  importBackup: (json: string) => Promise<void>;
  resetDemo: () => Promise<void>;
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

  const addCatalogService = useCallback<AppDataContextValue['addCatalogService']>(
    async (input) => {
      const service: CatalogService = { ...withEntityDates(input), defaultWarrantyDays: 30, status: 'active' };
      await commit((current) => ({ ...current, services: [service, ...current.services] }));
    },
    [commit],
  );

  const addCatalogPart = useCallback<AppDataContextValue['addCatalogPart']>(
    async (input) => {
      const part: CatalogPart = { ...withEntityDates(input), unit: 'unit', status: 'active' };
      await commit((current) => ({ ...current, parts: [part, ...current.parts] }));
    },
    [commit],
  );

  const createOrder = useCallback<AppDataContextValue['createOrder']>(
    async (input) => {
      const number = data.lastOrderNumber + 1;
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
        isServiceWithoutEquipment: input.isServiceWithoutEquipment,
        openedAt: date,
        status: 'open',
        priority: 'normal',
        reportedIssue: input.reportedIssue,
        diagnosis: input.diagnosis,
        laborTotalCents: totals.laborTotalCents,
        partsTotalCents: totals.partsTotalCents,
        otherCostsCents: totals.otherCostsCents,
        discountCents: totals.discountCents,
        subtotalCents: totals.subtotalCents,
        totalCents: totals.totalCents,
        paidCents: totals.paidCents,
        pendingCents: totals.pendingCents,
        warrantyDays: 90,
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
    [commit, data.lastOrderNumber],
  );

  const updateOrderStatus = useCallback<AppDataContextValue['updateOrderStatus']>(
    async (id, status) => {
      await commit((current) => ({
        ...current,
        orders: current.orders.map((order) => (order.id === id ? { ...order, status, updatedAt: nowIso(), isPdfOutdated: true } : order)),
        statusHistory: [
          ...current.orders
            .filter((order) => order.id === id)
            .map<ServiceOrderStatusHistory>((order) => {
              const date = nowIso();
              return {
                id: makeId('status_history'),
                orderId: order.id,
                fromStatus: order.status,
                toStatus: status,
                changedAt: date,
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
      await commit(() => ({ ...parsed.data, statusHistory: parsed.data.statusHistory ?? [] }));
    },
    [commit],
  );

  const resetDemo = useCallback(async () => {
    dataRef.current = initialData;
    setData(initialData);
    await replaceAppData(initialData);
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
      addCatalogPart,
      createOrder,
      updateOrderStatus,
      addOrderPhoto,
      updatePdfRecord,
      exportBackup,
      importBackup,
      resetDemo,
    }),
    [addCatalogPart, addCatalogService, addCustomer, addEquipment, addOrderPhoto, createOrder, data, exportBackup, importBackup, loadError, loading, resetDemo, saveCompany, savePdfSettings, saveTerms, updateOrderStatus, updatePdfRecord],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used inside AppDataProvider');
  return context;
}
