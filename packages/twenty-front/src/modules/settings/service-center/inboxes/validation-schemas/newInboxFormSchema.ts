import { z } from 'zod';

export const newInboxFormSchema = z.object({
  name: z.string().min(4, 'Name must be at least 4 characters'),
  icon: z.string().min(1, 'Icon is required'),
  whatsappIntegrationId: z
    .string()
    .nullable()
    .or(z.literal(''))
    .transform((val) => val || null),
});

export type NewInboxFormValues = z.infer<typeof newInboxFormSchema>;
