import { z } from 'zod';

export const chatbotFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  status: z.enum(['ACTIVE', 'DRAFT', 'DISABLED']),
  inboxId: z.string().min(1, 'Inbox is required'),
});

export type ChatbotFormValues = z.infer<typeof chatbotFormSchema>;
