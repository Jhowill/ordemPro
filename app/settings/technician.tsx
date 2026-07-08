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
import { useI18n } from '@/hooks/useI18n';
import { useThemeColors } from '@/hooks/useThemeColors';
import { pickAndStoreImage } from '@/services/media';
import { useAppData } from '@/services/storage';
import { TechnicianProfile } from '@/types';
import { formatCpfCnpjInput, formatPhoneInput } from '@/utils/formatters';

export default function TechnicianSettingsScreen() {
  const colors = useThemeColors();
  const { t } = useI18n();
  const { data, saveTechnician, removeTechnician } = useAppData();
  const [editing, setEditing] = useState<TechnicianProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState(t('technician.roleDefault'));
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
    setRole(t('technician.roleDefault'));
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
    setRole(technician.role ?? t('technician.roleDefault'));
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
    setRole(t('technician.roleDefault'));
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
      Alert.alert(t('technician.signatureTitle'), error instanceof Error ? error.message : t('common.retry'));
    }
  }

  async function save() {
    if (!name.trim()) {
      Alert.alert(t('technician.nameRequired'));
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
      Alert.alert(t('technician.saveFail'), error instanceof Error ? error.message : t('common.retry'));
    } finally {
      setSaving(false);
    }
  }

  function confirmRemove(technician: TechnicianProfile) {
    Alert.alert(t('technician.deleteTitle'), t('technician.confirmDelete', { name: technician.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.remove'),
        style: 'destructive',
        onPress: async () => {
          try {
            await removeTechnician(technician.id);
          } catch (error) {
            Alert.alert(t('technician.deleteFail'), error instanceof Error ? error.message : t('common.retry'));
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer
      scrollEnabled={!isSigning}
      footer={showForm ? <AppButton title={editing ? t('technician.saveEdit') : t('technician.saveNew')} loading={saving} onPress={save} /> : <AppButton title={t('technician.new')} onPress={openNew} />}
    >
      <AppHeader title={t('technician.title')} subtitle={t('technician.subtitle')} back />

      {!showForm ? (
        <>
          <SectionTitle title={t('technician.listTitle')} description={t('technician.count', { count: data.technicians.length })} />
          <PaginatedList
            items={data.technicians}
            keyExtractor={(technician) => technician.id}
            empty={<AppText muted>{t('technician.empty')}</AppText>}
            renderItem={(technician) => (
              <AppCard key={technician.id}>
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <AppText variant="subtitle">{technician.name}</AppText>
                    <AppText muted>{technician.role ?? t('technician.roleDefault')}{technician.isDefault ? ` - ${t('common.default')}` : ''}</AppText>
                    <AppText muted>{technician.signatureUri ? t('technician.signatureReady') : t('technician.signatureMissing')}</AppText>
                  </View>
                  <View style={styles.actions}>
                    <Pressable onPress={() => openEdit(technician)} style={[styles.iconButton, { backgroundColor: colors.primarySoft }]}><Ionicons name="create-outline" size={20} color={colors.primary} /></Pressable>
                    <Pressable onPress={() => confirmRemove(technician)} style={[styles.iconButton, { backgroundColor: colors.dangerSoft }]}><Ionicons name="trash-outline" size={20} color={colors.danger} /></Pressable>
                  </View>
                </View>
              </AppCard>
            )}
          />
        </>
      ) : (
        <>
          <AppCard>
            <SectionTitle title={editing ? t('technician.formTitleEdit') : t('technician.formTitleNew')} />
            <InputField label={t('technician.fields.name')} value={name} onChangeText={setName} />
            <InputField label={t('technician.fields.role')} value={role} onChangeText={setRole} />
            <InputField label={t('technician.fields.document')} value={document} onChangeText={(value) => setDocument(formatCpfCnpjInput(value))} keyboardType="numeric" />
            <InputField label={t('technician.fields.phone')} value={phone} onChangeText={(value) => setPhone(formatPhoneInput(value))} keyboardType="phone-pad" />
            <InputField label={t('technician.fields.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <AppButton title={t('common.cancel')} variant="secondary" compact onPress={closeForm} />
          </AppCard>

          <AppCard>
            <SectionTitle title={t('technician.signatureTitle')} description={t('technician.signatureDesc')} />
            {showSignaturePad ? (
              <SignaturePad
                title={t('technician.signatureTitle')}
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
                  signatureUri.startsWith('data:image/svg+xml') ? <View style={[styles.signature, { backgroundColor: colors.surfaceAlt }]}><AppText muted>{t('technician.signatureCaption')}</AppText></View> : <Image source={{ uri: signatureUri }} style={[styles.signature, { backgroundColor: colors.surfaceAlt }]} />
                ) : <AppText muted>{t('technician.signatureNone')}</AppText>}
                <View style={styles.row}>
                  <AppButton title={t('technician.signOnScreen')} variant="secondary" compact onPress={() => setShowSignaturePad(true)} />
                  <AppButton title={t('technician.chooseLibrary')} variant="secondary" compact onPress={() => selectSignature('library')} />
                  <AppButton title={t('technician.chooseCamera')} variant="secondary" compact onPress={() => selectSignature('camera')} />
                  {signatureUri ? <AppButton title={t('technician.remove')} variant="danger" compact onPress={() => setSignatureUri('')} /> : null}
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
  signature: { width: '100%', height: 120, resizeMode: 'contain', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
