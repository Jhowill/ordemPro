import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { InputField } from '@/components/ui/InputField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { SignaturePad } from '@/components/ui/SignaturePad';
import { spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { pickAndStoreImage } from '@/services/media';
import { useAppData } from '@/services/storage';
import { CatalogPart, CatalogService, OrderItemType } from '@/types';
import { formatMoney, formatMoneyInput, makeId, moneyFromText } from '@/utils/formatters';

type DraftItem = { id: string; type: OrderItemType; description: string; quantity: number; unitPriceCents: number; discountCents: number };
type DraftPhoto = { id: string; localUri: string; caption: string; includeInPdf: boolean };

export default function NewOrderScreen() {
  const { data, addCustomer, createOrder, addEquipment, addOrderPhoto, addSignature } = useAppData();
  const colors = useThemeColors();
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

  function addItem(type: OrderItemType) {
    if (!item.description.trim()) return;
    setItems((current) => [...current, { id: makeId('draft_item'), type, description: item.description, quantity: 1, unitPriceCents: moneyFromText(item.price), discountCents: 0 }]);
    setItem({ description: '', price: '' });
  }

  function addCatalogService(service: CatalogService) {
    setItems((current) => [
      ...current,
      {
        id: makeId('draft_service'),
        type: 'service',
        description: service.name,
        quantity: 1,
        unitPriceCents: service.defaultPriceCents,
        discountCents: 0,
      },
    ]);
  }

  function addCatalogPart(part: CatalogPart) {
    setItems((current) => [
      ...current,
      {
        id: makeId('draft_part'),
        type: 'part',
        description: part.name,
        quantity: 1,
        unitPriceCents: part.salePriceCents,
        discountCents: 0,
      },
    ]);
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((draft) => draft.id !== id));
  }

  function updateItem(id: string, input: Partial<Pick<DraftItem, 'quantity' | 'unitPriceCents' | 'discountCents'>>) {
    setItems((current) =>
      current.map((draft) => (
        draft.id === id
          ? {
              ...draft,
              ...input,
            }
          : draft
      )),
    );
  }

  async function createCustomerInOrder() {
    if (!customerForm.name.trim()) {
      Alert.alert('Informe o nome do cliente.');
      return;
    }
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
  }

  async function addDraftPhoto(source: 'library' | 'camera') {
    try {
      const image = await pickAndStoreImage('orders', source);
      if (!image) return;
      setPhotos((current) => [...current, { id: makeId('draft_photo'), localUri: image.localUri, caption: 'Foto da OS', includeInPdf: true }]);
    } catch (error) {
      Alert.alert('Foto nao adicionada', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  async function createEquipmentInOrder() {
    if (!customerId) {
      Alert.alert('Selecione um cliente antes de adicionar equipamento.');
      setStep(0);
      return;
    }
    if (!equipmentForm.type.trim() && !equipmentForm.description.trim()) {
      Alert.alert('Informe o tipo ou descricao do equipamento.');
      return;
    }
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
  }

  async function save() {
    if (!customerId) {
      Alert.alert('Selecione um cliente.');
      setStep(0);
      return;
    }
    if (!withoutEquipment && !equipmentId) {
      Alert.alert('Selecione um equipamento ou marque servico sem equipamento.');
      setStep(1);
      return;
    }
    if (!reportedIssue.trim()) {
      Alert.alert('Informe o problema ou servico solicitado.');
      setStep(2);
      return;
    }
    const order = await createOrder({ customerId, equipmentId, technicianId, isServiceWithoutEquipment: withoutEquipment, reportedIssue, diagnosis, performedService, items });
    for (const photo of photos) {
      await addOrderPhoto(order.id, { localUri: photo.localUri, caption: photo.caption, includeInPdf: photo.includeInPdf });
    }
    if (customerSignatureUri) {
      const customer = data.customers.find((item) => item.id === customerId);
      await addSignature(order.id, {
        kind: 'customer',
        localUri: customerSignatureUri,
        signerName: customer?.name ?? (customerForm.name || 'Cliente'),
        signerDocument: customer?.document || customerForm.document,
      });
    }
    router.replace(`/orders/${order.id}`);
  }

  const total = items.reduce((sum, draft) => sum + draft.quantity * draft.unitPriceCents - draft.discountCents, 0);

  return (
    <ScreenContainer
      scrollEnabled={!isSigning}
      footer={
        <View style={styles.footer}>
          {step > 0 ? <AppButton title="Voltar" variant="secondary" onPress={() => setStep((value) => value - 1)} /> : null}
          <AppButton title={step === 4 ? 'Salvar OS' : 'Avancar'} onPress={() => (step === 4 ? save() : setStep((value) => value + 1))} />
        </View>
      }
    >
      <AppHeader title="Nova Ordem de Servico" subtitle={`Etapa ${step + 1} de 5`} back />
      {step === 0 ? (
        <>
          <SectionTitle title="Cliente" description="Selecione um cliente existente" />
          {data.customers.map((customer) => (
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
          ))}
          <AppButton title={showNewCustomer ? 'Fechar novo cliente' : 'Adicionar cliente'} variant="secondary" onPress={() => setShowNewCustomer((value) => !value)} />
          {showNewCustomer ? (
            <AppCard>
              <SectionTitle title="Novo cliente" description="Sera selecionado para esta OS" />
              <InputField label="Nome" value={customerForm.name} onChangeText={(value) => setCustomerForm((current) => ({ ...current, name: value }))} />
              <InputField label="Telefone" value={customerForm.phone} onChangeText={(value) => setCustomerForm((current) => ({ ...current, phone: value }))} keyboardType="phone-pad" />
              <InputField label="WhatsApp" value={customerForm.whatsapp} onChangeText={(value) => setCustomerForm((current) => ({ ...current, whatsapp: value }))} keyboardType="phone-pad" />
              <InputField label="Documento" value={customerForm.document} onChangeText={(value) => setCustomerForm((current) => ({ ...current, document: value }))} />
              <InputField label="E-mail" value={customerForm.email} onChangeText={(value) => setCustomerForm((current) => ({ ...current, email: value }))} keyboardType="email-address" autoCapitalize="none" />
              <View style={styles.footer}>
                <InputField label="Cidade" value={customerForm.city} onChangeText={(value) => setCustomerForm((current) => ({ ...current, city: value }))} style={styles.compactInput} />
                <InputField label="UF" value={customerForm.state} onChangeText={(value) => setCustomerForm((current) => ({ ...current, state: value }))} style={styles.compactInput} autoCapitalize="characters" />
              </View>
              <AppButton title="Salvar e selecionar" onPress={createCustomerInOrder} />
            </AppCard>
          ) : null}
        </>
      ) : null}

      {step === 1 ? (
        <>
          <SectionTitle title="Equipamento" description="Vincule ao cliente ou marque servico sem equipamento" />
          <Pressable onPress={() => setWithoutEquipment((value) => !value)}>
            <AppCard>
              <AppText variant="subtitle" color={withoutEquipment ? colors.primary : undefined}>Servico sem equipamento</AppText>
            </AppCard>
          </Pressable>
          <AppButton title={showNewEquipment ? 'Fechar novo equipamento' : 'Adicionar equipamento'} variant="secondary" onPress={() => {
            setShowNewEquipment((value) => !value);
            setWithoutEquipment(false);
          }} />
          {showNewEquipment ? (
            <AppCard>
              <SectionTitle title="Novo equipamento" description="Sera vinculado ao cliente selecionado" />
              <InputField label="Tipo" value={equipmentForm.type} onChangeText={(value) => setEquipmentForm((current) => ({ ...current, type: value }))} />
              <InputField label="Marca" value={equipmentForm.brand} onChangeText={(value) => setEquipmentForm((current) => ({ ...current, brand: value }))} />
              <InputField label="Modelo" value={equipmentForm.model} onChangeText={(value) => setEquipmentForm((current) => ({ ...current, model: value }))} />
              <InputField label="Numero de serie" value={equipmentForm.serialNumber} onChangeText={(value) => setEquipmentForm((current) => ({ ...current, serialNumber: value }))} />
              <InputField label="Descricao" value={equipmentForm.description} onChangeText={(value) => setEquipmentForm((current) => ({ ...current, description: value }))} multiline style={styles.textArea} />
              <AppButton title="Salvar e selecionar" onPress={createEquipmentInOrder} />
            </AppCard>
          ) : null}
          {!withoutEquipment ? data.equipments.filter((equipment) => equipment.customerId === customerId).map((equipment) => (
            <Pressable key={equipment.id} onPress={() => setEquipmentId(equipment.id)}>
              <AppCard>
                <AppText variant="subtitle" color={equipmentId === equipment.id ? colors.primary : undefined}>{equipment.type ?? equipment.category} {equipment.brand ?? ''} {equipment.model ?? ''}</AppText>
                <AppText muted>{equipment.serialNumber ?? 'Sem serie'}</AppText>
              </AppCard>
            </Pressable>
          )) : null}
        </>
      ) : null}

      {step === 2 ? (
        <>
          <SectionTitle title="Problema" description="Descreva o motivo da abertura" />
          <SectionTitle title="Tecnico responsavel" />
          {data.technicians.map((technician) => (
            <Pressable key={technician.id} onPress={() => setTechnicianId(technician.id)}>
              <AppCard>
                <AppText variant="subtitle" color={technicianId === technician.id ? colors.primary : undefined}>{technician.name}</AppText>
                <AppText muted>{technician.signatureUri ? 'Assinatura salva para PDF' : 'Sem assinatura cadastrada'}</AppText>
              </AppCard>
            </Pressable>
          ))}
          {!data.technicians.length ? <AppButton title="Cadastrar tecnico" variant="secondary" onPress={() => router.push('/settings/technician')} /> : null}
          <InputField label="Defeito relatado ou servico solicitado" value={reportedIssue} onChangeText={setReportedIssue} multiline style={styles.textArea} />
          <InputField label="Diagnostico tecnico" value={diagnosis} onChangeText={setDiagnosis} multiline style={styles.textArea} />
          <InputField label="Servico executado" value={performedService} onChangeText={setPerformedService} multiline style={styles.textArea} />
        </>
      ) : null}

      {step === 3 ? (
        <>
          <SectionTitle title="Pecas e servicos" description="Adicione itens cobrados ou descritivos" />
          <SectionTitle title="Catalogo de servicos" />
          {data.services.length ? data.services.map((service) => (
            <AppCard key={service.id}>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <AppText variant="subtitle">{service.name}</AppText>
                  <AppText muted>{service.category ?? 'Servico'} - {formatMoney(service.defaultPriceCents)}</AppText>
                </View>
                <AppButton title="Adicionar" variant="secondary" compact onPress={() => addCatalogService(service)} />
              </View>
            </AppCard>
          )) : <AppText muted>Nenhum servico cadastrado no catalogo.</AppText>}

          <SectionTitle title="Catalogo de pecas" />
          {data.parts.length ? data.parts.map((part) => (
            <AppCard key={part.id}>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <AppText variant="subtitle">{part.name}</AppText>
                  <AppText muted>{part.category ?? 'Peca'} - {formatMoney(part.salePriceCents)}</AppText>
                </View>
                <AppButton title="Adicionar" variant="secondary" compact onPress={() => addCatalogPart(part)} />
              </View>
            </AppCard>
          )) : <AppText muted>Nenhuma peca cadastrada no catalogo.</AppText>}

          <SectionTitle title="Item manual" />
          <InputField label="Descricao do item" value={item.description} onChangeText={(value) => setItem((current) => ({ ...current, description: value }))} />
          <InputField label="Valor" value={item.price} onChangeText={(value) => setItem((current) => ({ ...current, price: formatMoneyInput(value) }))} keyboardType="numeric" placeholder="R$ 0,00" />
          <View style={styles.footer}>
            <AppButton title="Servico" variant="secondary" onPress={() => addItem('service')} />
            <AppButton title="Peca" variant="secondary" onPress={() => addItem('part')} />
          </View>
          <SectionTitle title="Itens da OS" description={`${items.length} item${items.length === 1 ? '' : 's'} selecionado${items.length === 1 ? '' : 's'}`} />
          {items.length ? items.map((draft) => (
            <AppCard key={draft.id}>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <AppText variant="subtitle">{draft.description}</AppText>
                  <AppText muted>{draft.type === 'service' ? 'Servico' : 'Peca'} - Total {formatMoney(Math.max(0, draft.quantity * draft.unitPriceCents - draft.discountCents))}</AppText>
                  <View style={styles.compactFields}>
                    <InputField label="Qtd" value={String(draft.quantity)} onChangeText={(value) => updateItem(draft.id, { quantity: Math.max(1, Number(value.replace(/\D/g, '') || 1)) })} keyboardType="numeric" style={styles.compactInput} />
                    <InputField label="Valor" value={formatMoney(draft.unitPriceCents)} onChangeText={(value) => updateItem(draft.id, { unitPriceCents: moneyFromText(value) })} keyboardType="numeric" style={styles.compactInput} />
                    <InputField label="Desc." value={formatMoney(draft.discountCents)} onChangeText={(value) => updateItem(draft.id, { discountCents: moneyFromText(value) })} keyboardType="numeric" style={styles.compactInput} />
                  </View>
                </View>
                <AppButton title="Retirar" variant="danger" compact onPress={() => removeItem(draft.id)} />
              </View>
            </AppCard>
          )) : <AppText muted>Nenhum item selecionado ainda.</AppText>}
        </>
      ) : null}

      {step === 4 ? (
        <>
          <SectionTitle title="Resumo da OS" />
          <AppCard>
            <AppText variant="subtitle">Solicitacao</AppText>
            <AppText>{reportedIssue}</AppText>
            <AppText muted>{withoutEquipment ? 'Servico sem equipamento' : 'Com equipamento vinculado'}</AppText>
            <AppText muted>Tecnico: {data.technicians.find((item) => item.id === technicianId)?.name ?? 'Nao selecionado'}</AppText>
          </AppCard>
          <AppCard>
            <AppText variant="subtitle">Valores</AppText>
            <AppText variant="money">{formatMoney(total)}</AppText>
            <AppText muted>{items.length} itens adicionados</AppText>
          </AppCard>
          <AppCard>
            <SectionTitle title="Fotos" description={`${photos.length} foto${photos.length === 1 ? '' : 's'} antes de salvar`} />
            <View style={styles.footer}>
              <AppButton title="Galeria" variant="secondary" compact onPress={() => addDraftPhoto('library')} />
              <AppButton title="Camera" variant="secondary" compact onPress={() => addDraftPhoto('camera')} />
            </View>
            {photos.length ? (
              <View style={styles.photoGrid}>
                {photos.map((photo) => (
                  <View key={photo.id} style={styles.photoItem}>
                    <Image source={{ uri: photo.localUri }} style={styles.photo} />
                    <AppButton title="Retirar" variant="danger" compact onPress={() => setPhotos((current) => current.filter((item) => item.id !== photo.id))} />
                  </View>
                ))}
              </View>
            ) : <AppText muted>Nenhuma foto adicionada.</AppText>}
          </AppCard>
          <AppCard>
            <SectionTitle title="Assinatura do cliente" description="Opcional antes de salvar a OS" />
            {showSignaturePad ? (
              <SignaturePad
                title="Assinatura do cliente"
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
                <AppText muted>{customerSignatureUri ? 'Assinatura salva para esta OS.' : 'Cliente ainda nao assinou.'}</AppText>
                <AppButton title={customerSignatureUri ? 'Refazer assinatura' : 'Assinar na tela'} variant="secondary" onPress={() => setShowSignaturePad(true)} />
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
  photo: { width: '100%', aspectRatio: 1, borderRadius: 8, backgroundColor: '#E5E7EB' },
  textArea: { minHeight: 96, textAlignVertical: 'top' },
});
