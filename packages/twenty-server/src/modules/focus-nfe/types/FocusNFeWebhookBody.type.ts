export type StatusNotaFiscal =
  | 'processando_autorizacao'
  | 'autorizado'
  | 'cancelado'
  | 'erro_autorizacao'
  | 'denegado';

export interface FocusNFeWebhookBodyNFCom {
  cnpj_emitente: string;
  ref: string;
  status: StatusNotaFiscal;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  chave?: string;
  numero?: string;
  serie?: string;
  modelo?: string;
  caminho_xml?: string;
  caminho_danfecom?: string;
  caminho_xml_cancelamento?: string;
}

export interface FocusNFeWebhookBodyNFSe {
  cnpj_prestador: string;
  ref: string;
  numero_rps: string;
  serie_rps: string;
  status: StatusNotaFiscal;
  numero?: string;
  codigo_verificacao?: string;
  data_emissao?: string;
  url?: string;
  caminho_xml_nota_fiscal?: string;
  caminho_xml_cancelamento?: string;
  erros?: {
    codigo: string;
    mensagem: string;
    correcao: string;
  };
}

export type FocusNFeWebhookBody =
  | FocusNFeWebhookBodyNFSe
  | FocusNFeWebhookBodyNFCom;
