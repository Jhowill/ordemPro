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
import { useAppData } from '@/services/storage';
import { normalizeSearch } from '@/utils/formatters';

export default function CustomersScreen() {
  const { data } = useAppData();
  const [query, setQuery] = useState('');
  const customers = useMemo(() => data.customers.filter((customer) => normalizeSearch(`${customer.name} ${customer.phone ?? ''} ${customer.document ?? ''}`).includes(normalizeSearch(query))), [data.customers, query]);

  return (
    <ScreenContainer>
      <AppHeader title="Clientes" subtitle="Cadastro e historico" action={<AppButton title="Novo" compact onPress={() => router.push('/customers/new')} />} />
      <SearchInput value={query} onChangeText={setQuery} placeholder="Buscar cliente..." />
      <PaginatedList
        items={customers}
        keyExtractor={(customer) => customer.id}
        empty={<EmptyState icon="people-outline" title="Nenhum cliente cadastrado" description="Cadastre o primeiro cliente para criar ordens de servico." actionLabel="Novo cliente" onAction={() => router.push('/customers/new')} />}
        renderItem={(customer) => (
          <AppCard key={customer.id} onPress={() => router.push(`/customers/${customer.id}`)}>
            <AppText variant="subtitle">{customer.name}</AppText>
            <AppText muted>{customer.phone || customer.whatsapp || 'Sem telefone'}</AppText>
            <AppText variant="small" muted>{data.orders.filter((order) => order.customerId === customer.id).length} OS vinculadas</AppText>
          </AppCard>
        )}
      />
    </ScreenContainer>
  );
}
