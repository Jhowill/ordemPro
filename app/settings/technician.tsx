import { Ionicons } from '@expo/vector-icons';
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
import { useThemeColors } from '@/hooks/useThemeColors';
import { pickAndStoreImage } from '@/services/media';
import { useAppData } from '@/services/storage';
import { TechnicianProfile } from '@/types';
import { formatCpfCnpjInput, formatPhoneInput } from '@/utils/formatters';

export default function TechnicianSettingsScreen() {
  const colors = useThemeColors();
  const { data, saveTechnician, removeTechnician } = useAppData();
  const [editing, setEditing] = useState<TechnicianProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Tecnico responsavel');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [signatureUri, setSignatureUri] = useState('');
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [saving, setSaving] = useState(false);

  function openNew() {
    setEditing(null);
    setName(data.company?.responsibleName ?? '');
    setRole('Tecnico responsavel');
    setDocument('');
    setPhone(formatPhoneInput(data.company?.phone ?? ''));
    setEmail(data.company?.email ?? '');
    setSignatureUri('');
    setShowSignaturePad(false);
    setIsSigning(false);
    setShowForm(true);
  }

  function openEdit(technician: TechnicianProfile) {
    setEditing(technician);
    setName(technician.name);
    setRole(technician.role ?? 'Tecnico responsavel');
    setDocument(formatCpfCnpjInput(technician.document ?? ''));
    setPhone(formatPhoneInput(technician.phone ?? ''));
    setEmail(technician.email ?? '');
    setSignatureUri(technician.signatureUri ?? '');
    setShowSignaturePad(false);
    setIsSigning(false);
    setShowForm(true);
  }

  function closeForm() {
    setEditing(null);
    setName('');
    setRole('Tecnico responsavel');
    setDocument('');
    setPhone('');
    setEmail('');
    setSignatureUri('');
    setShowSignaturePad(false);
    setIsSigning(false);
    setShowForm(false);
  }

  async function selectSignature(source: 'library' | 'camera') {
    try {
      const image = await pickAndStoreImage('signatures', source);
      if (image?.localUri) setSignatureUri(image.localUri);
    } catch (error) {
      Alert.alert('Assinatura nao adicionada', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  async function save() {
    if (!name.trim()) {
      Alert.alert('Informe o nome do tecnico.');
      return;
    }
    try {
      setSaving(true);
      await saveTechnician({
        ...editing,
        name,
        role,
        document,
        phone,
        email,
        signatureUri,
        isDefault: editing?.isDefault ?? data.technicians.length === 0,
        status: 'active',
      });
      closeForm();
    } catch (error) {
      Alert.alert('Nao foi possivel salvar', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  function confirmRemove(technician: TechnicianProfile) {
    Alert.alert('Excluir tecnico', `Deseja excluir "${technician.name}"? As OS vinculadas serao atualizadas para outro tecnico padrao quando houver.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeTechnician(technician.id);
          } catch (error) {
            Alert.alert('Nao foi possivel excluir', error instanceof Error ? error.message : 'Tente novamente.');
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer
      scrollEnabled={!isSigning}
      footer={showForm ? <AppButton title={editing ? 'Salvar alteracoes' : 'Salvar tecnico'} loading={saving} onPress={save} /> : <AppButton title="Novo tecnico" onPress={openNew} />}
    >
      <AppHeader title="Tecnicos" subtitle="Perfis e assinaturas para OS e PDF" back />

      {!showForm ? (
        <>
          <SectionTitle title="Tecnicos cadastrados" description={`${data.technicians.length} tecnico${data.technicians.length === 1 ? '' : 's'}`} />
          <PaginatedList
            items={data.technicians}
            keyExtractor={(technician) => technician.id}
            empty={<AppText muted>Nenhum tecnico cadastrado.</AppText>}
            renderItem={(technician) => (
              <AppCard key={technician.id}>
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <AppText variant="subtitle">{technician.name}</AppText>
                    <AppText muted>{technician.role ?? 'Tecnico'}{technician.isDefault ? ' - Padrao' : ''}</AppText>
                    <AppText muted>{technician.signatureUri ? 'Assinatura salva para PDF' : 'Sem assinatura cadastrada'}</AppText>
                  </View>
                  <View style={styles.actions}>
                    <Pressable onPress={() => openEdit(technician)} style={[styles.iconButton, { backgroundColor: colors.primarySoft }]}>
                      <Ionicons name="create-outline" size={20} color={colors.primary} />
                    </Pressable>
                    <Pressable onPress={() => confirmRemove(technician)} style={[styles.iconButton, { backgroundColor: colors.dangerSoft }]}>
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </Pressable>
                  </View>
                </View>
              </AppCard>
            )}
          />
        </>
      ) : (
        <>
          <AppCard>
            <SectionTitle title={editing ? 'Dados do tecnico' : 'Novo tecnico'} />
            <InputField label="Nome" value={name} onChangeText={setName} />
            <InputField label="Funcao" value={role} onChangeText={setRole} />
            <InputField label="Documento" value={document} onChangeText={(value) => setDocument(formatCpfCnpjInput(value))} keyboardType="numeric" />
            <InputField label="Telefone" value={phone} onChangeText={(value) => setPhone(formatPhoneInput(value))} keyboardType="phone-pad" />
            <InputField label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <AppButton title="Cancelar" variant="secondary" compact onPress={closeForm} />
          </AppCard>

          <AppCard>
            <SectionTitle title="Assinatura do tecnico" description="Imagem salva no perfil e aplicada automaticamente ao PDF" />
            {showSignaturePad ? (
              <SignaturePad
                title="Assinatura do tecnico"
                onSigningChange={setIsSigning}
                onSave={(uri) => {
                  setSignatureUri(uri);
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
                {signatureUri ? (
                  signatureUri.startsWith('data:image/svg+xml') ? <View style={styles.signature}><AppText muted>Assinatura desenhada salva.</AppText></View> : <Image source={{ uri: signatureUri }} style={styles.signature} />
                ) : <AppText muted>Nenhuma assinatura salva.</AppText>}
                <View style={styles.row}>
                  <AppButton title="Assinar na tela" variant="secondary" compact onPress={() => setShowSignaturePad(true)} />
                  <AppButton title="Galeria" variant="secondary" compact onPress={() => selectSignature('library')} />
                  <AppButton title="Camera" variant="secondary" compact onPress={() => selectSignature('camera')} />
                  {signatureUri ? <AppButton title="Remover" variant="danger" compact onPress={() => setSignatureUri('')} /> : null}
                </View>
              </>
            )}
          </AppCard>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itemInfo: { flex: 1, gap: spacing.xxs },
  actions: { flexDirection: 'row', gap: spacing.xs },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signature: { width: '100%', height: 120, resizeMode: 'contain', borderRadius: 8, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
});
