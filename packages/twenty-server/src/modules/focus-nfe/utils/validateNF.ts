import { NFCom, NFSe } from 'src/modules/focus-nfe/types/NotaFiscal.type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValidField(field: any): boolean {
  if (typeof field === 'string') return field.trim() !== '';
  if (typeof field === 'boolean') return true;
  if (Array.isArray(field)) return field.length > 0;

  return field !== undefined && field !== null;
}

export function validateNFSe(nfse: NFSe): boolean {
  const fieldMap: Record<string, unknown> = {
    data_emissao: nfse.data_emissao,
    prestador_cnpj: nfse.prestador?.cnpj,
    prestador_inscricao_municipal: nfse.prestador?.inscricao_municipal,
    prestador_codigo_municipio: nfse.prestador?.codigo_municipio,
    tomador_cnpj: nfse.tomador?.cnpj,
    tomador_razao_social: nfse.tomador?.razao_social,
    tomador_email: nfse.tomador?.email,
    tomador_endereco_logradouro: nfse.tomador?.endereco?.logradouro,
    tomador_endereco_codigo_municipio: nfse.tomador?.endereco?.codigo_municipio,
    tomador_endereco_uf: nfse.tomador?.endereco?.uf,
    tomador_endereco_cep: nfse.tomador?.endereco?.cep,
    servico_aliquota: nfse.servico?.aliquota,
    servico_discriminacao: nfse.servico?.discriminacao,
    servico_iss_retido: nfse.servico?.iss_retido,
    servico_item_lista_servico: nfse.servico?.item_lista_servico,
    servico_valor_servicos: nfse.servico?.valor_servicos,
    servico_codigo_municipio: nfse.servico?.codigo_municipio,
  };

  const missingFields = Object.entries(fieldMap).filter(
    ([_, value]) => !isValidField(value),
  );

  if (missingFields.length > 0) {
    console.warn(
      'NFSe validation failed. Missing or invalid fields:',
      Object.fromEntries(missingFields.map(([key]) => [key, false])),
    );

    return false;
  }

  return true;
}

export function validateNFCom(nfcom: NFCom): boolean {
  const fieldMap: Record<string, unknown> = {
    bairro_destinatario: nfcom.bairro_destinatario,
    bairro_emitente: nfcom.bairro_emitente,
    cep_destinatario: nfcom.cep_destinatario,
    cep_emitente: nfcom.cep_emitente,
    cnpj_destinatario: nfcom.cnpj_destinatario,
    cnpj_emitente: nfcom.cnpj_emitente,
    codigo_assinante: nfcom.codigo_assinante,
    codigo_municipio_destinatario: nfcom.codigo_municipio_destinatario,
    data_emissao: nfcom.data_emissao,
    finalidade_nfcom: nfcom.finalidade_nfcom,
    ie_virtual_emitente: nfcom.ie_virtual_emitente,
    indicador_ie_destinatario: nfcom.indicador_ie_destinatario,
    inscricao_estadual_emitente: nfcom.inscricao_estadual_emitente,
    logradouro_destinatario: nfcom.logradouro_destinatario,
    logradouro_emitente: nfcom.logradouro_emitente,
    municipio: nfcom.municipio,
    municipio_destinatario: nfcom.municipio_destinatario,
    nome_destinatario: nfcom.nome_destinatario,
    nome_emitente: nfcom.nome_emitente,
    numero_destinatario: nfcom.numero_destinatario,
    numero_emitente: nfcom.numero_emitente,
    numero_site: nfcom.numero_site,
    regime_tributario_emitente: nfcom.regime_tributario_emitente,
    tipo_assinante: nfcom.tipo_assinante,
    tipo_servico: nfcom.tipo_servico,
    uf_destinatario: nfcom.uf_destinatario,
    uf_emitente: nfcom.uf_emitente,
    itens: nfcom.itens,
  };

  const missingFields = Object.entries(fieldMap).filter(
    ([_, value]) => !isValidField(value),
  );

  if (missingFields.length > 0) {
    console.warn(
      'NFCom validation failed. Missing or invalid fields:',
      Object.fromEntries(missingFields.map(([key]) => [key, false])),
    );

    return false;
  }

  return true;
}
