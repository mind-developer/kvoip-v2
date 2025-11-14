import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { type PhonesMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/phones.composite-type';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { ChatIntegrationProvider } from 'twenty-shared/types';
import { normalizePhoneNumber } from 'twenty-shared/utils';

export function createRelatedPerson(
  name: PersonWorkspaceEntity['name'],
  phone: string,
  ppUrl: string | null,
  integrationProvider: ChatIntegrationProvider,
  sourceName: string,
): Partial<PersonWorkspaceEntity> {
  console.log(
    `Creating related person: ${name}, ${phone}, ${ppUrl}, ${integrationProvider}, ${sourceName}`,
  );
  const normalizedPhone = normalizePhoneNumber(phone);

  if (!normalizedPhone) {
    throw new Error(`Invalid phone number format: ${phone}`);
  }

  const phones = {
    ...normalizedPhone,
    primaryPhoneCountryCode: normalizedPhone.primaryPhoneCountryCode
      ? normalizedPhone.primaryPhoneCountryCode
      : undefined,
    additionalPhones: [],
  } as PhonesMetadata;
  const createdPerson: Partial<PersonWorkspaceEntity> = {
    name,
    phones,
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
