import { z } from 'zod';

export const chatbotFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  status: z.enum(['ACTIVE', 'DRAFT', 'DISABLED']),
  whatsappIntegrationIds: z.array(z.string()).optional(),
});

export type ChatbotFormValues = z.infer<typeof chatbotFormSchema>;
