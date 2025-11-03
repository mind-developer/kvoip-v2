import styled from '@emotion/styled';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { getDateFnsLocale } from '@/ui/field/display/utils/getDateFnsLocale.util';
import { Select } from '@/ui/input/components/Select';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { useRefreshAllCoreViews } from '@/views/hooks/useRefreshAllCoreViews';
import { useLingui } from '@lingui/react/macro';
import { enUS } from 'date-fns/locale';
/* @kvoip-woulz proprietary:begin */
import { APP_LOCALES, USER_VISIBLE_LOCALES } from 'twenty-shared/translations';
/* @kvoip-woulz proprietary:end */
import { isDefined } from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';
import { logError } from '~/utils/logError';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const LocalePicker = () => {
  const { t } = useLingui();
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );
  const setDateLocale = useSetRecoilState(dateLocaleState);

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const { refreshAllCoreViews } = useRefreshAllCoreViews('network-only');

  const updateWorkspaceMember = async (changedFields: any) => {
    if (!currentWorkspaceMember?.id) {
      throw new Error('User is not logged in');
    }

    try {
      await updateOneRecord({
        idToUpdate: currentWorkspaceMember.id,
        updateOneRecordInput: changedFields,
      });
    } catch (error) {
      logError(error);
    }
  };

  if (!isDefined(currentWorkspaceMember)) return;

  const handleLocaleChange = async (value: keyof typeof APP_LOCALES) => {
    setCurrentWorkspaceMember({
      ...currentWorkspaceMember,
      ...{ locale: value },
    });
    await updateWorkspaceMember({ locale: value });

    const dateFnsLocale = await getDateFnsLocale(value);
    setDateLocale({
      locale: value,
      localeCatalog: dateFnsLocale || enUS,
    });

    await dynamicActivate(value);
    try {
      localStorage.setItem('locale', value);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Failed to save locale to localStorage:', error);
    }
    await refreshObjectMetadataItems();
    await refreshAllCoreViews();
  };

  /* @kvoip-woulz proprietary:begin */
  const unsortedLocaleOptions: Array<{
    label: string;
    value: (typeof USER_VISIBLE_LOCALES)[keyof typeof USER_VISIBLE_LOCALES];
  }> = [
    {
      label: t`Portuguese — Brazil`,
      value: USER_VISIBLE_LOCALES['pt-BR'],
    },
    {
      label: t`English`,
      value: USER_VISIBLE_LOCALES.en,
    },
  ];
  /* @kvoip-woulz proprietary:end */

  const localeOptions = [...unsortedLocaleOptions].sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  return (
    <StyledContainer>
      <Select
        dropdownId="preferred-locale"
        dropdownWidthAuto
        fullWidth
        value={currentWorkspaceMember.locale}
        options={localeOptions}
        onChange={(value) =>
          handleLocaleChange(value as keyof typeof APP_LOCALES)
        }
      />
    </StyledContainer>
  );
};
