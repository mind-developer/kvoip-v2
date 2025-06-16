export type FocusNfeIntegration = {
  id: string;
  name: string;
  token?: string;
  status?: string;
  companyName: string;
  cnpj: string;
  cpf: string | null;
  ie: string | null;
  inscricaoMunicipal: string;
  cnaeCode: string | null;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  taxRegime: string;
};
