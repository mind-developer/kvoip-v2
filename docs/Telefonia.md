# Módulo de Telefonia
Este documento detalha as funcionalidades e fluxos do módulo de Telefonia, abrangendo tanto o frontend quanto o backend.

## 1. Visão Geral
O módulo de Telefonia permite a integração e gerenciamento de funcionalidades de voz sobre IP (VoIP), incluindo softphone, planos de discagem, URAs (Unidades de Resposta Audível), PABX, DIDs (Direct Inward Dialing) e gerenciamento de chamadas. Ele é composto por módulos no `twenty-front` (para a interface do usuário) e no `twenty-server` (para a lógica de negócio e integração com sistemas de telefonia).

## 2. Frontend (`packages/twenty-front`)
O frontend é responsável por toda a interação do usuário com as funcionalidades de telefonia.

### 2.1. Softphone (`packages/twenty-front/src/modules/softphone`)
O módulo de softphone fornece a interface para o usuário realizar e receber chamadas diretamente do CRM.

#### Componentes:
-  `DTMFButton.tsx`: Botão para envio de tons DTMF (Dual-Tone Multi-Frequency), usado para interagir com URAs ou extensões.
-  `HoldButton.tsx`: Botão para colocar uma chamada em espera.
-  `Keyboard.tsx`: Componente de teclado numérico para discagem.
-  `StatusPill.tsx`: Componente que exibe o status atual da chamada (conectado, chamando, etc.).
-  `TransferButton.tsx`: Botão para transferir chamadas.
-  `WebSoftphone.tsx`: O componente principal que integra todas as funcionalidades do softphone.
- 
#### Hooks:@license Enterprise
-  `useRingTone.tsx`: Hook para gerenciar os toques de chamada (ringtone).
- 
#### Tipos:
-  `callState.ts`: Define o estado atual de uma chamada (ex: `onCall`, `ringing`, `idle`).
-  `callStatusEnum.ts`: Enumeração para os diferentes status de uma chamada.
-  `sipConfig.ts`: Tipagem para a configuração do SIP (Session Initiation Protocol).

#### Utilitários:
-  `formatTime.ts`: Formata o tempo de duração da chamada.
-  `generateAuthorizationHa1.ts`: Gera o hash de autorização HA1 para autenticação SIP.
-  `RingToneManager.ts`: Gerencia a reprodução de toques.

#### Constantes:
-  `defaultCallState.ts`: Estado inicial padrão para as chamadas.
-  `defaultConfig.ts`: Configurações padrão para o softphone.

### 2.2. Configurações de Central de Serviço - Telefonia (`packages/twenty-front/src/modules/settings/service-center/telephony`)
Este módulo permite aos administradores configurar e gerenciar diversos aspectos da telefonia no sistema.

#### Hooks:
-  `useCreateTelephony.ts`: Hook para criar novas configurações de telefonia.
-  `useFindAllCallFlow.ts`: Busca todos os fluxos de chamada configurados.
-  `useFindAllDialingPlans.ts`: Busca todos os planos de discagem.
-  `useFindAllDids.ts`: Busca todos os números DID (Direct Inward Dialing).
-  `useFindAllPABX.ts`: Busca todas as configurações de PABX.
-  `useFindAllTelephony.ts`: Busca todas as configurações gerais de telefonia.
-  `useFindAllURAs.ts`: Busca todas as configurações de URA.
-  `useGetUserSoftfone.ts`: Obtém as configurações de softphone de um usuário específico.
-  `useUpdateTelephony.ts`: Hook para atualizar configurações de telefonia existentes.

#### Tipos:
-  `SettingsServiceCenterTelephony.ts`: Tipagem de dados relacionados às configurações de telefonia na central de serviço.

#### Componentes:
-  `forms/options.ts`: Opções para formulários de configuração.
-  `forms/SettingsServiceCenterTelephonyForm.tsx`: Formulário para criar ou editar configurações de telefonia.
-  `SettingsServiceCenterItemTableRow.tsx`: Linha da tabela para exibir um item de configuração de telefonia.
-  `SettingsServiceCenterTabContent.tsx`: Conteúdo da aba de telefonia nas configurações da central de serviço.

#### Utilitários:
-  `password.ts`: Utilitários relacionados a senhas (provavelmente para credenciais SIP).
  
