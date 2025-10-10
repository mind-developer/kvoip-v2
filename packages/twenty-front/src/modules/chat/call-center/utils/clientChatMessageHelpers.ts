import { MessageType } from '@/chat/types/MessageType';
import { TDateFirestore } from '@/chat/types/chat';
import {
  ChatMessageFromType,
  ChatMessageType,
  ClientChatMessage,
  ClientChatMessageEvent,
} from 'twenty-shared/types';

/**
 * Verifica se a mensagem é do sistema/agente (fromMe)
 */
export const isMessageFromAgent = (message: ClientChatMessage): boolean => {
  return (
    message.fromType === ChatMessageFromType.AGENT ||
    message.fromType === ChatMessageFromType.CHATBOT
  );
};

/**
 * Obtém o conteúdo principal da mensagem (URL de mídia ou texto)
 */
export const getMessageContent = (message: ClientChatMessage): string => {
  // Para mídias (imagem, áudio, vídeo, documento), retorna o attachmentUrl
  if (message.attachmentUrl) {
    return message.attachmentUrl;
  }
  // Para mensagens de texto, retorna o textBody
  if (message.textBody) {
    return message.textBody;
  }
  // Fallback para caption se nenhum dos anteriores estiver disponível
  return message.caption || '';
};

/**
 * Obtém a legenda da mensagem (se houver)
 */
export const getMessageCaption = (
  message: ClientChatMessage,
): string | null => {
  return message.caption;
};

/**
 * Obtém o texto completo da mensagem, incluindo caption se disponível
 */
export const getMessageFullText = (message: ClientChatMessage): string => {
  const content = message.textBody || '';
  const caption = message.caption || '';

  // Se tem ambos, combina
  if (content && caption) {
    return `${content}\n${caption}`;
  }

  return content || caption;
};

/**
 * Converte um timestamp ISO para o formato TDateFirestore
 * Se não fornecido, usa a data atual
 */
export const getMessageTimestamp = (createdAt?: string): TDateFirestore => {
  const date = createdAt ? new Date(createdAt) : new Date();
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1000000,
  };
};

/**
 * Mapeia ChatMessageType para MessageType (usado no frontend)
 */
export const mapChatMessageTypeToMessageType = (
  type: ChatMessageType,
  event: ClientChatMessageEvent | null,
): MessageType => {
  switch (type) {
    case ChatMessageType.TEXT:
      return MessageType.TEXT;
    case ChatMessageType.IMAGE:
      return MessageType.IMAGE;
    case ChatMessageType.AUDIO:
      return MessageType.AUDIO;
    case ChatMessageType.VIDEO:
      return MessageType.VIDEO;
    case ChatMessageType.DOCUMENT:
      return MessageType.DOCUMENT;
    case ChatMessageType.TEMPLATE:
      return MessageType.TEXT; // Template não tem tipo específico
    case ChatMessageType.STICKER:
      return MessageType.IMAGE; // Sticker também usa imagem
    case ChatMessageType.EVENT:
      // Mapear eventos para os tipos específicos
      switch (event) {
        case ClientChatMessageEvent.START:
          return MessageType.STARTED;
        case ClientChatMessageEvent.END:
          return MessageType.END;
        case ClientChatMessageEvent.ONHOLD:
          return MessageType.ONHOLD;
        case ClientChatMessageEvent.TRANSFER_TO_AGENT:
        case ClientChatMessageEvent.TRANSFER_TO_SECTOR:
          return MessageType.TRANSFER;
        default:
          return MessageType.TEXT;
      }
    default:
      return MessageType.TEXT;
  }
};

/**
 * Verifica se o tipo de mensagem é um evento do sistema
 */
export const isSystemEventMessage = (message: ClientChatMessage): boolean => {
  return (
    message.type === ChatMessageType.EVENT &&
    (message.event === ClientChatMessageEvent.START ||
      message.event === ClientChatMessageEvent.END ||
      message.event === ClientChatMessageEvent.TRANSFER_TO_AGENT ||
      message.event === ClientChatMessageEvent.TRANSFER_TO_SECTOR ||
      message.event === ClientChatMessageEvent.ONHOLD)
  );
};

/**
 * Obtém o tipo de mensagem no formato usado pelo frontend
 */
export const getMessageDisplayType = (
  message: ClientChatMessage,
): MessageType => {
  return mapChatMessageTypeToMessageType(message.type, message.event);
};
