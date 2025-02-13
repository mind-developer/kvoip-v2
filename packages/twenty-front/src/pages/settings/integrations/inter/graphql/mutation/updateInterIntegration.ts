import { gql } from '@apollo/client';

export const UPDATE_INTER_INTEGRATION = gql`
    mutation updateInterIntegration(updateInterIntegrationInput: $UpdateInterIntegrationInput!) {
        updateInterIntegration(updateInterIntegrationInput: $UpdateInterIntegrationInput) {
            id
            crtFileUrl
            keyFileUrl
        }
    }
`;
