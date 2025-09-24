import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const chatbotIdComponentState = createComponentState<string | undefined>(
  {
    key: 'command-menu/chatbot-id',
    defaultValue: undefined,
    componentInstanceContext: CommandMenuPageComponentInstanceContext,
  },
);
