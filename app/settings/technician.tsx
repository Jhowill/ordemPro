import { useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { InputField } from '@/components/ui/InputField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { spacing } from '@/constants/theme';
import { pickAndStoreImage } from '@/services/media';
import { useAppData } from '@/services/storage';

export default function TechnicianSettingsScreen() {
  const { data, saveTechnician } = useAppData();
  const current = data.technicians.find((item) => item.isDefault) ?? data.technicians[0];
  const [name, setName] = useState(current?.name ?? data.company?.responsibleName ?? '');
  const [role, setRole] = useState(current?.role ?? 'Tecnico responsavel');
  const [document, setDocument] = useState(current?.document ?? '');
  const [phone, setPhone] = useState(current?.phone ?? data.company?.phone ?? '');
  const [email, setEmail] = useState(current?.email ?? data.company?.email ?? '');
  const [signatureUri, setSignatureUri] = useState(current?.signatureUri ?? '');
  const [saving, setSaving] = useState(false);

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
        ...current,
        name,
        role,
        document,
        phone,
        email,
        signatureUri,
        isDefault: true,
        status: 'active',
      });
      Alert.alert('Tecnico salvo', 'A assinatura sera aplicada automaticamente nos PDFs das OS vinculadas a este tecnico.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer>
      <AppHeader title="Tecnico responsavel" subtitle="Perfil e assinatura para OS e PDF" back />
      <AppCard>
        <SectionTitle title="Dados do tecnico" />
        <InputField label="Nome" value={name} onChangeText={setName} />
        <InputField label="Funcao" value={role} onChangeText={setRole} />
        <InputField label="Documento" value={document} onChangeText={setDocument} />
        <InputField label="Telefone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <InputField label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      </AppCard>

      <AppCard>
        <SectionTitle title="Assinatura do tecnico" description="Imagem salva no perfil e aplicada automaticamente ao PDF" />
        {signatureUri ? <Image source={{ uri: signatureUri }} style={styles.signature} /> : <AppText muted>Nenhuma assinatura salva.</AppText>}
        <View style={styles.row}>
          <AppButton title="Galeria" variant="secondary" compact onPress={() => selectSignature('library')} />
          <AppButton title="Camera" variant="secondary" compact onPress={() => selectSignature('camera')} />
          {signatureUri ? <AppButton title="Remover" variant="danger" compact onPress={() => setSignatureUri('')} /> : null}
        </View>
      </AppCard>

      <AppButton title="Salvar tecnico" loading={saving} onPress={save} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  signature: { width: '100%', height: 120, resizeMode: 'contain', borderRadius: 8, backgroundColor: '#F8FAFC' },
});
