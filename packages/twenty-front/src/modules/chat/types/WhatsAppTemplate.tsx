export type WhatsAppTemplate = {
  id: string;
  status: string;
  name: string;
  language: string;
  parameter_format: string;
  category: string;
  components: WhatsAppTemplateComponent[];
};

export type WhatsAppTemplateComponent = {
  format: string;
  text: string;
  type: string;
};
