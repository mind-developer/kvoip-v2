import { z } from 'zod';

export const newSectorFormSchema = z.object({
  name: z.string().min(4, 'Name must be at least 4 characters'),
  icon: z.string().min(1, 'Icon is required'),
  agentIds: z.array(z.string()).optional(),
});

export type NewSectorFormValues = z.infer<typeof newSectorFormSchema>;