#### GraphQL:
-  **Mutações:**
-  `mutations/createTelephony.ts`: Mutação para criar uma nova configuração de telefonia.
-  `mutations/updateAgent.ts`: Mutação para atualizar um agente (pode estar relacionado a extensões ou usuários de softphone).

-  **Queries:**
-  `queries/getAllCallFlows.ts`: Query para obter todos os fluxos de chamada.
-  `queries/getAllDialingPlans.ts`: Query para obter todos os planos de discagem.
-  `queries/getAllDids.ts`: Query para obter todos os DIDs.
-  `queries/getAllPABX.ts`: Query para obter todas as configurações de PABX.
-  `queries/getAllTelephonys.ts`: Query para obter todas as configurações gerais de telefonia.
-  `queries/getAllURAs.ts`: Query para obter todas as URAs.
-  `queries/getUserSoftfone.ts`: Query para obter as configurações de softphone de um usuário.

## 3. Backend (`packages/twenty-server`)
O backend é responsável pela lógica de negócio, persistência de dados e integração com provedores de telefonia.

### 3.1. Módulo Core de Telefonia (`packages/twenty-server/src/engine/core-modules/telephony`)
Contém a lógica central e os serviços para o funcionamento da telefonia.

#### Serviços:
-  `pabx.service.ts`: Serviço que lida com a lógica de PABX, incluindo criação, atualização e gerenciamento de entidades PABX.
-  `telephony.service.ts`: Serviço principal que orquestra as operações de telefonia, gerenciando call flows, dialing plans, DIDs, etc.

### 3.2. Módulo de Telefonia (`packages/twenty-server/src/modules/telephony`)
Este módulo agrupa os tipos de dados, DTOs e interfaces para o módulo de telefonia.

#### Tipos:
-  `Campaign.type.ts`: Tipagens relacionadas a campanhas de chamadas.
-  `Create/index.ts`, `Create/InsereEmpresa.type.ts`, `Create/InsereTronco.type.ts`, `Create/PabxCompanyResponse.type.ts`, `Create/PabxDialingPlanResponse.type.ts`, `Create/PabxTrunkResponse.type.ts`, `Create/UpdateRoutingRulesResponse.type.ts`: Tipagem para operações de criação, incluindo empresas PABX, troncos, planos de discagem e regras de roteamento.
-  `Delete/index.ts`: Tipagem para operações de exclusão.
-  `Extention.type.ts`: Tipagem para extensões.
-  `GetAll/index.ts`, `GetAll/PABXReturn.ts`: Tipagens para operações de busca, incluindo retorno de PABX.
-  `GetOne/FindOne.type.ts`: Tipagem para buscar uma única entidade.
-  `pabx.type.ts`: Tipagens genéricas para PABX.
-  `regions.type.ts`: Tipagem para regiões geográficas.
-  `SetupPabxEnvironmentResponse.type.ts`: Resposta da configuração do ambiente PABX.
-  `TelephonyCallFlow.ts`: Tipagem para fluxos de chamada.
-  `TelephonyDialingPlan.type.ts`: Tipagem para planos de discagem.
-  `TelephonyDids.type.ts`: Tipagens para DIDs.
-  `TelephonyExtension.type.ts`: Tipagem para extensões de telefonia.
-  `Update/index.ts`: Tipagem para operações de atualização.

#### Objetos Padrão:
-  `telephony.workspace-entity.ts`: Entidade de workspace relacionada à telefonia para gerenciamento de dados de telefonia em nível de workspace.

#### DTOs (Data Transfer Objects):
-  `create-dialing-plan.input.ts`: DTO para criar um plano de discagem.
-  `create-pabx-company.input.ts`: DTO para criar uma empresa PABX.
-  `create-pabx-trunk.input.ts`: DTO para criar um tronco PABX.
-  `create-telephony.input.ts`: DTO para criar uma configuração geral de telefonia.
-  `pabx-company-creation-details.input.ts`: Detalhes para criação de empresa PABX.
-  `pabx-dialing-plan-creation-details.input.ts`: Detalhes para criação de plano de discagem PABX.
-  `pabx-trunk-creation-details.input.ts`: Detalhes para criação de tronco PABX.
-  `region.input.ts`: DTO para informações de região.
-  `routing-rule.input.ts`: DTO para regras de roteamento.
-  `setup-pabx-environment.input.ts`: DTO para configurar o ambiente PABX.
-  `tarifa-tronco.input.ts`: DTO para tarifas de tronco.
-  `update-routing-rules-data.input.ts`, `update-routing-rules.input.ts`: DTOs para atualizar regras de roteamento.
-  `update-telephony.input.ts`: DTO para atualizar configurações de telefonia.

