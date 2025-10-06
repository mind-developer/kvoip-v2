import { z } from 'zod';

export const agentFormSchema = z.object({
  workspaceMemberId: z.string().min(1, 'Workspace member is required'),
  sectorId: z.string().min(1, 'Sector is required'),
});

export type AgentFormValues = z.infer<typeof agentFormSchema>;
