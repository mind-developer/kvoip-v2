export type IWhatsappIntegration = {
  id: string;
  name: string;
  phoneId: string;
  businessAccountId: string;
  accessToken: string;
  appId: string;
  appKey: string;
  disabled: boolean;
  sla: number;
  chatbot?: {
    id: string;
    name: string;
  };
  tipoApi: string;
};
