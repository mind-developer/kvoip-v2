import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export function createRelatedPerson(
  name: PersonWorkspaceEntity['name'],
  phone: string,
  ppUrl: string | null,
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
  };
  return createdPerson;
}
