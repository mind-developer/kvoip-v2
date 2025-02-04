import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

export const useStartNodeCreation = () => {
  const setWorkflowCreateStepFromParentStepId = useSetRecoilState(
    workflowCreateStepFromParentStepIdState,
  );
  const { openWorkflowActionInCommandMenu } = useCommandMenu();

  const workflowId = useRecoilValue(workflowIdState);

  /**
   * This function is used in a context where dependencies shouldn't change much.
   * That's why its wrapped in a `useCallback` hook. Removing memoization might break the app unexpectedly.
   */
  const startNodeCreation = useCallback(
    (parentNodeId: string) => {
      setWorkflowCreateStepFromParentStepId(parentNodeId);

      setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
      openRightDrawer(RightDrawerPages.WorkflowStepSelectAction);
    },
    [
      setWorkflowCreateStepFromParentStepId,
      workflowId,
      openWorkflowActionInCommandMenu,
    ],
  );

  return {
    startNodeCreation,
  };
};
