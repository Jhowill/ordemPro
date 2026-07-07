import { Fragment, ReactNode, useEffect, useMemo, useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';

type Props<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  empty?: ReactNode;
  initialCount?: number;
  pageSize?: number;
};

export function PaginatedList<T>({ items, renderItem, keyExtractor, empty, initialCount = 20, pageSize = 20 }: Props<T>) {
  const [visibleCount, setVisibleCount] = useState(initialCount);

  useEffect(() => {
    setVisibleCount(initialCount);
  }, [initialCount, items.length]);

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const remaining = Math.max(0, items.length - visibleItems.length);

  if (!items.length) return <>{empty ?? null}</>;

  return (
    <>
      {visibleItems.map((item, index) => (
        <Fragment key={keyExtractor(item, index)}>{renderItem(item, index)}</Fragment>
      ))}
      {remaining ? (
        <AppButton title={`Carregar mais ${Math.min(pageSize, remaining)}`} variant="secondary" compact onPress={() => setVisibleCount((current) => current + pageSize)} />
      ) : items.length > initialCount ? (
        <AppText variant="caption" muted>{items.length} itens carregados.</AppText>
      ) : null}
    </>
  );
}
