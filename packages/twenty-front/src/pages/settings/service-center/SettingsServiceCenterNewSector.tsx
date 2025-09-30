/* eslint-disable react/jsx-props-no-spreading */
import { useNavigate } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsServiceCenterNewSector = () => {
  const settingsServiceCenterSectorsPagePath = getSettingsPath(
    SettingsPath.ServiceCenterSectors,
  );

  const navigate = useNavigate();
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });
  const [name, setName] = useState('');

  const onSave = async () => {
    createOneRecord({ name });
  };

  return (
    <SubMenuTopBarContainer
      title={'Sectors'}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={name.length < 4}
          onCancel={() => navigate(settingsServiceCenterSectorsPagePath)}
          onSave={onSave}
        />
      }
      links={[
        {
          children: 'Sectors',
          href: getSettingsPath(SettingsPath.ServiceCenterSectors),
        },
        { children: 'New sector' },
      ]}
    >
      <SettingsPageContainer>
        <TextInput value={name} onChange={(s) => setName(s)} label={t`Name`} />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
