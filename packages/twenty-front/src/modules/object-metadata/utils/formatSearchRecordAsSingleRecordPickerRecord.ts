import { getAvatarType } from '@/object-metadata/utils/getAvatarType';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
/* @kvoip-woulz proprietary:begin */
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
/* @kvoip-woulz proprietary:end */
/* @kvoip-woulz proprietary:begin */
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined, sanitizeURL } from 'twenty-shared/utils';
/* @kvoip-woulz proprietary:end */
import { type SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { type SearchRecord } from '~/generated/graphql';

/* @kvoip-woulz proprietary:begin */
type FormatSingleRecordPickerOptions = {
  labelIdentifierFieldName?: string;
  imageIdentifierFieldName?: string;
};
/* @kvoip-woulz proprietary:end */

export const formatSearchRecordAsSingleRecordPickerRecord = (
  searchRecord: SearchRecord,
  /* @kvoip-woulz proprietary:begin */
  options: FormatSingleRecordPickerOptions = {},
  /* @kvoip-woulz proprietary:end */
): SingleRecordPickerRecord => {
  /* @kvoip-woulz proprietary:begin */
  const { labelIdentifierFieldName, imageIdentifierFieldName } = options;

  const record: ObjectRecord = {
    id: searchRecord.recordId,
    __typename: searchRecord.objectNameSingular,
  };

  if (isDefined(labelIdentifierFieldName)) {
    record[labelIdentifierFieldName] = searchRecord.label;
  }

  if (!isDefined(record.name)) {
    record.name = searchRecord.label;
  }

  if (isDefined(searchRecord.imageUrl)) {
    /* @kvoip-woulz proprietary:begin */
    if (
      searchRecord.objectNameSingular === CoreObjectNameSingular.Company &&
      typeof searchRecord.imageUrl === 'string'
    ) {
      const parsedDomainFromImageUrl = (() => {
        try {
          const parsedUrl = new URL(searchRecord.imageUrl);

          if (
            parsedUrl.hostname.endsWith('twenty-icons.com') &&
            isDefined(parsedUrl.pathname)
          ) {
            return parsedUrl.pathname.replace(/^\//, '');
          }
        } catch (_error) {
          if (searchRecord.imageUrl.startsWith('https://twenty-icons.com/')) {
            return searchRecord.imageUrl
              .replace('https://twenty-icons.com/', '')
              .replace(/^\//, '');
          }
        }

        return undefined;
      })();

      const sanitizedDomain = sanitizeURL(parsedDomainFromImageUrl);

      if (sanitizedDomain.length > 0) {
        const normalizedDomain = sanitizedDomain.startsWith('http')
          ? sanitizedDomain
          : `https://${sanitizedDomain}`;

        record.domainName = normalizedDomain;
        record.domainNamePrimaryLinkUrl = normalizedDomain;
      }
    }
    /* @kvoip-woulz proprietary:end */

    if (isDefined(imageIdentifierFieldName)) {
      record[imageIdentifierFieldName] = searchRecord.imageUrl;
    }

    if (!isDefined(record.avatarUrl)) {
      record.avatarUrl = searchRecord.imageUrl;
    }
  }
  /* @kvoip-woulz proprietary:end */

  return {
    id: searchRecord.recordId,
    name: searchRecord.label,
    avatarUrl: searchRecord.imageUrl ?? undefined,
    avatarType: getAvatarType(searchRecord.objectNameSingular),
    linkToShowPage:
      getBasePathToShowPage({
        objectNameSingular: searchRecord.objectNameSingular,
      }) + searchRecord.recordId,
    /* @kvoip-woulz proprietary:begin */
    record,
    /* @kvoip-woulz proprietary:end */
  };
};
