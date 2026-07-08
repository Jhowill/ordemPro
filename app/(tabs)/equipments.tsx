import { router } from 'expo-router';
import { useMemo, useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaginatedList } from '@/components/ui/PaginatedList';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SearchInput } from '@/components/ui/SearchInput';
import { useI18n } from '@/hooks/useI18n';
import { useAppData } from '@/services/storage';
import { normalizeSearch } from '@/utils/formatters';

export default function EquipmentsScreen() {
  const { data } = useAppData();
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const equipments = useMemo(() => data.equipments.filter((equipment) => normalizeSearch(`${equipment.type ?? ''} ${equipment.brand ?? ''} ${equipment.model ?? ''} ${equipment.serialNumber ?? ''}`).includes(normalizeSearch(query))), [data.equipments, query]);

  return (
    <ScreenContainer>
      <AppHeader title={t('equipments.title')} subtitle={t('equipments.subtitle')} action={<AppButton title={t('equipments.new')} compact onPress={() => router.push('/equipments/new')} />} />
      <SearchInput value={query} onChangeText={setQuery} placeholder={t('equipments.search')} />
      <PaginatedList
        items={equipments}
        keyExtractor={(equipment) => equipment.id}
        empty={<EmptyState icon="construct-outline" title={t('equipments.emptyTitle')} description={t('equipments.emptyDesc')} actionLabel={t('equipments.emptyAction')} onAction={() => router.push('/equipments/new')} />}
        renderItem={(equipment) => {
          const customer = data.customers.find((item) => item.id === equipment.customerId);
          return (
            <AppCard key={equipment.id} onPress={() => router.push(`/equipments/${equipment.id}`)}>
              <AppText variant="subtitle">{equipment.type ?? equipment.category} {equipment.brand ?? ''} {equipment.model ?? ''}</AppText>
              <AppText muted>{customer?.name ?? t('equipments.customerNotFound')}</AppText>
              <AppText variant="small" muted>{equipment.serialNumber ? `${t('equipments.serialPrefix')} ${equipment.serialNumber}` : t('equipments.noSerial')}</AppText>
            </AppCard>
          );
        }}
      />
    </ScreenContainer>
  );
}
