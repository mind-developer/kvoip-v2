import React, { useCallback, useState } from 'react';
import { ClientChat, ClientChatMessage } from 'twenty-shared/types';
import { useClientChatSubscription } from '../hooks/useClientChatSubscription';
import { useClientMessageSubscription } from '../hooks/useClientMessageSubscription';

type ClientChatSubscriptionExampleProps = {
  chatId: string;
  sectorId: string;
};

export const ClientChatSubscriptionExample: React.FC<
  ClientChatSubscriptionExampleProps
> = ({ chatId, sectorId }) => {
  const [messages, setMessages] = useState<ClientChatMessage[]>([]);
  const [chats, setChats] = useState<ClientChat[]>([]);
  const [lastEvent, setLastEvent] = useState<string>('');

  // Callback para quando uma nova mensagem é criada
  const handleMessageCreated = useCallback((message: ClientChatMessage) => {
    console.log('Nova mensagem criada:', message);
    setMessages((prev) => [...prev, message]);
    setLastEvent(`Nova mensagem: ${message.textBody || 'Mídia'}`);
  }, []);

  // Callback para quando uma mensagem é atualizada
  const handleMessageUpdated = useCallback((message: ClientChatMessage) => {
    console.log('Mensagem atualizada:', message);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.providerMessageId === message.providerMessageId ? message : msg,
      ),
    );
    setLastEvent(`Mensagem atualizada: ${message.textBody || 'Mídia'}`);
  }, []);

  // Callback para quando um novo chat é criado
  const handleChatCreated = useCallback((chat: ClientChat) => {
    console.log('Novo chat criado:', chat);
    setChats((prev) => [chat, ...prev]);
    setLastEvent(`Novo chat criado: ${chat.providerContactId}`);
  }, []);

  // Callback para quando um chat é atualizado
  const handleChatUpdated = useCallback((chat: ClientChat) => {
    console.log('Chat atualizado:', chat);
    setChats((prev) => prev.map((c) => (c.id === chat.id ? chat : c)));
    setLastEvent(`Chat atualizado: ${chat.providerContactId}`);
  }, []);

  // Callback para erros
  const handleError = useCallback((error: any) => {
    console.error('Erro na subscription:', error);
    setLastEvent(`Erro: ${error.message || 'Erro desconhecido'}`);
  }, []);

  // Subscription para mensagens do chat específico
  useClientMessageSubscription({
    chatId: chatId,
    onMessageCreated: handleMessageCreated,
    onMessageUpdated: handleMessageUpdated,
    onError: handleError,
    skip: !chatId,
  });

  // Subscription para chats do setor específico
  useClientChatSubscription({
    sectorId: sectorId,
    onChatCreated: handleChatCreated,
    onChatUpdated: handleChatUpdated,
    onError: handleError,
    skip: !sectorId,
  });

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>Exemplo de Subscriptions Client Chat</h3>

      <div style={{ marginBottom: '20px' }}>
        <h4>Último Evento:</h4>
        <p
          style={{
            padding: '10px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
          }}
        >
          {lastEvent || 'Nenhum evento ainda'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h4>Mensagens do Chat ({messages.length})</h4>
          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #ddd',
              padding: '10px',
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '5px',
                  padding: '5px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '3px',
                }}
              >
                <strong>{message.fromType}:</strong>{' '}
                {message.textBody || '[Mídia]'}
                <br />
                <small>{new Date(message.createdAt).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h4>Chats do Setor ({chats.length})</h4>
          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #ddd',
              padding: '10px',
            }}
          >
            {chats.map((chat, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '5px',
                  padding: '5px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '3px',
                }}
              >
                <strong>ID:</strong> {chat.id}
                <br />
                <strong>Contato:</strong> {chat.providerContactId}
                <br />
                <strong>Status:</strong> {chat.status}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>
          <strong>Chat ID:</strong> {chatId}
        </p>
        <p>
          <strong>Setor ID:</strong> {sectorId}
        </p>
      </div>
    </div>
  );
};
