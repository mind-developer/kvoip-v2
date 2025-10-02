import {
  NewLogicNodeData,
  RecordType,
} from '@/chatbot/types/LogicNodeDataType';
import { comparisonOptions } from '@/chatbot/types/conditionalOptions';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { SelectValue } from '@/ui/input/components/internal/select/types';
import styled from '@emotion/styled';
import { Handle, Position } from '@xyflow/react';
import React, { useState } from 'react';
import { IconTrash, Label, useIcons } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

interface LogicOptionProps {
  nodeIndex: number;
  condition: NewLogicNodeData;
  onDelete: () => void;
  onUpdate: (updates: NewLogicNodeData) => void;
  showDeleteButton?: boolean;
}

const StyledLogicNodeWrapper = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  position: relative;
  margin-right: 5px;
`;

const StyledSelect = styled(Select)`
  width: 100%;
`;

const StyledTextInput = styled(TextInput)`
  width: 100%;
`;

const StyledLabel = styled(Label)`
  padding-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledOptionLabel = styled(Label)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  border-bottom: ${({ theme }) => theme.border.color.light}
  margin-bottom: ${({ theme }) => theme.spacing(8)}
`;

export const LogicOption: React.FC<LogicOptionProps> = ({
  condition,
  onDelete,
  onUpdate,
  showDeleteButton = true,
}) => {
  const { getIcon } = useIcons();
  const { records: sectors } = useFindManyRecords<Sector & { __typename: string }>({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });

  const [localMessage, setLocalMessage] = useState(condition.message ?? '');
  const [recordType, setRecordType] = useState<RecordType>(
    condition.recordType ?? '',
  );

  if (!sectors) return null;

  const sectorsOptions = [
    { label: 'Choose a sector', value: '' },
    ...sectors.map((sector) => ({
      Icon: getIcon(sector.icon),
      label: sector.name,
      value: sector.id,
    })),
  ];

  const recordTypeOptions: { label: string; value: RecordType }[] = [
    // TODO: Fix incorrect type for 'value' property
    { label: 'Choose record', value: '' },
    { label: 'Sectors', value: 'sectors' },
    { label: 'Text', value: 'text' },
  ];

  const handleTextBlur = () => {
    const trimmed = localMessage.trim();
    if (trimmed !== (condition.message ?? '').trim()) {
      const updated = { ...condition, message: trimmed, recordType };
      onUpdate(updated);
    }
  };

  const handleSector = (val: SelectValue) => {
    if (!val) return;
    if (val !== condition.sectorId) {
      const updated = {
        ...condition,
        sectorId: val.toString(),
        recordType,
      };
      onUpdate(updated);
    }
  };

  return (
    <div>
      <StyledOptionLabel>{condition.option}.</StyledOptionLabel>
      <StyledLogicNodeWrapper>
        {showDeleteButton && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <StyledLabel>Delete</StyledLabel>
            <Button Icon={IconTrash} onClick={onDelete} />
          </div>
        )}
        <StyledSelect
          label="Record"
          dropdownId={`select-record-type-${condition.option}`}
          options={recordTypeOptions}
          value={recordType}
          onChange={(val) => setRecordType(val?.toString() as RecordType)}
        />
        <StyledSelect
          label="Comparison"
          dropdownId={`select-comparison-condition-${condition.option}`}
          options={comparisonOptions}
          value={condition.comparison}
          onChange={(val) => {
            onUpdate({ ...condition, comparison: val?.toString() ?? '' });
          }}
        />
        {recordType === 'sectors' && (
          <>
            <StyledSelect
              label="Options"
              dropdownId={`select-sector-condition-${condition.option}`}
              options={sectorsOptions}
              value={condition.sectorId}
              onChange={handleSector}
            />
            <Handle
              id={`b-${condition.option}`}
              type="source"
              position={Position.Right}
              isConnectable={true}
            />
          </>
        )}
        {recordType === 'text' && (
          <>
            <StyledTextInput
              label="Text"
              value={localMessage}
              onChange={(e) => setLocalMessage(e)}
              onBlur={handleTextBlur}
              disabled={localMessage.length > 40}
            />
            <Handle
              id={`b-${condition.option}`}
              type="source"
              position={Position.Right}
              isConnectable={true}
              style={{ height: 10, width: 10 }}
            />
          </>
        )}
      </StyledLogicNodeWrapper>
    </div>
  );
};
