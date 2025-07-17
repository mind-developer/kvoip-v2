import { formatInTimeZone } from 'date-fns-tz';

import { NFCom, NFSe } from 'src/modules/focus-nfe/types/NotaFiscal.type';
import { NotaFiscalWorkspaceEntity } from 'src/modules/nota-fiscal/standard-objects/nota-fiscal.workspace.entity';

export const buildNFSePayload = (
  notaFiscal: NotaFiscalWorkspaceEntity,
  codMunicipioPrestador: string,
  codMunicipioTomador: string,
) => {
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
        numero: '', // Mandatory field, need to change on frontend
        bairro: company.address.addressStreet2,
        codigo_municipio: codMunicipioTomador,
        uf: company.address.addressState,
        cep: company.address.addressZipCode,
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

  const data = new Date();
  const formattedDate = formatInTimeZone(
    data,
    'America/Sao_Paulo',
    "yyyy-MM-dd'T'HH:mm:ss",
  );

  return {
    data_emissao: formattedDate,
    numero_site: '0',
    municipio: codMunicipioEmitente,
    finalidade_nfcom: '0',
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
    indicador_ie_destinatario: '9',
    logradouro_destinatario: company.address.addressStreet1,
    numero_destinatario: '456',
    bairro_destinatario: company.address.addressStreet2,
    municipio_destinatario: company.address.addressCity,
    uf_destinatario: company.address.addressState,
    cep_destinatario: company.address.addressPostcode,
    codigo_assinante: '123598764325', // Mandatory field, must be included in the entity
    tipo_assinante: '1', // Mandatory field, must be included in the entity
    tipo_servico: '1', // Mandatory field, must be included in the entity
    numero_contato_assinante: '1234',
    data_inicio_contrato: formattedDate,
    indicador_cessao: '1',
    itens: [
      {
        cfop: product.cfop,
        classificacao: '0100401', // Mandatory field, must be included in the entity
        codigo_produto: '123', // Mandatory field, must be included in the entity
        descricao: product.name,
        icms_situacao_tributaria: notaFiscal.cstIcmsCsosn || '',
        numero_item: '1',
        quantidade_faturada: product.unidade,
        unidade_medida: Number(product.unitOfMeasure),
        valor_item: notaFiscal.totalAmount || '',
        valor_total_item:
          String(Number(product.unidade) * Number(notaFiscal.totalAmount)) ||
          '',
      },
    ],
  };
}
