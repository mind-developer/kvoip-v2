export type NFSe = {
  data_emissao: string;
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
    aliquota: number;
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
  numero_site: string;
  municipio: string;
  finalidade_nfcom: string;
  versao_aplicativo: string;
  cnpj_emitente: string;
  cnpj_destinatario: string;
  inscricao_estadual_emitente: string;
  ie_virtual_emitente: string;
  regime_tributario_emitente: string;
  nome_emitente: string;
  logradouro_emitente: string;
  numero_emitente: string;
  bairro_emitente: string;
  uf_emitente: string;
  cep_emitente: string;
  codigo_municipio_destinatario: string;
  nome_destinatario: string;
  indicador_ie_destinatario: string;
  logradouro_destinatario: string;
  numero_destinatario: string;
  bairro_destinatario: string;
  municipio_destinatario: string;
  uf_destinatario: string;
  cep_destinatario: string;
  codigo_assinante: string;
  tipo_assinante: string;
  tipo_servico: string;
  itens: ItemNFCom[];
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
  valor_item: string;
  valor_total_item: string;
};

export type FiscalNote = NFSe | NFCom;
