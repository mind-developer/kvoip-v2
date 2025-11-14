/* @kvoip-woulz proprietary */
import { LinkWithConfirmation } from '@/chat/client-chat/components/message/LinkWithConfirmation';
import React from 'react';

type ParseMessageTextOptions = {
  LinkComponent: React.ElementType;
  CodeComponent?: React.ElementType;
  StrikethroughComponent?: React.ElementType;
  UlComponent?: React.ElementType;
  OlComponent?: React.ElementType;
  LiComponent?: React.ElementType;
};

type MatchType = 'link' | 'bold' | 'italic' | 'strikethrough' | 'monospace';

type Match = {
  index: number;
  length: number;
  type: MatchType;
  content: string;
  url?: string;
};

// Função recursiva auxiliar para processar formatações aninhadas
const parseFormattedTextRecursive = (
  text: string,
  options: ParseMessageTextOptions,
  keyIndexRef: { current: number },
  depth: number = 0,
): (string | JSX.Element)[] => {
  const {
    LinkComponent,
    CodeComponent = 'code',
    StrikethroughComponent = 'del',
  } = options;

  // Limite de profundidade para evitar loops infinitos
  if (depth > 10 || !text) {
    return text ? [text] : [];
  }

  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;

  // Regex para formatações do WhatsApp
  // *texto* = negrito
  // _texto_ = itálico
  // ~texto~ = riscado
  // `texto` = monospace
  const boldRegex = /\*([^*\n]+)\*/g;
  const italicRegex = /_([^_\n]+)_/g;
  const strikethroughRegex = /~([^~\n]+)~/g;
  const monospaceRegex = /`([^`\n]+)`/g;
  // Regex mais rigoroso para URLs:
  // 1. URLs com protocolo (http:// ou https://) - captura até espaço ou caractere inválido
  // 2. URLs começando com www. - captura até espaço ou caractere inválido
  // 3. Domínios sem protocolo - captura se:
  //    - Tiver caminho (/), query string (?), ou fragment (#) após o TLD
  //    - OU terminar com espaço/fim de linha (e não ter parênteses, colchetes ou chaves logo após)
  //    Isso evita capturar coisas como "console.log()" ou "object.property"
  const urlRegex =
    /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+|[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}(?:\/[^\s<>"'()]*|\?[^\s<>"']*|#[^\s<>"']*|(?=\s|$)(?![()\[\]{}])))/g;

  const matches: Match[] = [];

  // Encontra links (processados primeiro, não podem ser aninhados)
  let match;
  urlRegex.lastIndex = 0;
  while ((match = urlRegex.exec(text)) !== null) {
    let url = match[0];
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'link',
      content: match[0],
      url,
    });
  }

  // Encontra texto em negrito (*texto*)
  boldRegex.lastIndex = 0;
  while ((match = boldRegex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'bold',
      content: match[1],
    });
  }

  // Encontra texto em itálico (_texto_)
  italicRegex.lastIndex = 0;
  while ((match = italicRegex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'italic',
      content: match[1],
    });
  }

  // Encontra texto riscado (~texto~)
  strikethroughRegex.lastIndex = 0;
  while ((match = strikethroughRegex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'strikethrough',
      content: match[1],
    });
  }

  // Encontra texto monospace (`texto`)
  monospaceRegex.lastIndex = 0;
  while ((match = monospaceRegex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'monospace',
      content: match[1],
    });
  }

  // Ordena por posição no texto
  matches.sort((a, b) => a.index - b.index);

  // Remove sobreposições (mantém apenas o primeiro, exceto links que têm prioridade)
  const filteredMatches: Match[] = [];
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    let overlaps = false;
    for (let j = 0; j < filteredMatches.length; j++) {
      const existing = filteredMatches[j];
      // Links têm prioridade sobre formatações
      if (current.type === 'link' && existing.type !== 'link') {
        // Se o link sobrepõe uma formatação, remove a formatação
        if (
          current.index <= existing.index &&
          current.index + current.length >= existing.index + existing.length
        ) {
          filteredMatches.splice(j, 1);
          j--;
          continue;
        }
      } else if (existing.type === 'link' && current.type !== 'link') {
        // Se uma formatação sobrepõe um link, ignora a formatação
        if (
          existing.index <= current.index &&
          existing.index + existing.length >= current.index + current.length
        ) {
          overlaps = true;
          break;
        }
      }
      // Verifica sobreposição normal
      if (
        current.index < existing.index + existing.length &&
        current.index + current.length > existing.index
      ) {
        overlaps = true;
        break;
      }
    }
    if (!overlaps) {
      filteredMatches.push(current);
    }
  }

  // Se não há matches, retorna o texto como está
  if (filteredMatches.length === 0) {
    return [text];
  }

  // Processa os matches ordenados de forma recursiva
  for (const matchItem of filteredMatches) {
    // Adiciona o texto antes do match (processado recursivamente apenas se diferente do texto original)
    if (matchItem.index > lastIndex) {
      const textBefore = text.substring(lastIndex, matchItem.index);
      if (textBefore && textBefore !== text) {
        // Evita processar o mesmo texto novamente
        const parsedBefore = parseFormattedTextRecursive(
          textBefore,
          options,
          keyIndexRef,
          depth + 1,
        );
        parts.push(...parsedBefore);
      } else if (textBefore) {
        parts.push(textBefore);
      }
    }

    // Adiciona o elemento correspondente com conteúdo processado recursivamente
    switch (matchItem.type) {
      case 'link':
        // Links não processam formatações recursivamente, apenas mostram o texto original
        // Decodifica URL encoding (ex: %2f -> /, %20 -> espaço)
        let decodedContent = matchItem.content;
        try {
          decodedContent = decodeURIComponent(matchItem.content);
        } catch {
          // Se falhar a decodificação, usa o conteúdo original
          decodedContent = matchItem.content;
        }
        parts.push(
          <LinkWithConfirmation
            key={`link-${keyIndexRef.current++}`}
            href={matchItem.url!}
            LinkComponent={LinkComponent}
          >
            {decodedContent}
          </LinkWithConfirmation>,
        );
        break;
      case 'bold': {
        // Processa o conteúdo interno recursivamente apenas se diferente
        if (matchItem.content !== text) {
          const parsedContent = parseFormattedTextRecursive(
            matchItem.content,
            options,
            keyIndexRef,
            depth + 1,
          );
          parts.push(
            <strong key={`bold-${keyIndexRef.current++}`}>
              {parsedContent}
            </strong>,
          );
        } else {
          parts.push(
            <strong key={`bold-${keyIndexRef.current++}`}>
              {matchItem.content}
            </strong>,
          );
        }
        break;
      }
      case 'italic': {
        // Processa o conteúdo interno recursivamente apenas se diferente
        if (matchItem.content !== text) {
          const parsedContent = parseFormattedTextRecursive(
            matchItem.content,
            options,
            keyIndexRef,
            depth + 1,
          );
          parts.push(
            <em key={`italic-${keyIndexRef.current++}`}>{parsedContent}</em>,
          );
        } else {
          parts.push(
            <em key={`italic-${keyIndexRef.current++}`}>
              {matchItem.content}
            </em>,
          );
        }
        break;
      }
      case 'strikethrough': {
        // Processa o conteúdo interno recursivamente apenas se diferente
        const Strikethrough = StrikethroughComponent;
        if (matchItem.content !== text) {
          const parsedContent = parseFormattedTextRecursive(
            matchItem.content,
            options,
            keyIndexRef,
            depth + 1,
          );
          parts.push(
            <Strikethrough key={`strikethrough-${keyIndexRef.current++}`}>
              {parsedContent}
            </Strikethrough>,
          );
        } else {
          parts.push(
            <Strikethrough key={`strikethrough-${keyIndexRef.current++}`}>
              {matchItem.content}
            </Strikethrough>,
          );
        }
        break;
      }
      case 'monospace': {
        // Processa o conteúdo interno recursivamente apenas se diferente
        const Code = CodeComponent;
        if (matchItem.content !== text) {
          const parsedContent = parseFormattedTextRecursive(
            matchItem.content,
            options,
            keyIndexRef,
            depth + 1,
          );
          parts.push(
            <Code key={`monospace-${keyIndexRef.current++}`}>
              {parsedContent}
            </Code>,
          );
        } else {
          parts.push(
            <Code key={`monospace-${keyIndexRef.current++}`}>
              {matchItem.content}
            </Code>,
          );
        }
        break;
      }
    }

    lastIndex = matchItem.index + matchItem.length;
  }

  // Adiciona o texto restante (processado recursivamente apenas se diferente)
  if (lastIndex < text.length) {
    const textAfter = text.substring(lastIndex);
    if (textAfter && textAfter !== text) {
      const parsedAfter = parseFormattedTextRecursive(
        textAfter,
        options,
        keyIndexRef,
        depth + 1,
      );
      parts.push(...parsedAfter);
    } else if (textAfter) {
      parts.push(textAfter);
    }
  }

  return parts.length > 0 ? parts : [text];
};

export const parseMessageText = (
  text: string,
  options: ParseMessageTextOptions,
): (string | JSX.Element)[] => {
  const keyIndexRef = { current: 0 };
  return parseFormattedTextRecursive(text, options, keyIndexRef);
};

type TextBlock = {
  type: 'text' | 'bullet-list' | 'numbered-list';
  content: string[];
};

export const parseMessageTextWithLists = (
  text: string,
  options: ParseMessageTextOptions,
): (string | JSX.Element)[] => {
  if (!text) return [];

  const {
    UlComponent = 'ul',
    OlComponent = 'ol',
    LiComponent = 'li',
  } = options;

  const lines = text.split('\n');
  const blocks: TextBlock[] = [];
  let currentBlock: TextBlock | null = null;
  let keyIndex = 0;

  for (const line of lines) {
    // Detecta bullet point: começa com "- " ou "* " (seguido de espaço)
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    // Detecta numbered list: começa com número seguido de ". "
    const numberedMatch = line.match(/^\d+\.\s+(.+)$/);

    if (bulletMatch) {
      // Se já estávamos em uma bullet list, adiciona a linha
      if (currentBlock?.type === 'bullet-list') {
        currentBlock.content.push(bulletMatch[1]);
      } else {
        // Finaliza bloco anterior se existir
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        // Inicia nova bullet list
        currentBlock = {
          type: 'bullet-list',
          content: [bulletMatch[1]],
        };
      }
    } else if (numberedMatch) {
      // Se já estávamos em uma numbered list, adiciona a linha
      if (currentBlock?.type === 'numbered-list') {
        currentBlock.content.push(numberedMatch[1]);
      } else {
        // Finaliza bloco anterior se existir
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        // Inicia nova numbered list
        currentBlock = {
          type: 'numbered-list',
          content: [numberedMatch[1]],
        };
      }
    } else {
      // Linha normal de texto
      if (currentBlock?.type === 'text') {
        currentBlock.content.push(line);
      } else {
        // Finaliza bloco anterior se existir
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        // Inicia novo bloco de texto
        currentBlock = {
          type: 'text',
          content: [line],
        };
      }
    }
  }

  // Adiciona o último bloco
  if (currentBlock) {
    blocks.push(currentBlock);
  }

  // Renderiza os blocos
  const result: (string | JSX.Element)[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block.type === 'bullet-list') {
      const Ul = UlComponent;
      const Li = LiComponent;
      result.push(
        <Ul key={`bullet-list-${keyIndex++}`}>
          {block.content.map((item, itemIndex) => {
            const parsedItem = parseMessageText(item, options);
            return (
              <Li key={`bullet-item-${keyIndex++}-${itemIndex}`}>
                {parsedItem}
              </Li>
            );
          })}
        </Ul>,
      );
    } else if (block.type === 'numbered-list') {
      const Ol = OlComponent;
      const Li = LiComponent;
      result.push(
        <Ol key={`numbered-list-${keyIndex++}`}>
          {block.content.map((item, itemIndex) => {
            const parsedItem = parseMessageText(item, options);
            return (
              <Li key={`numbered-item-${keyIndex++}-${itemIndex}`}>
                {parsedItem}
              </Li>
            );
          })}
        </Ol>,
      );
    } else {
      // Bloco de texto normal
      block.content.forEach((line, lineIndex) => {
        if (line) {
          const parsedLine = parseMessageText(line, options);
          result.push(
            <span key={`text-line-${keyIndex++}-${lineIndex}`}>
              {parsedLine}
            </span>,
          );
        }
        // Adiciona <br /> entre linhas, exceto após o último bloco
        if (lineIndex < block.content.length - 1 || i < blocks.length - 1) {
          result.push(<br key={`br-${keyIndex++}-${lineIndex}`} />);
        }
      });
    }

    // Adiciona <br /> entre blocos diferentes
    if (i < blocks.length - 1) {
      result.push(<br key={`br-between-blocks-${keyIndex++}`} />);
    }
  }

  return result;
};
