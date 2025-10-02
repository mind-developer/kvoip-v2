import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WHATSAPP_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { InboxWorkspaceEntity } from 'src/modules/inbox/standard-objects/inbox.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.whatsappIntegration,
  namePlural: 'whatsappIntegrations',
  labelSingular: msg`WhatsApp Integration`,
  labelPlural: msg`Whatsapp Integrations`,
  description: msg`A Whatsapp integration`,
  icon: 'IconBrandWhatsapp',
  labelIdentifierStandardId: WHATSAPP_STANDARD_FIELD_IDS.name,
})
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
    standardId: WHATSAPP_STANDARD_FIELD_IDS.inbox,
    type: RelationType.MANY_TO_ONE,
    label: msg`Inbox`,
    description: msg`Inbox linked to this integration`,
    icon: 'IconPhone',
    inverseSideTarget: () => InboxWorkspaceEntity,
    inverseSideFieldKey: 'whatsappIntegration',
  })
  @WorkspaceIsNullable()
  inbox: Relation<InboxWorkspaceEntity> | null;

  @WorkspaceJoinColumn('inbox')
  inboxId: string | null;

  @WorkspaceField({
    standardId: WHATSAPP_STANDARD_FIELD_IDS.apiType,
    type: FieldMetadataType.TEXT,
    label: msg`API Type`,
    description: msg`WhatsApp API Type`,
  })
  apiType?: 'MetaAPI' | 'Baileys';
}
