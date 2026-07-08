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

export default function CustomersScreen() {
  const { data } = useAppData();
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const customers = useMemo(() => data.customers.filter((customer) => normalizeSearch(`${customer.name} ${customer.phone ?? ''} ${customer.document ?? ''}`).includes(normalizeSearch(query))), [data.customers, query]);

  return (
    <ScreenContainer>
      <AppHeader title={t('customers.title')} subtitle={t('customers.subtitle')} action={<AppButton title={t('customers.new')} compact onPress={() => router.push('/customers/new')} />} />
      <SearchInput value={query} onChangeText={setQuery} placeholder={t('customers.search')} />
      <PaginatedList
        items={customers}
        keyExtractor={(customer) => customer.id}
        empty={<EmptyState icon="people-outline" title={t('customers.emptyTitle')} description={t('customers.emptyDesc')} actionLabel={t('customers.emptyAction')} onAction={() => router.push('/customers/new')} />}
        renderItem={(customer) => (
          <AppCard key={customer.id} onPress={() => router.push(`/customers/${customer.id}`)}>
            <AppText variant="subtitle">{customer.name}</AppText>
            <AppText muted>{customer.phone || customer.whatsapp || t('customers.noPhone')}</AppText>
            <AppText variant="small" muted>{t('customers.linkedOrders', { count: data.orders.filter((order) => order.customerId === customer.id).length })}</AppText>
          </AppCard>
        )}
      />
    </ScreenContainer>
  );
}
