import { ManagementClient } from 'auth0'
import { AUTH0_DOMAIN, AUTH0_MANAGEMENT_APP_CLIENT_ID, AUTH0_MANAGEMENT_APP_CLIENT_SECRET } from '~/constants/index.server'

// https://github.com/auth0/node-auth0/blob/master/EXAMPLES.md#automatic-management-api-token-retrieval
export const managementClient = new ManagementClient({
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_MANAGEMENT_APP_CLIENT_ID,
    clientSecret: AUTH0_MANAGEMENT_APP_CLIENT_SECRET,
})