/* @kvoip-woulz proprietary */
import { useContext } from 'react';

import { RecordCreateContext } from '@/object-record/record-create/contexts/RecordCreateContext';

export const useRecordCreateContext = () => {
  const context = useContext(RecordCreateContext);

  if (context === null) {
    throw new Error('RecordCreateContext not found');
  }

  return context;
};
