import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { CHATBOT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.chatbot,
  namePlural: 'chatbots',
  labelSingular: msg`Chatbot`,
  labelPlural: msg`Chatbots`,
  description: msg`A chatbot`,
})
@WorkspaceIsSystem()
export class ChatbotWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The chatbot's name`,
    icon: 'IconRobot',
  })
  @WorkspaceIsNullable()
  name: string;

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.TEXT,
    label: msg`Status`,
    description: msg`The current status of the chatbot flow`,
    icon: 'IconStatusChange',
  })
  @WorkspaceIsNullable()
  status: "ACTIVE" | "DRAFT" | "DISABLED";


  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.nodes,
    type: FieldMetadataType.TEXT,
    label: msg`Nodes`,
    icon: 'IconBrandStackshare',
    description: msg`Flow nodes`,
  })
  @WorkspaceIsNullable()
  nodes: any[];

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.edges,
    type: FieldMetadataType.TEXT,
    label: msg`Edges`,
    icon: 'IconGizmo',
    description: msg`Flow edges`,
  })
  @WorkspaceIsNullable()
  edges: any[];

  @WorkspaceField({
    standardId: CHATBOT_STANDARD_FIELD_IDS.viewport,
    type: FieldMetadataType.TEXT,
    label: msg`Viewport Position`,
    icon: 'IconMathXy',
    description: msg`Last saved viewport position`,
  })
  @WorkspaceIsNullable()
  viewport: { [key: string]: any } | null;
}
