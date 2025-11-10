export const truncateList = (
  list: string[],
  maxLength: number,
  fallback: string,
) => {
  if (list.length === 0) {
    return fallback;
  }
  if (list.length <= maxLength) {
    return list.join(', ');
  }
  return list.slice(0, maxLength).join(', ') + ' and more';
};