#### Interfaces:
-  `pabxService.interface.ts`: Interface para o serviço PABX, definindo o contrato das operações PABX.

## 4. Utilitários Compartilhados (`packages/twenty-shared/src`)
Alguns utilitários de validação de telefone são usados em todo o sistema e são relevantes para o módulo de telefonia.

#### Utilitários:
-  `utils/validation/phones-value/getCountryCodesForCallingCode.ts`: Retorna os códigos de país para um código de chamada específico.
-  `utils/validation/phones-value/isValidCountryCode.ts`: Valida se um código de país é válido.

## 5. Fluxos Principais

### 5.1. Fluxo de Softphone
1.  **Configuração Inicial**: O softphone é configurado com base nas credenciais SIP e outras configurações fornecidas pelo backend (via `useGetUserSoftfone.ts`).
2.  **Discagem**: O usuário insere um número usando o `Keyboard.tsx` ou clica para chamar.
3.  **Início da Chamada**: A chamada é iniciada, o estado da chamada é atualizado via `callState.ts` e o `StatusPill.tsx` reflete o status.
4.  **Gerenciamento de Chamada**: Durante a chamada, o usuário pode usar `HoldButton.tsx` para colocar em espera, `TransferButton.tsx` para transferir ou `DTMFButton.tsx` para interagir com URAs.
5.  **Encerramento da Chamada**: A chamada é encerrada e o estado do softphone é redefinido.

### 5.2. Fluxo de Gerenciamento de Configurações de Telefonia (Admin)
1.  **Acesso às Configurações**: Um administrador acessa a seção de configurações de telefonia na central de serviço.
2.  **Visualização**: `useFindAllTelephony.ts`, `useFindAllCallFlow.ts`, `useFindAllDialingPlans.ts`, `useFindAllDids.ts`, `useFindAllPABX.ts`, `useFindAllURAs.ts` são usados para carregar e exibir as configurações existentes.
3.  **Criação/Edição**: O administrador usa `SettingsServiceCenterTelephonyForm.tsx` para criar novas configurações (via `useCreateTelephony.ts` e `createTelephony.ts` no GraphQL) ou editar existentes (via `useUpdateTelephony.ts` e mutações GraphQL).
4.  **Persistência**: As alterações são enviadas ao backend através dos DTOs apropriados (`create-telephony.input.ts`, `update-telephony.input.ts`, etc.) e processadas pelos serviços (`telephony.service.ts`, `pabx.service.ts`).

### 5.3. Fluxo de Integração PABX
1.  **Criação de Empresa PABX**: Um PABX é configurado no sistema através de `create-pabx-company.input.ts` e o serviço `pabx.service.ts`.
2.  **Gerenciamento de Troncos**: Troncos são adicionados ou gerenciados via `create-pabx-trunk.input.ts`.
3.  **Planos de Discagem e Regras de Roteamento**: `create-dialing-plan.input.ts` e `routing-rule.input.ts` são utilizados para configurar como as chamadas são roteadas.
4.  **Configuração de Ambiente PABX**: `setup-pabx-environment.input.ts` é usado para configurar o ambiente geral do PABX.

## 6. Pontos Importantes
-  **Modularidade**: O módulo é bem dividido entre frontend e backend, e dentro de cada um, em responsabilidades menores (componentes, hooks, serviços, DTOs).
-  **GraphQL**: O frontend interage com o backend principalmente através de queries e mutações GraphQL para buscar e manipular dados de telefonia.
-  **Validação de Dados**: Utiliza utilitários de validação de telefone do `twenty-shared` para garantir a integridade dos dados relacionados a números de telefone.
-  **Autenticação SIP**: O `generateAuthorizationHa1.ts` no frontend sugere a autenticação baseada em SIP para o softphone.
-  **Gerenciamento de Estado**: O `callState.ts` no frontend é crucial para o gerenciamento do estado da chamada no softphone.
-  **Configurabilidade**: O módulo de configurações permite uma alta configurabilidade de aspectos como planos de discagem, URAs e PABX.

Este documento serve como um guia abrangente para entender a arquitetura e as funcionalidades do módulo de Telefonia.
