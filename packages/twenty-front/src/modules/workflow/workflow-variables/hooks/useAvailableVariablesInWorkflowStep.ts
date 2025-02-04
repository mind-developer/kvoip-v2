import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { getStepDefinitionOrThrow } from '@/workflow/utils/getStepDefinitionOrThrow';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import {
  OutputSchema,
  StepOutputSchema,
} from '@/workflow/workflow-variables/types/StepOutputSchema';
import { filterOutputSchema } from '@/workflow/workflow-variables/utils/filterOutputSchema';
import { isEmptyObject } from '@tiptap/core';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useAvailableVariablesInWorkflowStep = ({
  objectNameSingularToSelect,
}: {
  objectNameSingularToSelect?: string;
}): StepOutputSchema[] => {
  const workflowSelectedNode = useWorkflowSelectedNodeOrThrow();
  const flow = useFlowOrThrow();

  const steps = flow.steps ?? [];

  const previousStepIds: string[] = [];

  for (const step of steps) {
    if (step.id === workflowSelectedNode) {
      break;
    }
    previousStepIds.push(step.id);
  }

  const availableStepsOutputSchema: StepOutputSchema[] = useRecoilValue(
    stepsOutputSchemaFamilySelector({
      workflowVersionId: flow.workflowVersionId,
      stepIds: [TRIGGER_STEP_ID, ...previousStepIds],
    }),
  );

  if (
    isDefined(workflow.currentVersion.trigger) &&
    isDefined(filteredTriggerOutputSchema) &&
    !isEmptyObject(filteredTriggerOutputSchema)
  ) {
    result.push({
      id: 'trigger',
      name: isDefined(workflow.currentVersion.trigger.name)
        ? workflow.currentVersion.trigger.name
        : getTriggerStepName(workflow.currentVersion.trigger),
      outputSchema: filteredTriggerOutputSchema,
    });
  }

      return {
        id: stepOutputSchema.id,
        name: stepOutputSchema.name,
        icon: stepOutputSchema.icon,
        outputSchema,
      };
    })
    .filter(isDefined);

    if (isDefined(filteredOutputSchema) && !isEmpty(filteredOutputSchema)) {
      result.push({
        id: previousStep.id,
        name: previousStep.name,
        outputSchema: filteredOutputSchema,
        ...(previousStep.type === 'CODE' ? { icon: 'IconCode' } : {}),
      });
    }
  });

  return result;
};
