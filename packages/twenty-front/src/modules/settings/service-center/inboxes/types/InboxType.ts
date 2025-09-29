import { Agent } from '@/settings/service-center/agents/types/Agent';

export type Inbox = {
  id: string;
  agents: Agent[];
  chatIntegration?: string;
};
