import { gql } from '@apollo/client';

export const GET_EXTERNAL_EXTENSION = gql`
  query GetExternalExtension($workspaceId: ID!, $extNum: String) {
    getExternalExtension(workspaceId: $workspaceId, extNum: $extNum) {
      ramal_id
      cliente_id
      nome
      tipo
      usuario_autenticacao
      numero
      senha_sip
      senha_web
      caller_id_externo
      grupo_ramais
      centro_custo
      plano_discagem_id
      grupo_musica_espera
      puxar_chamadas
      habilitar_timers
      habilitar_blf
      escutar_chamadas
      gravar_chamadas
      bloquear_ramal
      codigo_incorporacao
      codigo_area
      habilitar_dupla_autenticacao
      dupla_autenticacao_ip_permitido
      dupla_autenticacao_mascara
      encaminhar_todas_chamadas {
        encaminhamento_tipo
        encaminhamento_destino {
          tipo
          destino
        }
        encaminhamento_destinos {
          tipo
          destino
        }
      }
      encaminhar_offline_sem_atendimento {
        encaminhamento_tipo
        encaminhamento_destino {
          tipo
          destino
        }
        encaminhamento_destinos {
          tipo
          destino
        }
      }
      encaminhar_ocupado_indisponivel {
        encaminhamento_tipo
        encaminhamento_destino {
          tipo
          destino
        }
        encaminhamento_destinos {
          tipo
          destino
        }
      }
    }
  }
`;