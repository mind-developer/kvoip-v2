/* eslint-disable react/jsx-props-no-spreading */
import { useNavigate } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { H2Title, Label } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { Sector } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledFormContainer = styled.div`
  display: flex;
  /* align-items: flex-end; */
  gap: ${({ theme }) => theme.spacing(1)};
`;
export const SettingsServiceCenterNewSector = () => {
  const settingsServiceCenterSectorsPagePath = getSettingsPath(
    SettingsPath.ServiceCenterSectors,
  );
  const navigate = useNavigate();
  const { enqueueInfoSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const { records: existingSectors } = useFindManyRecords<Sector>({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');

  const onSave = async () => {
    if (
      existingSectors.some(
        (sector) => sector.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      enqueueErrorSnackBar({
        message: t`A sector with this name already exists`,
      });
      return;
    }
    const createdSector = await createOneRecord({ name, icon });
    if (createdSector.id) {
      navigate(getSettingsPath(SettingsPath.ServiceCenterSectors));
      enqueueInfoSnackBar({
        message: t`Sector ${createdSector.name} created`,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={'Create sector'}
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
        <Section>
          <H2Title
            title={t`About`}
            description={t`Define this sector's properties. You can assign agents to this sector after you've created it.`}
          />
          <StyledFormContainer>
            <div>
              <Label style={{ marginBottom: 4 }}>Icon</Label>
              <IconPicker
                selectedIconKey={icon}
                onChange={(i) => {
                  setIcon(i.iconKey);
                }}
              />
            </div>
            <TextInput
              value={name}
              onChange={(s) => setName(s)}
              label={t`Name`}
            />
          </StyledFormContainer>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
