export type NFSe = {
  data_emissao: string;
  serie_dps: string;
  numero_dps: string;
  prestador: {
    cnpj: string;
    inscricao_municipal: string;
    codigo_municipio: string;
  };
  tomador: {
    cnpj: string;
    razao_social: string;
    email: string;
    endereco: {
      logradouro: string;
      numero?: string;
      complemento?: string;
      bairro?: string;
      codigo_municipio: string;
      uf: string;
      cep: string;
    };
  };
  servico: {
    aliquota: number | null;
    discriminacao: string;
    iss_retido: boolean;
    item_lista_servico: string;
    codigo_tributario_municipio?: string;
    valor_servicos: number;
    codigo_municipio: string;
  };
};

export type NFCom = {
  data_emissao: string;
  numero_site: string | number;
  municipio: string | number;
  finalidade_nfcom: string | number;
  versao_aplicativo?: string;
  cnpj_emitente: string | number;
  cnpj_destinatario?: string | number;
  cpf_destinatario?: string | number;
  inscricao_estadual_emitente: string | number;
  ie_virtual_emitente: string | number;
  regime_tributario_emitente: string | number;
  nome_emitente: string;
  logradouro_emitente?: string;
  numero_emitente?: string;
  bairro_emitente?: string;
  uf_emitente?: string;
  cep_emitente?: string | number;
  codigo_municipio_emitente: string | number;
  codigo_municipio_destinatario: string | number;
  nome_destinatario: string;
  indicador_ie_destinatario: string | number;
  inscricao_estadual_destinatario?: string | number;
  logradouro_destinatario: string;
  numero_destinatario: string;
  bairro_destinatario: string;
  municipio_destinatario: string;
  uf_destinatario: string;
  cep_destinatario?: string | number;
  codigo_assinante: string;
  tipo_assinante: string | number;
  tipo_servico: string | number;
  numero_contato_assinante: string;
  data_inicio_contrato: string;
  indicador_cessao: string | number;
  email_destinatario: string;
  itens: ItemNFCom[];

  data_faturamento?: string;
  inscricao_municipal_destinatario?: string;
};

type ItemNFCom = {
  cfop: string;
  classificacao: string;
  codigo_produto: string;
  descricao: string;
  icms_situacao_tributaria: string;
  numero_item: string;
  quantidade_faturada: string;
  unidade_medida: number;
  valor_item: string | number;
  valor_total_item: string | number;
};

export type InvoiceFocusNFe = NFSe | NFCom;
