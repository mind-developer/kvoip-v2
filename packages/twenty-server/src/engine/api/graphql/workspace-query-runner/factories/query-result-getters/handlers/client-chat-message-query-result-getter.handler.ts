/* @kvoip-woulz proprietary */
import { type QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';

import { type FileService } from 'src/engine/core-modules/file/services/file.service';
import { signAttachmentUrl } from 'src/engine/core-modules/file/utils/normalize-and-sign-file-url.utils';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type ClientChatMessageWorkspaceEntity } from 'src/modules/client-chat-message/standard-objects/client-chat-message.workspace-entity';

export class ClientChatMessageQueryResultGetterHandler
  implements QueryResultGetterHandlerInterface
{
  constructor(
    private readonly fileService: FileService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async handle(
    message: ClientChatMessageWorkspaceEntity,
    workspaceId: string,
  ): Promise<ClientChatMessageWorkspaceEntity> {
    if (!message.id || !message?.attachmentUrl) {
      return message;
    }

    /* @kvoip-woulz proprietary:begin */
    const signedUrl = signAttachmentUrl(
      message.attachmentUrl,
      workspaceId,
      this.fileService,
      this.twentyConfigService,
    );
    /* @kvoip-woulz proprietary:end */

    return {
      ...message,
      /* @kvoip-woulz proprietary:begin */
      attachmentUrl: signedUrl,
      /* @kvoip-woulz proprietary:end */
    };
  }
}
