import dotenv from "dotenv"
import auth0 from "auth0"

process.on('unhandledRejection', (reason) => {
    throw reason
})

const result = dotenv.config()
if (result.error) {
    throw result.error
}

const authenticationClient = new auth0.AuthenticationClient({
    domain: process.env.DOMAIN!,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
})

async function main() {
    const tokenResponse = await authenticationClient.clientCredentialsGrant({ audience: 'https://sc2iq.com/api' })

    console.log({ tokenResponse })
}

main()