# Client Chat Message Subscriptions

Este documento explica como usar as subscriptions do módulo `client-chat-message` no frontend.

## Visão Geral

O módulo `client-chat-message` fornece duas subscriptions GraphQL:

1. **`onClientMessageEvent`** - Para escutar eventos de mensagens de um chat específico
2. **`onClientChatEvent`** - Para escutar eventos de chats de um setor específico

## Arquivos Criados

### GraphQL Subscriptions

- `graphql/subscriptions/onClientMessageEvent.ts` - Subscription para eventos de mensagens
- `graphql/subscriptions/onClientChatEvent.ts` - Subscription para eventos de chats

### Hooks Customizados

- `hooks/useClientMessageSubscription.ts` - Hook para escutar eventos de mensagens
- `hooks/useClientChatSubscription.ts` - Hook para escutar eventos de chats

### Exemplo de Uso

- `components/ClientChatSubscriptionExample.tsx` - Componente de exemplo

## Como Usar

### 1. Subscription de Mensagens

```tsx
import { useClientMessageSubscription } from '../hooks/useClientMessageSubscription';

const MyComponent = ({ chatId }: { chatId: string }) => {
  const handleMessageCreated = (message: ClientChatMessage) => {
    console.log('Nova mensagem:', message);
    // Atualizar lista de mensagens, etc.
  };

  const handleMessageUpdated = (message: ClientChatMessage) => {
    console.log('Mensagem atualizada:', message);
    // Atualizar mensagem específica
  };

  useClientMessageSubscription({
    chatId,
    onMessageCreated: handleMessageCreated,
    onMessageUpdated: handleMessageUpdated,
    onError: (error) => console.error('Erro:', error),
    skip: !chatId, // Pular se não houver chatId
  });

  return <div>Seu componente aqui</div>;
};
```

### 2. Subscription de Chats

```tsx
import { useClientChatSubscription } from '../hooks/useClientChatSubscription';

const MyComponent = ({ sectorId }: { sectorId: string }) => {
  const handleChatCreated = (chat: ClientChat) => {
    console.log('Novo chat:', chat);
    // Adicionar à lista de chats
  };

  const handleChatUpdated = (chat: ClientChat) => {
    console.log('Chat atualizado:', chat);
    // Atualizar chat específico
  };

  useClientChatSubscription({
    sectorId,
    onChatCreated: handleChatCreated,
    onChatUpdated: handleChatUpdated,
    onError: (error) => console.error('Erro:', error),
    skip: !sectorId,
  });

  return <div>Seu componente aqui</div>;
};
```

## Eventos Disponíveis

### ClientMessageEvent

- `CREATED` - Nova mensagem criada
- `UPDATED` - Mensagem atualizada
- `DELETED` - Mensagem deletada (não implementado ainda)

### ClientChatEvent

- `CREATED` - Novo chat criado
- `UPDATED` - Chat atualizado
- `DELETED` - Chat deletado (não implementado ainda)

## Configuração do Backend

O módulo `ClientChatMessageModule` já está configurado no `MetaModule` e exporta:

- `CLIENT_CHAT_MESSAGE_PUB_SUB` - Instância do RedisPubSub
- `ClientChatMessageService` - Serviço para publicar eventos

## Publicando Eventos (Backend)

```typescript
// No seu serviço
constructor(
  private readonly clientChatMessageService: ClientChatMessageService,
) {}

// Publicar nova mensagem
await this.clientChatMessageService.publishMessageCreated(message, chatId);

// Publicar mensagem atualizada
await this.clientChatMessageService.publishMessageUpdated(message, chatId);

// Publicar novo chat
await this.clientChatMessageService.publishChatCreated(chat, sectorId);

// Publicar chat atualizado
await this.clientChatMessageService.publishChatUpdated(chat, sectorId);
```

## Exemplo Completo

Veja o arquivo `ClientChatSubscriptionExample.tsx` para um exemplo completo de como usar ambas as subscriptions em um componente React.

## Notas Importantes

1. **Autenticação**: As subscriptions usam o mesmo token de autenticação do Apollo Client
2. **Filtros**: As subscriptions são filtradas automaticamente pelo `chatId` e `sectorId`
3. **Reconexão**: O `graphql-sse` gerencia automaticamente a reconexão
4. **Performance**: Use `skip: true` quando não precisar da subscription
5. **Cleanup**: Os hooks fazem cleanup automático quando o componente é desmontado
