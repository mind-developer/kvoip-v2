import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { useTriggerNodeSelection } from '@/workflow/workflow-diagram/hooks/useTriggerNodeSelection';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { WorkflowDiagramNode } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { OnSelectionChangeParams, useOnSelectionChange } from '@xyflow/react';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

export const WorkflowDiagramCanvasReadonlyEffect = () => {
  const { openRightDrawer, closeRightDrawer } = useRightDrawer();
  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);
  const { openWorkflowViewStepInCommandMenu } = useCommandMenu();

  const workflowId = useRecoilValue(workflowIdState);

  const handleSelectionChange = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      const selectedNode = nodes[0] as WorkflowDiagramNode | undefined;

      if (!isDefined(selectedNode)) {
        return;
      }

      setWorkflowSelectedNode(selectedNode.id);
      setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
      openRightDrawer(RightDrawerPages.WorkflowStepView);
    },
    [
      setWorkflowSelectedNode,
      setHotkeyScope,
      openRightDrawer,
      closeRightDrawer,
      closeCommandMenu,
    ],
  );

  useOnSelectionChange({
    onChange: handleSelectionChange,
  });

  useTriggerNodeSelection();

  return null;
};
