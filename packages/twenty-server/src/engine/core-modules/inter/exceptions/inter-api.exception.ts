import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Violação da API Inter
 */
export type InterApiViolation = {
  razao: string;
  propriedade?: string;
  valor?: string;
};

/**
 * Exceção customizada para erros da API Inter
 *
 * Esta exceção encapsula erros retornados pela API do Banco Inter,
 * incluindo violações de validação e detalhes técnicos.
 */
export class InterApiException extends HttpException {
  public readonly title: string;
  public readonly detail: string;
  public readonly violacoes?: InterApiViolation[];
  public readonly interHttpStatus?: number;

  constructor(params: {
    title: string;
    detail: string;
    violacoes?: InterApiViolation[];
    interHttpStatus?: number;
    httpStatus?: HttpStatus;
  }) {
    const {
      title,
      detail,
      violacoes,
      interHttpStatus,
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    } = params;

    super(
      {
        title,
        detail,
        violacoes,
        interHttpStatus,
      },
      httpStatus,
    );

    this.title = title;
    this.detail = detail;
    this.violacoes = violacoes;
    this.interHttpStatus = interHttpStatus;
  }

  /**
   * Cria uma InterApiException a partir de um erro Axios
   */
  static fromAxiosError(error: unknown): InterApiException {
    // Type guard para verificar se é um erro Axios com response da Inter
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response
    ) {
      const response = error.response as {
        data?: {
          title?: string;
          detail?: string;
          violacoes?: InterApiViolation[];
        };
        status?: number;
      };

      return new InterApiException({
        title: response.data?.title || 'Erro na API Inter',
        detail: response.data?.detail || 'Nenhum detalhe fornecido',
        violacoes: response.data?.violacoes,
        interHttpStatus: response.status,
        httpStatus: HttpStatus.BAD_GATEWAY,
      });
    }

    // Fallback para erros genéricos
    const errorMessage =
      error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Erro desconhecido';

    return new InterApiException({
      title: 'Erro ao comunicar com API Inter',
      detail: errorMessage,
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
