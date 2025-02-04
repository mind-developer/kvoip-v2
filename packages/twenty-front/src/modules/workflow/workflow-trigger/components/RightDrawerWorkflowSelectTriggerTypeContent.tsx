import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import {
  WorkflowTriggerType,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/TriggerTypes';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { getTriggerDefaultDefinition } from '@/workflow/workflow-trigger/utils/getTriggerDefaultDefinition';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
import { MenuItem } from 'twenty-ui';

const StyledActionListContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;

  padding-block: ${({ theme }) => theme.spacing(1)};
  padding-inline: ${({ theme }) => theme.spacing(2)};
`;

export const RightDrawerWorkflowSelectTriggerTypeContent = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { updateTrigger } = useUpdateWorkflowVersionTrigger({ workflow });

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);
  const { openWorkflowEditStepInCommandMenu } = useCommandMenu();

  const handleTriggerTypeClick = ({
    type,
    defaultLabel,
    icon,
  }: {
    type: WorkflowTriggerType;
    defaultLabel: string;
    icon: string;
  }) => {
    return async () => {
      await updateTrigger(
        getTriggerDefaultDefinition({
          defaultLabel,
          type,
          activeObjectMetadataItems,
        }),
      );

      setWorkflowSelectedNode(TRIGGER_STEP_ID);

      openWorkflowEditStepInCommandMenu(
        workflow.id,
        defaultLabel,
        getIcon(icon),
      );
    };
  };

  return (
    <StyledActionListContainer>
      {TRIGGER_TYPES.map((action) => (
        <MenuItem
          key={action.type}
          LeftIcon={action.icon}
          text={action.name}
          onClick={async () => {
            await updateTrigger(
              getTriggerDefaultDefinition({
                type: action.type,
                activeObjectMetadataItems,
              }),
            );

            setWorkflowSelectedNode(TRIGGER_STEP_ID);

            openRightDrawer(RightDrawerPages.WorkflowStepEdit);
          }}
        />
      ))}
    </StyledActionListContainer>
  );
};
