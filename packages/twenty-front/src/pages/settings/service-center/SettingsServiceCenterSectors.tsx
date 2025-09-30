import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { v4 } from 'uuid';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsServiceCenterSectors = () => {
  // const { t } = useTranslation();

  const { records: sectors } = useFindManyRecords<Sector>({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });

  return (
    <SubMenuTopBarContainer
      title={'Sectors'}
      actionButton={
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.ServiceCenterNewSector)}
        >
          <Button
            Icon={IconPlus}
            title={'Add Sectors'}
            accent="blue"
            size="small"
          />
        </UndecoratedLink>
      }
      links={[
        {
          children: 'Service Center',
          href: getSettingsPath(SettingsPath.ServiceCenter),
        },
        { children: 'Sectors' },
      ]}
    >
      <SettingsPageContainer>
        {sectors.map((sector) => {
          return (
            <SelectableList
              selectableItemIdArray={sectors.map((sector) => sector.id)}
              focusId={v4()}
              selectableListInstanceId={v4()}
            >
              <SelectableListItem itemId={sector.id}>
                {sector.name}
              </SelectableListItem>
            </SelectableList>
          );
        })}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
