# Atualização dos Hooks para Usar Novas Subscriptions

Este documento descreve as mudanças feitas nos hooks existentes para usar as novas subscriptions do módulo `client-chat-message`.

## Hooks Atualizados

### 1. `useClientChatsWithPerson.ts`

**Mudanças:**

- ✅ Removido `useOnDbEvent` e `DatabaseEventAction`
- ✅ Adicionado `useClientChatSubscription`
- ✅ Adicionado parâmetro opcional `sectorId?: string`
- ✅ Substituído callbacks `handleNewChats`, `handleUpdatedChats`, `handleDeletedChats` por `handleChatCreated`, `handleChatUpdated`
- ✅ Melhorada a lógica de criação de `ClientChatWithPerson` com dados de pessoa

**Uso:**

```tsx
// Sem subscription (comportamento original)
const { chats, loading } = useClientChatsWithPerson();

// Com subscription para um setor específico
const { chats, loading } = useClientChatsWithPerson(sectorId);
```

### 2. `useClientChatMessages.ts`

**Mudanças:**

- ✅ Removido `useOnDbEvent` e `DatabaseEventAction`
- ✅ Adicionado `useClientMessageSubscription`
- ✅ Substituído callbacks `handleNewMessage`, `handleUpdatedMessage` por `handleMessageCreated`, `handleMessageUpdated`
- ✅ Simplificada a lógica de tratamento de mensagens

**Uso:**

```tsx
// O hook agora usa automaticamente a subscription para o chatId fornecido
const { messages, loading, chatId } = useClientChatMessages(chatId);
```

### 3. `useClientChats.ts`

**Mudanças:**

- ✅ Removido `useOnDbEvent` e `DatabaseEventAction`
- ✅ Adicionado `useClientChatSubscription`
- ✅ Adicionado parâmetro opcional `sectorId?: string`
- ✅ Substituído callbacks `handleNewChat`, `handleUpdatedChat`, `handleDeletedChat` por `handleChatCreated`, `handleChatUpdated`

**Uso:**

```tsx
// Sem subscription (comportamento original)
const { chats, loading } = useClientChats();

// Com subscription para um setor específico
const { chats, loading } = useClientChats(sectorId);
```

## Benefícios das Mudanças

### 🚀 Performance

- **Subscriptions diretas** em vez de eventos de banco de dados genéricos
- **Filtros automáticos** por `chatId` e `sectorId` no backend
- **Menos overhead** de processamento de eventos

### 🔧 Flexibilidade

- **Parâmetros opcionais** para ativar/desativar subscriptions
- **Backward compatibility** - hooks funcionam sem parâmetros
- **Granularidade** - subscriptions específicas por chat ou setor

### 🛡️ Confiabilidade

- **Filtros no backend** garantem que apenas eventos relevantes chegam ao frontend
- **Tratamento de erros** específico para cada subscription
- **Logs detalhados** para debugging

## Migração

### Para Desenvolvedores

#### Antes:

```tsx
// Hooks funcionavam apenas com eventos de banco de dados
const { chats } = useClientChatsWithPerson();
const { messages } = useClientChatMessages(chatId);
const { chats } = useClientChats();
```

#### Depois:

```tsx
// Hooks mantêm compatibilidade, mas agora suportam subscriptions
const { chats } = useClientChatsWithPerson(); // Sem subscription
const { chats } = useClientChatsWithPerson(sectorId); // Com subscription

const { messages } = useClientChatMessages(chatId); // Sempre com subscription

const { chats } = useClientChats(); // Sem subscription
const { chats } = useClientChats(sectorId); // Com subscription
```

### Para Componentes Existentes

**Nenhuma mudança necessária** - os hooks mantêm compatibilidade total com o código existente.

### Para Novos Componentes

**Recomendado** usar os parâmetros de subscription para melhor performance:

```tsx
// ✅ Recomendado - com subscription
const MyComponent = ({ sectorId, chatId }) => {
  const { chats } = useClientChatsWithPerson(sectorId);
  const { messages } = useClientChatMessages(chatId);

  return <div>...</div>;
};

// ✅ Funciona - sem subscription (fallback para eventos de DB)
const MyComponent = () => {
  const { chats } = useClientChatsWithPerson();
  const { chats: allChats } = useClientChats();

  return <div>...</div>;
};
```

## Configuração do Backend

As subscriptions requerem que o módulo `ClientChatMessageModule` esteja configurado no `MetaModule` (já feito).

### Publicando Eventos

Para que as subscriptions funcionem, o backend deve publicar eventos usando o `ClientChatMessageService`:

```typescript
// Exemplo de uso no backend
await this.clientChatMessageService.publishMessageCreated(message, chatId);
await this.clientChatMessageService.publishChatCreated(chat, sectorId);
```

## Troubleshooting

### Subscription não funciona

1. Verificar se `sectorId` ou `chatId` estão sendo fornecidos
2. Verificar se o backend está publicando eventos
3. Verificar logs do console para erros

### Performance

1. Usar `skip: true` quando não precisar da subscription
2. Fornecer `sectorId`/`chatId` apenas quando necessário
3. Verificar se não há múltiplas subscriptions desnecessárias

### Debug

1. Logs automáticos mostram quando eventos são recebidos
2. Verificar se os filtros do backend estão funcionando
3. Usar o componente `ClientChatSubscriptionExample` para testar
