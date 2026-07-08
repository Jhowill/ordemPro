import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { InputField } from '@/components/ui/InputField';
import { PaginatedList } from '@/components/ui/PaginatedList';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { SignaturePad } from '@/components/ui/SignaturePad';
import { spacing } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useThemeColors } from '@/hooks/useThemeColors';
import { deleteLocalFile, pickAndStoreImage } from '@/services/media';
import { useAppData } from '@/services/storage';
import { CatalogPart, CatalogService, OrderItemType } from '@/types';
import { formatCpfCnpjInput, formatMoney, formatMoneyInput, formatPhoneInput, makeId, moneyFromText } from '@/utils/formatters';

type DraftItem = { id: string; type: OrderItemType; description: string; quantity: number | null; unitPriceCents: number; discountCents: number };
type DraftPhoto = { id: string; localUri: string; caption: string; includeInPdf: boolean };

export default function NewOrderScreen() {
  const { data, addCustomer, createOrder, addEquipment, addOrderPhoto, addSignature } = useAppData();
  const colors = useThemeColors();
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [customerId, setCustomerId] = useState(data.customers[0]?.id ?? '');
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', whatsapp: '', email: '', document: '', city: '', state: '' });
  const [equipmentId, setEquipmentId] = useState<string | null>(data.equipments[0]?.id ?? null);
  const [showNewEquipment, setShowNewEquipment] = useState(false);
  const [equipmentForm, setEquipmentForm] = useState({ type: 'Equipamento', brand: '', model: '', serialNumber: '', description: '' });
  const [technicianId, setTechnicianId] = useState(data.technicians.find((item) => item.isDefault)?.id ?? data.technicians[0]?.id ?? '');
  const [withoutEquipment, setWithoutEquipment] = useState(false);
  const [reportedIssue, setReportedIssue] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [performedService, setPerformedService] = useState('');
  const [item, setItem] = useState({ description: '', price: '' });
  const [items, setItems] = useState<DraftItem[]>([]);
  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [customerSignatureUri, setCustomerSignatureUri] = useState('');
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [saving, setSaving] = useState(false);

  function addItem(type: OrderItemType) {
    if (!item.description.trim()) return;
    setItems((current) => [...current, { id: makeId('draft_item'), type, description: item.description, quantity: 1, unitPriceCents: moneyFromText(item.price), discountCents: 0 }]);
    setItem({ description: '', price: '' });
  }

  function addCatalogService(service: CatalogService) {
    setItems((current) => [...current, { id: makeId('draft_service'), type: 'service', description: service.name, quantity: 1, unitPriceCents: service.defaultPriceCents, discountCents: 0 }]);
  }

  function addCatalogPart(part: CatalogPart) {
    setItems((current) => [...current, { id: makeId('draft_part'), type: 'part', description: part.name, quantity: 1, unitPriceCents: part.salePriceCents, discountCents: 0 }]);
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((draft) => draft.id !== id));
  }

  async function removeDraftPhoto(photoId: string) {
    const photo = photos.find((item) => item.id === photoId);
    setPhotos((current) => current.filter((item) => item.id !== photoId));
    await deleteLocalFile(photo?.localUri);
  }

  function updateItem(id: string, input: Partial<Pick<DraftItem, 'quantity' | 'unitPriceCents' | 'discountCents'>>) {
    setItems((current) => current.map((draft) => (draft.id === id ? { ...draft, ...input } : draft)));
  }

  function updateItemQuantity(id: string, value: string) {
    const digits = value.replace(/\D/g, '');
    updateItem(id, { quantity: digits ? Math.max(1, Number(digits)) : null });
  }

  async function createCustomerInOrder() {
    if (!customerForm.name.trim()) {
      Alert.alert(t('orderNew.alerts.customerNameMissing'));
      return;
    }
    try {
      const customer = await addCustomer({
        kind: 'person',
        name: customerForm.name,
        phone: customerForm.phone,
        whatsapp: customerForm.whatsapp,
        email: customerForm.email,
        document: customerForm.document,
        city: customerForm.city,
        state: customerForm.state,
      });
      setCustomerId(customer.id);
      setEquipmentId(null);
      setWithoutEquipment(false);
      setShowNewCustomer(false);
      setCustomerForm({ name: '', phone: '', whatsapp: '', email: '', document: '', city: '', state: '' });
    } catch (error) {
      Alert.alert(t('orderNew.alerts.saveFail'), error instanceof Error ? error.message : t('common.retry'));
    }
  }

  async function addDraftPhoto(source: 'library' | 'camera') {
    try {
      const image = await pickAndStoreImage('orders', source);
      if (!image) return;
      setPhotos((current) => [...current, { id: makeId('draft_photo'), localUri: image.localUri, caption: t('orderDetail.photos'), includeInPdf: true }]);
    } catch (error) {
      Alert.alert(t('orderDetail.photoAddFail'), error instanceof Error ? error.message : t('common.retry'));
    }
  }

  async function createEquipmentInOrder() {
    if (!customerId) {
      Alert.alert(t('orderNew.alerts.customerMissing'));
      setStep(0);
      return;
    }
    if (!equipmentForm.type.trim() && !equipmentForm.description.trim()) {
      Alert.alert(t('orderNew.alerts.equipmentTypeMissing'));
      return;
    }
    try {
      const equipment = await addEquipment({
        customerId,
        category: 'other',
        type: equipmentForm.type,
        brand: equipmentForm.brand,
        model: equipmentForm.model,
        serialNumber: equipmentForm.serialNumber,
        description: equipmentForm.description,
      });
      setEquipmentId(equipment.id);
      setWithoutEquipment(false);
      setShowNewEquipment(false);
      setEquipmentForm({ type: 'Equipamento', brand: '', model: '', serialNumber: '', description: '' });
    } catch (error) {
      Alert.alert(t('orderNew.alerts.saveFail'), error instanceof Error ? error.message : t('common.retry'));
    }
  }

  async function save() {
    if (saving) return;
    if (!customerId) {
      Alert.alert(t('orderNew.alerts.customerMissing'));
      setStep(0);
      return;
    }
    if (!withoutEquipment && !equipmentId) {
      Alert.alert(t('orderNew.alerts.equipmentMissing'));
      setStep(1);
      return;
    }
    if (!reportedIssue.trim()) {
      Alert.alert(t('orderNew.alerts.issueMissing'));
      setStep(2);
      return;
    }
    try {
      setSaving(true);
      const order = await createOrder({
        customerId,
        equipmentId,
        technicianId,
        isServiceWithoutEquipment: withoutEquipment,
        reportedIssue,
        diagnosis,
        performedService,
        items: items.map((draft) => ({ ...draft, quantity: draft.quantity ?? 1 })),
      });
      for (const photo of photos) {
        await addOrderPhoto(order.id, { localUri: photo.localUri, caption: photo.caption, includeInPdf: photo.includeInPdf });
      }
      if (customerSignatureUri) {
        const customer = data.customers.find((item) => item.id === customerId);
        await addSignature(order.id, {
          kind: 'customer',
          localUri: customerSignatureUri,
          signerName: customer?.name ?? (customerForm.name || t('common.customer')),
          signerDocument: customer?.document || customerForm.document,
        });
      }
      router.replace(`/orders/${order.id}`);
    } catch (error) {
      Alert.alert(t('orderNew.alerts.saveFail'), error instanceof Error ? error.message : t('common.retry'));
    } finally {
      setSaving(false);
    }
  }

  const total = items.reduce((sum, draft) => sum + Math.max(0, (draft.quantity ?? 0) * draft.unitPriceCents - draft.discountCents), 0);

  return (
    <ScreenContainer
      scrollEnabled={!isSigning}
      footer={
        <View style={styles.footer}>
          {step > 0 ? <AppButton title={t('orderNew.previous')} variant="secondary" onPress={() => setStep((value) => value - 1)} /> : null}
          <AppButton title={step === 4 ? t('orderNew.save') : t('orderNew.next')} loading={saving} onPress={() => (step === 4 ? save() : setStep((value) => value + 1))} />
        </View>
      }
    >
      <AppHeader title={t('orderNew.title')} subtitle={t('orderNew.subtitle', { current: step + 1, total: 5 })} back />
      {step === 0 ? (
        <>
          <SectionTitle title={t('orderNew.customerStepTitle')} description={t('orderNew.customerStepDesc')} />
          <PaginatedList
            items={data.customers}
            keyExtractor={(customer) => customer.id}
            empty={<AppText muted>{t('customers.emptyTitle')}</AppText>}
            renderItem={(customer) => (
              <Pressable key={customer.id} onPress={() => {
                setCustomerId(customer.id);
                setEquipmentId(null);
                setWithoutEquipment(false);
              }}>
                <AppCard>
                  <AppText variant="subtitle" color={customerId === customer.id ? colors.primary : undefined}>{customer.name}</AppText>
                  <AppText muted>{customer.phone || customer.whatsapp}</AppText>
                </AppCard>
              </Pressable>
            )}
          />
          <AppButton title={showNewCustomer ? t('orderNew.closeCustomer') : t('orderNew.addCustomer')} variant="secondary" onPress={() => setShowNewCustomer((value) => !value)} />
          {showNewCustomer ? (
            <AppCard>
              <SectionTitle title={t('orderNew.newCustomerTitle')} description={t('orderNew.newCustomerDesc')} />
              <InputField label={t('company.fields.name')} value={customerForm.name} onChangeText={(value) => setCustomerForm((current) => ({ ...current, name: value }))} />
              <InputField label={t('company.fields.phone')} value={customerForm.phone} onChangeText={(value) => setCustomerForm((current) => ({ ...current, phone: formatPhoneInput(value) }))} keyboardType="phone-pad" />
              <InputField label={t('company.fields.whatsapp')} value={customerForm.whatsapp} onChangeText={(value) => setCustomerForm((current) => ({ ...current, whatsapp: formatPhoneInput(value) }))} keyboardType="phone-pad" />
              <InputField label={t('company.fields.document')} value={customerForm.document} onChangeText={(value) => setCustomerForm((current) => ({ ...current, document: formatCpfCnpjInput(value) }))} keyboardType="numeric" />
              <InputField label={t('company.fields.email')} value={customerForm.email} onChangeText={(value) => setCustomerForm((current) => ({ ...current, email: value }))} keyboardType="email-address" autoCapitalize="none" />
              <View style={styles.footer}>
                <InputField label={t('company.fields.city')} value={customerForm.city} onChangeText={(value) => setCustomerForm((current) => ({ ...current, city: value }))} style={styles.compactInput} />
                <InputField label={t('company.fields.state')} value={customerForm.state} onChangeText={(value) => setCustomerForm((current) => ({ ...current, state: value }))} style={styles.compactInput} autoCapitalize="characters" />
              </View>
              <AppButton title={t('orderNew.saveCustomer')} onPress={createCustomerInOrder} />
            </AppCard>
          ) : null}
        </>
      ) : null}

      {step === 1 ? (
        <>
          <SectionTitle title={t('orderNew.equipmentStepTitle')} description={t('orderNew.equipmentStepDesc')} />
          <Pressable onPress={() => setWithoutEquipment((value) => !value)}>
            <AppCard>
              <AppText variant="subtitle" color={withoutEquipment ? colors.primary : undefined}>{t('orderNew.noEquipment')}</AppText>
            </AppCard>
          </Pressable>
          <AppButton title={showNewEquipment ? t('orderNew.closeEquipment') : t('orderNew.addEquipment')} variant="secondary" onPress={() => {
            setShowNewEquipment((value) => !value);
            setWithoutEquipment(false);
          }} />
          {showNewEquipment ? (
            <AppCard>
              <SectionTitle title={t('orderNew.newEquipmentTitle')} description={t('orderNew.newEquipmentDesc')} />
              <InputField label={t('common.equipment')} value={equipmentForm.type} onChangeText={(value) => setEquipmentForm((current) => ({ ...current, type: value }))} />
              <InputField label={t('common.brand')} value={equipmentForm.brand} onChangeText={(value) => setEquipmentForm((current) => ({ ...current, brand: value }))} />
              <InputField label={t('details.model')} value={equipmentForm.model} onChangeText={(value) => setEquipmentForm((current) => ({ ...current, model: value }))} />
              <InputField label={t('details.serial')} value={equipmentForm.serialNumber} onChangeText={(value) => setEquipmentForm((current) => ({ ...current, serialNumber: value }))} />
              <InputField label={t('company.fields.addressLine')} value={equipmentForm.description} onChangeText={(value) => setEquipmentForm((current) => ({ ...current, description: value }))} multiline style={styles.textArea} />
              <AppButton title={t('orderNew.saveEquipment')} onPress={createEquipmentInOrder} />
            </AppCard>
          ) : null}
          {!withoutEquipment ? (
            <PaginatedList
              items={data.equipments.filter((equipment) => equipment.customerId === customerId)}
              keyExtractor={(equipment) => equipment.id}
              empty={<AppText muted>{t('equipments.emptyTitle')}</AppText>}
              renderItem={(equipment) => (
                <Pressable key={equipment.id} onPress={() => setEquipmentId(equipment.id)}>
                  <AppCard>
                    <AppText variant="subtitle" color={equipmentId === equipment.id ? colors.primary : undefined}>{equipment.type ?? equipment.category} {equipment.brand ?? ''} {equipment.model ?? ''}</AppText>
                    <AppText muted>{equipment.serialNumber ?? t('equipments.noSerial')}</AppText>
                  </AppCard>
                </Pressable>
              )}
            />
          ) : null}
        </>
      ) : null}

      {step === 2 ? (
        <>
          <SectionTitle title={t('orderNew.issueStepTitle')} description={t('orderNew.issueStepDesc')} />
          <SectionTitle title={t('orderNew.technicianStepTitle')} />
          <PaginatedList
            items={data.technicians}
            keyExtractor={(technician) => technician.id}
            renderItem={(technician) => (
              <Pressable key={technician.id} onPress={() => setTechnicianId(technician.id)}>
                <AppCard>
                  <AppText variant="subtitle" color={technicianId === technician.id ? colors.primary : undefined}>{technician.name}</AppText>
                  <AppText muted>{technician.signatureUri ? t('orderEdit.technicianReady') : t('orderEdit.technicianMissing')}</AppText>
                </AppCard>
              </Pressable>
            )}
          />
          {!data.technicians.length ? <AppButton title={t('technician.new')} variant="secondary" onPress={() => router.push('/settings/technician')} /> : null}
          <InputField label={t('orderEdit.reportedIssue')} value={reportedIssue} onChangeText={setReportedIssue} multiline style={styles.textArea} />
          <InputField label={t('orderEdit.diagnosis')} value={diagnosis} onChangeText={setDiagnosis} multiline style={styles.textArea} />
          <InputField label={t('orderEdit.performedService')} value={performedService} onChangeText={setPerformedService} multiline style={styles.textArea} />
        </>
      ) : null}

      {step === 3 ? (
        <>
          <SectionTitle title={t('orderNew.partsStepTitle')} description={t('orderNew.partsStepDesc')} />
          <SectionTitle title={t('orderNew.serviceCatalog')} />
          <PaginatedList
            items={data.services}
            keyExtractor={(service) => service.id}
            empty={<AppText muted>{t('catalog.servicesEmpty')}</AppText>}
            renderItem={(service) => (
              <AppCard key={service.id}>
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <AppText variant="subtitle">{service.name}</AppText>
                    <AppText muted>{service.category ?? t('catalog.category')} - {formatMoney(service.defaultPriceCents)}</AppText>
                  </View>
                  <AppButton title={t('common.add')} variant="secondary" compact onPress={() => addCatalogService(service)} />
                </View>
              </AppCard>
            )}
          />

          <SectionTitle title={t('orderNew.partCatalog')} />
          <PaginatedList
            items={data.parts}
            keyExtractor={(part) => part.id}
            empty={<AppText muted>{t('catalog.partsEmpty')}</AppText>}
            renderItem={(part) => (
              <AppCard key={part.id}>
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <AppText variant="subtitle">{part.name}</AppText>
                    <AppText muted>{part.category ?? t('catalog.category')} - {formatMoney(part.salePriceCents)}</AppText>
                  </View>
                  <AppButton title={t('common.add')} variant="secondary" compact onPress={() => addCatalogPart(part)} />
                </View>
              </AppCard>
            )}
          />

          <SectionTitle title={t('orderNew.manualItem')} />
          <InputField label={t('orderNew.manualDesc')} value={item.description} onChangeText={(value) => setItem((current) => ({ ...current, description: value }))} />
          <InputField label={t('orderNew.value')} value={item.price} onChangeText={(value) => setItem((current) => ({ ...current, price: formatMoneyInput(value) }))} keyboardType="numeric" placeholder="R$ 0,00" />
          <View style={styles.footer}>
            <AppButton title={t('orderNew.service')} variant="secondary" onPress={() => addItem('service')} />
            <AppButton title={t('orderNew.part')} variant="secondary" onPress={() => addItem('part')} />
          </View>
          <SectionTitle title={t('orderNew.itemsTitle')} description={t('orderNew.itemsDesc', { count: items.length, plural: items.length === 1 ? '' : 's' })} />
          {items.length ? items.map((draft) => (
            <AppCard key={draft.id}>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <AppText variant="subtitle">{draft.description}</AppText>
                  <AppText muted>{draft.type === 'service' ? t('orderNew.service') : t('orderNew.part')} - {formatMoney(Math.max(0, (draft.quantity ?? 0) * draft.unitPriceCents - draft.discountCents))}</AppText>
                  <View style={styles.compactFields}>
                    <InputField label={t('orderEdit.quantity')} value={draft.quantity === null ? '' : String(draft.quantity)} onChangeText={(value) => updateItemQuantity(draft.id, value)} keyboardType="numeric" style={styles.compactInput} />
                    <InputField label={t('common.unitValue')} value={formatMoney(draft.unitPriceCents)} onChangeText={(value) => updateItem(draft.id, { unitPriceCents: moneyFromText(value) })} keyboardType="numeric" style={styles.compactInput} />
                    <InputField label={t('orderEdit.discount')} value={formatMoney(draft.discountCents)} onChangeText={(value) => updateItem(draft.id, { discountCents: moneyFromText(value) })} keyboardType="numeric" style={styles.compactInput} />
                  </View>
                </View>
                <AppButton title={t('orderEdit.remove')} variant="danger" compact onPress={() => removeItem(draft.id)} />
              </View>
            </AppCard>
          )) : <AppText muted>{t('orderDetail.noItems')}</AppText>}
        </>
      ) : null}

      {step === 4 ? (
        <>
          <SectionTitle title={t('orderNew.summaryTitle')} />
          <AppCard>
            <AppText variant="subtitle">{t('orderNew.request')}</AppText>
            <AppText>{reportedIssue}</AppText>
            <AppText muted>{withoutEquipment ? t('orderNew.withoutEquipment') : t('orderNew.withEquipment')}</AppText>
            <AppText muted>{t('common.technician')}: {data.technicians.find((item) => item.id === technicianId)?.name ?? t('common.none')}</AppText>
          </AppCard>
          <AppCard>
            <AppText variant="subtitle">{t('orderNew.values')}</AppText>
            <AppText variant="money">{formatMoney(total)}</AppText>
            <AppText muted>{t('orderNew.itemsDesc', { count: items.length, plural: items.length === 1 ? '' : 's' })}</AppText>
          </AppCard>
          <AppCard>
            <SectionTitle title={t('orderNew.photosTitle')} description={t('orderNew.photosDesc', { count: photos.length, plural: photos.length === 1 ? '' : 's' })} />
            <View style={styles.footer}>
              <AppButton title={t('orderDetail.gallery')} variant="secondary" compact onPress={() => addDraftPhoto('library')} />
              <AppButton title={t('orderDetail.camera')} variant="secondary" compact onPress={() => addDraftPhoto('camera')} />
            </View>
            {photos.length ? (
              <View style={styles.photoGrid}>
                {photos.map((photo) => (
                  <View key={photo.id} style={styles.photoItem}>
                    <Image source={{ uri: photo.localUri }} style={[styles.photo, { backgroundColor: colors.surfaceAlt }]} />
                    <AppButton title={t('common.remove')} variant="danger" compact onPress={() => removeDraftPhoto(photo.id)} />
                  </View>
                ))}
              </View>
            ) : <AppText muted>{t('orderDetail.noPhotos')}</AppText>}
          </AppCard>
          <AppCard>
            <SectionTitle title={t('orderNew.signatureTitle')} description={t('orderNew.signatureDesc')} />
            {showSignaturePad ? (
              <SignaturePad
                title={t('orderNew.signatureTitle')}
                onSigningChange={setIsSigning}
                onSave={(uri) => {
                  setCustomerSignatureUri(uri);
                  setShowSignaturePad(false);
                  setIsSigning(false);
                }}
                onCancel={() => {
                  setShowSignaturePad(false);
                  setIsSigning(false);
                }}
              />
            ) : (
              <>
                <AppText muted>{customerSignatureUri ? t('orderNew.signatureSaved') : t('orderNew.signatureNone')}</AppText>
                <AppButton title={customerSignatureUri ? t('orderNew.signAgain') : t('orderNew.signOnScreen')} variant="secondary" onPress={() => setShowSignaturePad(true)} />
              </>
            )}
          </AppCard>
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', gap: spacing.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itemInfo: { flex: 1, gap: spacing.xxs },
  compactFields: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  compactInput: { minHeight: 42, paddingHorizontal: spacing.xs },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  photoItem: { width: '47%', gap: spacing.xs },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 8 },
  textArea: { minHeight: 96, textAlignVertical: 'top' },
});
