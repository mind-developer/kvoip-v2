import { type SelectValue } from '@/ui/input/components/internal/select/types';
import { type SelectOption } from 'twenty-ui/input';

const isNonEmptyString = (val: unknown): val is string =>
  typeof val === 'string' && val.trim().length > 0;

export const generateSelectOptions = <T extends Record<string, any>>(
  data: T[],
  field: keyof T,
  placeholder: string,
): SelectOption<SelectValue>[] => {
  const uniqueValues = Array.from(
    new Set(data.map((item) => item[field]).filter(isNonEmptyString)),
  );

  return [
    { label: placeholder, value: 'none' },
    ...uniqueValues.map((val) => ({ label: val, value: val })),
  ];
};
