import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WHATSAPP_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ChatbotWorkspaceEntity } from 'src/modules/chatbot/standard-objects/chatbot.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.whatsappIntegration,
  namePlural: 'whatsAppIntegrations',
  labelSingular: msg`WhatsApp Integration`,
  labelPlural: msg`Whatsapp Integrations`,
  description: msg`A Whatsapp integration`,
  icon: 'IconBrandWhatsapp',
  labelIdentifierStandardId: WHATSAPP_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
@WorkspaceIsSystem()
export class WhatsappIntegrationWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The name of the whatsapp integration`,
  })
  name: string;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.phoneId,
    type: FieldMetadataType.TEXT,
    label: msg`Phone ID`,
    description: msg`The phone number ID obtained from Facebook Developer`,
  })
  phoneId: string;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.businessAccountId,
    type: FieldMetadataType.TEXT,
    label: msg`Business Account ID`,
    description: msg`The business account ID obtained from Facebook Developer`,
  })
  businessAccountId: string;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.appId,
    type: FieldMetadataType.TEXT,
    label: msg`App ID`,
    description: msg`The App ID obtained from Facebook Developer`,
  })
  appId: string;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.appKey,
    type: FieldMetadataType.TEXT,
    label: msg`App Key`,
    description: msg`The App Secret Key obtained from Facebook Developer`,
  })
  appKey: string;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.accessToken,
    type: FieldMetadataType.TEXT,
    label: msg`Access Token`,
    description: msg`The Access Token obtained from Facebook Developer`,
  })
  accessToken: string;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.verifyToken,
    type: FieldMetadataType.TEXT,
    label: msg`Verify Token`,
    description: msg`The Verify Token obtained from Facebook Developer`,
  })
  verifyToken: string;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.sla,
    type: FieldMetadataType.NUMBER,
    label: msg`Service Level Agreement`,
    description: msg`Service Level Agreement (SLA) in minutes`,
  })
  sla: number;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.disabled,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Status`,
    description: msg`Status of the integration`,
  })
  disabled: boolean;

  @WorkspaceRelation({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.chatbot,
    type: RelationType.MANY_TO_ONE,
    label: msg`Chatbot`,
    description: msg`Integration linked to the Chatbot`,
    icon: 'IconPhone',
    inverseSideTarget: () => ChatbotWorkspaceEntity,
    inverseSideFieldKey: 'integrationId',
  })
  @WorkspaceIsNullable()
  chatbot: Relation<ChatbotWorkspaceEntity> | null;

  @WorkspaceJoinColumn('chatbot')
  chatbotId: string | null;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: any;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.apiType,
    type: FieldMetadataType.TEXT,
    label: msg`API Type`,
    description: msg`WhatsApp API Type`,
  })
  apiType?: string;
}
