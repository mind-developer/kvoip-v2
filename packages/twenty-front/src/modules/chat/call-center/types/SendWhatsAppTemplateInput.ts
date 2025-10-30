export interface SendWhatsAppTemplateInput {
  integrationId: string | null;
  to: string | null;
  from: string | null;
  templateName: string;
  language: string;
  message: string;
  agent: {
    name: string;
    id: string | undefined;
  };
  type: string;
}
