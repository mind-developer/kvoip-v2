export interface RetornoEstrutura {
  id?: number | RetornoEstruturaId;
  status: boolean;
  erro?: string;
}

export interface RetornoEstruturaId {
  $value?: number | string;
}
  