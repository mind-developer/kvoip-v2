import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { ChatIntegrationProviders } from 'twenty-shared/types';

export function createRelatedPerson(
  name: PersonWorkspaceEntity['name'],
  phone: string,
  ppUrl: string | null,
  integrationProvider: ChatIntegrationProviders,
  sourceName: string,
): Partial<PersonWorkspaceEntity> {
  const createdPerson: Partial<PersonWorkspaceEntity> = {
    name,
    //TODO: parse number to get codes
    phones: {
      primaryPhoneNumber: phone,
      primaryPhoneCallingCode: '',
      primaryPhoneCountryCode: 'BR',
      additionalPhones: [],
    },
    avatarUrl: ((ppUrl ?? null) as string) || undefined,
    createdBy: {
      name: sourceName,
      source: FieldActorSource.CHAT,
      workspaceMemberId: null,
      context: { chatProvider: integrationProvider },
    },
  };
  return createdPerson;
}
