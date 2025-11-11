import { type Settings } from './interfaces/settings.interface';

export const settings: Settings = {
  storage: {
    imageCropSizes: {
      'profile-picture': ['original'],
      'workspace-logo': ['original'],
      'person-picture': ['original'],
    },
    maxFileSize: '16MB' /* @kvoip-woulz proprietary */,
  },
  minLengthOfStringForDuplicateCheck: 3,
  maxVisibleViewFields: 30,
};
