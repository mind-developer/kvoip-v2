export interface Regiao {
  regiao_id: number;
  nome: string;
}

export interface ListRegionsResponse {
  http_response_code: number;
  qtd_total_resultados: number;
  qtd_resultados_retornados: number;
  mensagem: string;
  dados: Regiao[];
}
