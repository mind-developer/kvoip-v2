import { formatInTimeZone } from 'date-fns-tz';

import { NFCom, NFSe } from 'src/modules/focus-nfe/types/NotaFiscal.type';
import { NotaFiscalWorkspaceEntity } from 'src/modules/nota-fiscal/standard-objects/nota-fiscal.workspace.entity';

export const buildNFSePayload = (
  notaFiscal: NotaFiscalWorkspaceEntity,
  codMunicipioPrestador: string,
  codMunicipioTomador: string,
): NFSe | undefined => {
  const { product, company, focusNFe } = notaFiscal;

  if (!product || !company || !focusNFe?.token) return;

  const nfse: NFSe = {
    data_emissao: new Date().toISOString(),
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
      valor_servicos: Number(notaFiscal.totalAmount),
    },
  };

  return nfse;
};

export function buildNFComPayload(
  notaFiscal: NotaFiscalWorkspaceEntity,
  codMunicipioEmitente: string,
  codMunicipioDestinatario: string,
): NFCom | undefined {
  const { company, product, focusNFe } = notaFiscal;

  if (!company || !product || !focusNFe?.token) return;

  return {
    data_emissao: getCurrentFormattedDate(),
    numero_site: '0',
    municipio: codMunicipioEmitente,
    finalidade_nfcom: '0', // NFCom normal
    versao_aplicativo: '100',
    cnpj_emitente: focusNFe.cnpj || '',
    cnpj_destinatario: company.cpfCnpj || '',
    inscricao_estadual_emitente: focusNFe.ie || '',
    ie_virtual_emitente: focusNFe.ie || '',
    regime_tributario_emitente: '1', // Simples Nacional
    nome_emitente: focusNFe.companyName || '',
    logradouro_emitente: focusNFe.street,
    numero_emitente: focusNFe.number,
    bairro_emitente: focusNFe.neighborhood,
    uf_emitente: focusNFe.state,
    cep_emitente: focusNFe.cep,
    codigo_municipio_emitente: codMunicipioEmitente,
    codigo_municipio_destinatario: codMunicipioDestinatario,
    nome_destinatario: company.name,
    indicador_ie_destinatario: '9', // Não Contribuinte, que pode ou não possuir Inscrição Estadual no Cadastro de Contribuintes do ICMS
    logradouro_destinatario: company.address.addressStreet1,
    numero_destinatario: company.address.addressNumber,
    bairro_destinatario: company.address.addressStreet2,
    municipio_destinatario: company.address.addressCity,
    uf_destinatario: company.address.addressState,
    cep_destinatario: company.address.addressPostcode,
    codigo_assinante: notaFiscal.codAssinante,
    tipo_assinante: '1', // Comercial
    tipo_servico: '1', // Telefonia
    numero_contato_assinante: notaFiscal.numContratoAssinante,
    data_inicio_contrato: getCurrentFormattedDate(),
    indicador_cessao: '1', // Dispensa geração do grupo Fatura. Apenas para notas dos tipos Normal e Substituição com tipo de faturamento normal
    itens: [
      {
        cfop: notaFiscal.cfop,
        classificacao: notaFiscal.classificacao, // Assinatura de serviços de comunicação multimídia
        codigo_produto: product.id,
        descricao: product.name,
        icms_situacao_tributaria: notaFiscal.cstIcmsCsosn || '',
        numero_item: '1',
        quantidade_faturada: notaFiscal.unidade,
        unidade_medida: Number(product.unitOfMeasure),
        valor_item: notaFiscal.totalAmount || '',
        valor_total_item:
          String(Number(notaFiscal.unidade) * Number(notaFiscal.totalAmount)) ||
          '',
      },
    ],
  };
}

const getCurrentFormattedDate = (): string => {
  return formatInTimeZone(
    new Date(),
    'America/Sao_Paulo',
    "yyyy-MM-dd'T'HH:mm:ss",
  );
};
