import { formatInTimeZone } from 'date-fns-tz';

import { NFCom, NFSe } from 'src/modules/focus-nfe/types/NotaFiscal.type';
import { NotaFiscalWorkspaceEntity } from 'src/modules/nota-fiscal/standard-objects/nota-fiscal.workspace.entity';
import { ProductWorkspaceEntity } from 'src/modules/product/standard-objects/product.workspace-entity';

export const buildNFSePayload = (
  notaFiscal: NotaFiscalWorkspaceEntity,
  codMunicipioPrestador: string,
  codMunicipioTomador: string,
  numeroRps: number,
): NFSe | undefined => {

  const { company, focusNFe } = notaFiscal;

  if (!company || !focusNFe?.token) {
    // this.logger.log('Compania ou integração não encontradas.')
    return;
  }

  const nextNumRps = (numeroRps + 1).toString();

  const nfse: NFSe = {
    data_emissao: getCurrentFormattedDateNFSe(),
    serie_dps: '1',
    numero_dps: nextNumRps, // Incremental, deve ser pela ultima RPS gerada
    prestador: {
      cnpj: focusNFe?.cnpj || focusNFe?.cpf || '',
      inscricao_municipal: focusNFe?.inscricaoMunicipal || '',
      codigo_municipio: codMunicipioPrestador,
    },
    tomador: {
      cnpj: company.cpfCnpj || '',
      razao_social: company.name,
      email: company.emails.primaryEmail,
      endereco: {
        logradouro: company.address.addressStreet1,
        numero: company.address.addressNumber,
        bairro: company.address.addressStreet2,
        codigo_municipio: codMunicipioTomador,
        uf: company.address.addressState,
        cep: company.address.addressPostcode,
      },
    },
    servico: {
      aliquota: notaFiscal.aliquotaIss,
      discriminacao: notaFiscal.discriminacao,
      iss_retido: notaFiscal.issRetido,
      item_lista_servico: notaFiscal.itemListaServico,
      codigo_municipio: codMunicipioPrestador,
      valor_servicos:
        (Number(notaFiscal.totalAmount) * (notaFiscal.percentNfse ?? 100)) /
        100,
    },
  };

  return nfse;
};

const cleanCep = (cep: string | number) => {
  if (!cep) return '';
  return cep.toString().replace(/\D/g, '').padStart(8, '0');
};

export function buildNFComPayload(
  notaFiscal: NotaFiscalWorkspaceEntity,
  codMunicipioEmitente: string,
  codMunicipioDestinatario: string,
  product: ProductWorkspaceEntity,
): NFCom | undefined {
  const { company, focusNFe } = notaFiscal;

  if (!company || !focusNFe?.token) {
    this.logger.log('Compania ou integração não encontradas.')
    return;
  }

  const percentNfcom = notaFiscal.percentNfcom ?? 100;
  const valueBase = Number(notaFiscal.totalAmount) || 0;
  const unit = Number(notaFiscal.unidade) || 1;
  const percentageValue = valueBase * (percentNfcom / 100);

  return {
    data_emissao: getCurrentFormattedDate(),
    numero_site: "0",
    municipio: codMunicipioEmitente,
    finalidade_nfcom: 0, // NFCom normal

    cnpj_emitente: focusNFe.cnpj?.replace(/\D/g, '') || '',
    ie_virtual_emitente: focusNFe.ie?.replace(/\D/g, '') || '',
    inscricao_estadual_emitente: focusNFe.ie?.replace(/\D/g, '') || '',

    cnpj_destinatario: company.cpfCnpj?.replace(/\D/g, '') || '',
    // cnpj_destinatario: '',
    // cpf_destinatario: company.cpfCnpj?.replace(/\D/g, '') || '',
    indicador_ie_destinatario: (company.inscricaoEstadual && company.inscricaoEstadual.length > 0) ? 1 : 9, // 1 - Contribuinte, 9 - Não Contribuinte, que pode ou não possuir Inscrição Estadual no Cadastro de Contribuintes do ICMS
    logradouro_destinatario: company.address.addressStreet1,
    numero_destinatario: company.address.addressNumber,
    bairro_destinatario: company.address.addressStreet2,
    codigo_municipio_destinatario: codMunicipioDestinatario,
    municipio_destinatario: company.address.addressCity,
    cep_destinatario: cleanCep(company.address.addressPostcode),
    uf_destinatario: company.address.addressState,
    uf_emitente: focusNFe.state,
    inscricao_municipal_destinatario: company.inscricaoMunicipal?.replace(/\D/g, '') || '',
    inscricao_estadual_destinatario: company.inscricaoEstadual?.replace(/\D/g, '') || '',

    codigo_assinante: notaFiscal.codAssinante,
    // codigo_assinante: "1",
    tipo_assinante: 1, // Comercial - 1, Pessoa Física - 3
    tipo_servico: 1, // Telefonia
    numero_contato_assinante: notaFiscal.numContratoAssinante,
    // numero_contato_assinante: "1234",

    data_inicio_contrato: getCurrentFormattedDate(),
    itens: [
      {
        numero_item: "1",
        codigo_produto: product.id,
        // codigo_produto: "1234",
        descricao: product.name,
        classificacao: notaFiscal.classificacao, // Assinatura de serviços de comunicação multimídia
        // unidade_medida: Number(product.unitOfMeasure),
        unidade_medida: 4, // UN - Unidade
        cfop: notaFiscal.cfop,
        quantidade_faturada: notaFiscal.unidade,
        // quantidade_faturada: "1.00",
        valor_item: percentageValue,
        // valor_item:"1.00",
        valor_total_item: unit * percentageValue,
        // valor_total_item: "1.00",
        icms_situacao_tributaria: notaFiscal.cstIcmsCsosn || '',
      },
    ],

    // versao_aplicativo: '100',

    email_destinatario: company.emails.primaryEmail,
    indicador_cessao: 1, // Dispensa geração do grupo Fatura. Apenas para notas dos tipos Normal e Substituição com tipo de faturamento normal
    codigo_municipio_emitente: codMunicipioEmitente,

    regime_tributario_emitente: 1, // Simples Nacional
    nome_emitente: focusNFe.companyName || '',
    logradouro_emitente: focusNFe.street,
    numero_emitente: focusNFe.number,
    bairro_emitente: focusNFe.neighborhood,
    nome_destinatario: company.name,
    cep_emitente: cleanCep(focusNFe.cep),
  };
}

export const getCurrentFormattedDate = (): string => {
  return formatInTimeZone(
    new Date(),
    'America/Sao_Paulo',
    "yyyy-MM-dd'T'HH:mm:ss",
  );
};

export const getCurrentFormattedDateNFSe = () => {
  const date = new Date();
  const offset = -3 * 60; // UTC-3
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const local = new Date(utc + (offset * 60000));
  return local.toISOString().slice(0, 19) + '-03:00';
}
