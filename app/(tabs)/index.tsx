import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { PaginatedList } from '@/components/ui/PaginatedList';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { spacing } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppData } from '@/services/storage';
import { formatDate, formatMoney, normalizeSearch } from '@/utils/formatters';

export default function HomeScreen() {
  const { data } = useAppData();
  const colors = useThemeColors();
  const { t, locale } = useI18n();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = normalizeSearch(query);
    if (!normalized) return data.orders.slice(0, 4);
    return data.orders.filter((order) => {
      const customer = data.customers.find((item) => item.id === order.customerId);
      return normalizeSearch(`${order.shortCode} ${customer?.name ?? ''} ${order.reportedIssue}`).includes(normalized);
    });
  }, [data.customers, data.orders, query]);

  const counters = {
    open: data.orders.filter((order) => order.status === 'open').length,
    progress: data.orders.filter((order) => ['diagnosis', 'in_progress', 'approved'].includes(order.status)).length,
    waiting: data.orders.filter((order) => ['waiting_approval', 'waiting_part'].includes(order.status)).length,
    completed: data.orders.filter((order) => ['completed', 'delivered'].includes(order.status)).length,
  };

  return (
    <ScreenContainer>
      <AppHeader title={`${t('common.appName')} ${data.company?.tradeName || data.company?.name || ''}`.trim()} subtitle={t('home.subtitle')} />
      <AppButton title={t('home.newOrder')} icon={<Ionicons name="add-circle-outline" color={colors.white} size={18} />} onPress={() => router.push('/orders/new')} />
      <View style={styles.space} />
      <SearchInput value={query} onChangeText={setQuery} placeholder={t('common.searchOrder')} />

      <View style={styles.grid}>
        {[
          [t('home.counters.open'), counters.open, colors.info],
          [t('home.counters.progress'), counters.progress, colors.primary],
          [t('home.counters.waiting'), counters.waiting, colors.warning],
          [t('home.counters.completed'), counters.completed, colors.success],
        ].map(([label, value, color]) => (
          <AppCard key={String(label)}>
            <AppText variant="small" muted>{label}</AppText>
            <AppText variant="h3" color={String(color)}>{String(value)}</AppText>
          </AppCard>
        ))}
      </View>

      <View style={styles.shortcuts}>
        <Shortcut icon="people-outline" label={t('home.shortcuts.customer')} onPress={() => router.push('/customers/new')} />
        <Shortcut icon="construct-outline" label={t('home.shortcuts.equipment')} onPress={() => router.push('/equipments/new')} />
        <Shortcut icon="document-text-outline" label={t('home.shortcuts.order')} onPress={() => router.push('/orders/new')} />
      </View>

      <AppText variant="subtitle" style={styles.section}>{t('home.lastOrders')}</AppText>
      <PaginatedList
        items={filtered}
        keyExtractor={(order) => order.id}
        empty={<AppText muted>{t('home.empty')}</AppText>}
        renderItem={(order) => {
          const customer = data.customers.find((item) => item.id === order.customerId);
          return (
            <AppCard key={order.id} onPress={() => router.push(`/orders/${order.id}`)}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <AppText variant="subtitle">{order.shortCode}</AppText>
                  <AppText muted>{customer?.name ?? t('home.customerNotFound')}</AppText>
                  <AppText variant="small" muted>{formatDate(order.openedAt, locale)} - {formatMoney(order.totalCents)}</AppText>
                </View>
                <StatusBadge status={order.status} />
              </View>
            </AppCard>
          );
        }}
      />

      {data.backup.lastBackupAt ? null : (
        <AppCard onPress={() => router.push('/settings/backup')}>
          <AppText variant="subtitle">{t('home.backupPending')}</AppText>
          <AppText muted>{t('home.backupPendingDesc')}</AppText>
        </AppCard>
      )}
    </ScreenContainer>
  );
}

function Shortcut({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable onPress={onPress} style={[styles.shortcut, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <AppText variant="caption">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  space: { height: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  shortcuts: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  shortcut: { flex: 1, borderWidth: 1, borderRadius: 14, alignItems: 'center', padding: spacing.sm, gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  section: { marginBottom: spacing.xs },
});
