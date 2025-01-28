import { CommandMenuContextRecordChip } from '@/command-menu/components/CommandMenuContextRecordChip';
import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { RecordChipData } from '@/object-record/record-field/types/RecordChipData';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Decorator, Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndContextStoreWrapper';
import { getCompaniesMock } from '~/testing/mock-data/companies';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

const companyMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
);

const companiesMock = getCompaniesMock();

const companyMock = companiesMock[0];

const chipGeneratorPerObjectPerField: Record<
  string,
  Record<string, (record: ObjectRecord) => RecordChipData>
> = {
  company: {
    name: (record: ObjectRecord): RecordChipData => ({
      recordId: record.id,
      name: record.name as string,
      avatarUrl: '',
      avatarType: 'rounded',
      isLabelIdentifier: true,
      objectNameSingular: 'company',
    }),
  },
};

const identifierChipGeneratorPerObject: Record<
  string,
  (record: ObjectRecord) => RecordChipData
> = {
  company: chipGeneratorPerObjectPerField.company.name,
};

const ChipGeneratorsDecorator: Decorator = (Story) => (
  <PreComputedChipGeneratorsContext.Provider
    value={{
      chipGeneratorPerObjectPerField,
      identifierChipGeneratorPerObject,
    }}
  >
    <Story />
  </PreComputedChipGeneratorsContext.Provider>
);

const createContextStoreWrapper = ({
  companies,
  componentInstanceId,
}: {
  companies: typeof companiesMock;
  componentInstanceId: string;
}) => {
  return getJestMetadataAndApolloMocksAndActionMenuWrapper({
    apolloMocks: [],
    componentInstanceId,
    contextStoreCurrentObjectMetadataNameSingular:
      companyMockObjectMetadataItem?.nameSingular,
    contextStoreTargetedRecordsRule: {
      mode: 'selection',
      selectedRecordIds: companies.map((company) => company.id),
    },
    contextStoreNumberOfSelectedRecords: companies.length,
    onInitializeRecoilSnapshot: (snapshot) => {
      for (const company of companies) {
        snapshot.set(recordStoreFamilyState(company.id), company);
      }
    },
  });
};

const ContextStoreDecorator: Decorator = (Story) => {
  const ContextStoreWrapper = createContextStoreWrapper({
    companies: [companyMock],
    componentInstanceId: '1',
  });

  return (
    <ContextStoreWrapper>
      <Story />
    </ContextStoreWrapper>
  );
};

const meta: Meta<typeof CommandMenuContextRecordChip> = {
  title: 'Modules/CommandMenu/CommandMenuContextRecordChip',
  component: CommandMenuContextRecordChip,
  decorators: [
    ContextStoreDecorator,
    ChipGeneratorsDecorator,
    ComponentDecorator,
  ],
  args: {
    objectMetadataItemId: companyMockObjectMetadataItem?.id,
  },
};

export default meta;
type Story = StoryObj<typeof CommandMenuContextRecordChip>;

export const Default: Story = {};

export const WithTwoCompanies: Story = {
  decorators: [
    (Story) => {
      const twoCompaniesMock = companiesMock.slice(0, 2);
      const TwoCompaniesWrapper = createContextStoreWrapper({
        companies: twoCompaniesMock,
        componentInstanceId: '2',
      });

      return (
        <TwoCompaniesWrapper>
          <Story />
        </TwoCompaniesWrapper>
      );
    },
  ],
};

export const WithTenCompanies: Story = {
  decorators: [
    (Story) => {
      const tenCompaniesMock = companiesMock.slice(0, 10);
      const TenCompaniesWrapper = createContextStoreWrapper({
        companies: tenCompaniesMock,
        componentInstanceId: '3',
      });

      return (
        <TenCompaniesWrapper>
          <Story />
        </TenCompaniesWrapper>
      );
    },
  ],
};
