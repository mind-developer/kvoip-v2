export type NotaFiscal = {
  natureza_operacao: string; // Campo Obrigatório
  data_emissao: string; // Campo Obrigatório - formato: YYYY-MM-DD
  data_entrada_saida: string; // formato: YYYY-MM-DD
  tipo_documento: number; // Campo Obrigatório
  finalidade_emissao: number; // Campo Obrigatório
  cnpj_emitente: string; // Campo Obrigatório
  cpf_emitente: string; // Campo Obrigatório
  nome_emitente: string;
  nome_fantasia_emitente: string;
  logradouro_emitente: string;
  numero_emitente: number;
  bairro_emitente: string;
  municipio_emitente: string;
  uf_emitente: string;
  cep_emitente: string;
  inscricao_estadual_emitente: string; // Campo Obrigatório
  nome_destinatario: string; // Campo Obrigatório
  cpf_destinatario: string;
  inscricao_estadual_destinatario: string | null;
  telefone_destinatario: number;
  logradouro_destinatario: string; // Campo Obrigatório
  numero_destinatario: number; // Campo Obrigatório
  bairro_destinatario: string; // Campo Obrigatório
  municipio_destinatario: string; // Campo Obrigatório
  uf_destinatario: string; // Campo Obrigatório
  pais_destinatario: string;
  cep_destinatario: number;
  valor_frete: number; // Campo Obrigatório
  valor_seguro: number; // Campo Obrigatório
  valor_total: number; // Campo Obrigatório
  valor_produtos: number; // Campo Obrigatório
  modalidade_frete: number; // Campo Obrigatório
  items: ItemNotaFiscal[];
};

type ItemNotaFiscal = {
  numero_item: number; // Campo Obrigatório
  codigo_produto: number; // Campo Obrigatório
  descricao: string; // Campo Obrigatório
  cfop: number; // Campo Obrigatório
  unidade_comercial: string; // Campo Obrigatório
  quantidade_comercial: number; // Campo Obrigatório
  valor_unitario_comercial: number; // Campo Obrigatório
  valor_unitario_tributavel: number;
  unidade_tributavel: string;
  codigo_ncm: number; // Campo Obrigatório
  quantidade_tributavel: number;
  valor_bruto: number; // Campo Obrigatório
  icms_situacao_tributaria: number; // Campo Obrigatório
  icms_origem: number; // Campo Obrigatório
  pis_situacao_tributaria: string; // Campo Obrigatório
  cofins_situacao_tributaria: string; // Campo Obrigatório
};

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
    codigo_tributario_municipio: string;
    valor_servicos: number;
  };
};

export type FiscalNote = NFSe;
