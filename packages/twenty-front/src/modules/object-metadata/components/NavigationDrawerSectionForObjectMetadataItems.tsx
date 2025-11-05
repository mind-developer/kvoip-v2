import { NavigationDrawerItemForObjectMetadataItem } from '@/object-metadata/components/NavigationDrawerItemForObjectMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useRecoilValue } from 'recoil';
/* @kvoip-woulz proprietary:begin */
import { NavigationDrawerFinancialRegistersGroup } from '@/object-metadata/components/NavigationDrawerFinancialRegistersGroup';
/* @kvoip-woulz proprietary:end */

const ORDERED_STANDARD_OBJECTS = [
  'person',
  'company',
  'opportunity',
  /* @kvoip-woulz proprietary:begin */
  'accountReceivable',
  'accountPayable',
  /* @kvoip-woulz proprietary:end */
  'task',
  'note',
];

type NavigationDrawerSectionForObjectMetadataItemsProps = {
  sectionTitle: string;
  isRemote: boolean;
  objectMetadataItems: ObjectMetadataItem[];
};

export const NavigationDrawerSectionForObjectMetadataItems = ({
  sectionTitle,
  isRemote,
  objectMetadataItems,
}: NavigationDrawerSectionForObjectMetadataItemsProps) => {
  const { toggleNavigationSection, isNavigationSectionOpenState } =
    useNavigationSection('Objects' + (isRemote ? 'Remote' : 'Workspace'));
  const isNavigationSectionOpen = useRecoilValue(isNavigationSectionOpenState);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const sortedStandardObjectMetadataItems = [...objectMetadataItems]
    .filter((item) => ORDERED_STANDARD_OBJECTS.includes(item.nameSingular))
    .sort((objectMetadataItemA, objectMetadataItemB) => {
      const indexA = ORDERED_STANDARD_OBJECTS.indexOf(
        objectMetadataItemA.nameSingular,
      );
      const indexB = ORDERED_STANDARD_OBJECTS.indexOf(
        objectMetadataItemB.nameSingular,
      );
      if (indexA === -1 || indexB === -1) {
        return objectMetadataItemA.nameSingular.localeCompare(
          objectMetadataItemB.nameSingular,
        );
      }
      return indexA - indexB;
    });

  const sortedCustomObjectMetadataItems = [...objectMetadataItems]
    .filter((item) => !ORDERED_STANDARD_OBJECTS.includes(item.nameSingular))
    .sort((objectMetadataItemA, objectMetadataItemB) => {
      return new Date(objectMetadataItemA.createdAt) <
        new Date(objectMetadataItemB.createdAt)
        ? 1
        : -1;
    });

  const objectMetadataItemsForNavigationItems = [
    ...sortedStandardObjectMetadataItems,
    ...sortedCustomObjectMetadataItems,
  ];

  const objectMetadataItemsForNavigationItemsWithReadPermission =
    objectMetadataItemsForNavigationItems.filter(
      (objectMetadataItem) =>
        getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          objectMetadataItem.id,
        ).canReadObjectRecords,
    );

  /* @kvoip-woulz proprietary:begin */
  const accountReceivableItem =
    objectMetadataItemsForNavigationItemsWithReadPermission.find(
      (item) => item.nameSingular === 'accountReceivable',
    );
  const accountPayableItem =
    objectMetadataItemsForNavigationItemsWithReadPermission.find(
      (item) => item.nameSingular === 'accountPayable',
    );

  const objectMetadataItemsWithoutFinancialRegisters =
    objectMetadataItemsForNavigationItemsWithReadPermission.filter(
      (item) =>
        item.nameSingular !== 'accountReceivable' &&
        item.nameSingular !== 'accountPayable',
    );

  const itemsBeforeFinancialRegisters =
    objectMetadataItemsWithoutFinancialRegisters.filter((item) => {
      const orderIndex = ORDERED_STANDARD_OBJECTS.indexOf(item.nameSingular);
      const financialRegistersIndex =
        ORDERED_STANDARD_OBJECTS.indexOf('accountReceivable');
      return orderIndex !== -1 && orderIndex < financialRegistersIndex;
    });

  const itemsAfterFinancialRegisters =
    objectMetadataItemsWithoutFinancialRegisters.filter((item) => {
      const orderIndex = ORDERED_STANDARD_OBJECTS.indexOf(item.nameSingular);
      const financialRegistersIndex =
        ORDERED_STANDARD_OBJECTS.indexOf('accountReceivable');
      return orderIndex === -1 || orderIndex >= financialRegistersIndex;
    });
  /* @kvoip-woulz proprietary:end */

  return (
    objectMetadataItems.length > 0 && (
      <NavigationDrawerSection>
        <NavigationDrawerAnimatedCollapseWrapper>
          <NavigationDrawerSectionTitle
            label={sectionTitle}
            onClick={() => toggleNavigationSection()}
          />
        </NavigationDrawerAnimatedCollapseWrapper>
        {isNavigationSectionOpen && (
          <>
            {/* @kvoip-woulz proprietary:begin */}
            {itemsBeforeFinancialRegisters.map((objectMetadataItem) => (
              <NavigationDrawerItemForObjectMetadataItem
                key={`navigation-drawer-item-${objectMetadataItem.id}`}
                objectMetadataItem={objectMetadataItem}
              />
            ))}
            {(accountReceivableItem || accountPayableItem) && (
              <NavigationDrawerFinancialRegistersGroup
                accountReceivableMetadataItem={accountReceivableItem}
                accountPayableMetadataItem={accountPayableItem}
              />
            )}
            {itemsAfterFinancialRegisters.map((objectMetadataItem) => (
              <NavigationDrawerItemForObjectMetadataItem
                key={`navigation-drawer-item-${objectMetadataItem.id}`}
                objectMetadataItem={objectMetadataItem}
              />
            ))}
            {/* @kvoip-woulz proprietary:end */}
          </>
        )}
      </NavigationDrawerSection>
    )
  );
};
