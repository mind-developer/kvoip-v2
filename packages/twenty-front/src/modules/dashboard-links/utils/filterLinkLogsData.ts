export type FilterType = 'week' | 'month' | 'year';

const toDate = (createdAt: string | number): Date => {
  if (typeof createdAt === 'string') {
    const date = new Date(createdAt);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  const ts = Number(createdAt) || 0;
  const ms = ts < 1e12 ? ts * 1000 : ts;
  return new Date(ms);
};

export const filterLinkLogsData = <T extends { createdAt?: string | number }>(
  data: T[],
  filter: FilterType,
): T[] => {
  const now = new Date();
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  return data.filter((item) => {
    if (!item.createdAt) return false;

    const createdAtDate = toDate(item.createdAt);

    if (Number.isNaN(createdAtDate.getTime())) return false;

    switch (filter) {
      case 'week':
        return now.getTime() - createdAtDate.getTime() <= 7 * MS_PER_DAY;
      case 'month':
        return (
          createdAtDate.getMonth() === now.getMonth() &&
          createdAtDate.getFullYear() === now.getFullYear()
        );
      case 'year':
        return createdAtDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  });
};
