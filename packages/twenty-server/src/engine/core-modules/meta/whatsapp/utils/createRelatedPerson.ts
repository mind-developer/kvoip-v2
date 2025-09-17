import { WhatsAppDocument } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappDocument';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export function createRelatedPerson(
  whatsAppDoc: Omit<
    WhatsAppDocument,
    'personId' | 'timeline' | 'unreadMessages' | 'isVisible'
  >,
): Partial<PersonWorkspaceEntity> {
  const createdPerson: Partial<PersonWorkspaceEntity> = {
    name: {
      firstName: whatsAppDoc.client.name
        ? whatsAppDoc.client.name.split(' ')[0].trim()
        : whatsAppDoc.client.phone || '',
      lastName: whatsAppDoc.client.name
        ? whatsAppDoc.client.name.split(' ')[1].trim()
        : '',
    },
    //TODO: parse number to get codes
    phones: {
      primaryPhoneNumber: whatsAppDoc.client.phone,
      primaryPhoneCallingCode: '',
      primaryPhoneCountryCode: 'BR',
      additionalPhones: [],
    },
    avatarUrl: whatsAppDoc.client.ppUrl || undefined,
  };
  return createdPerson;
}
