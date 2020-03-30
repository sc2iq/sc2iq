import dotenv from "dotenv"
import * as sc2client from "./client"

process.on('unhandledRejection', (reason) => {
    throw reason
})

dotenv.config()

const clientId = process.env.CLIENT_ID!
const clientSecret = process.env.CLIENT_SECRET!

async function main() {
    const token = await sc2client.getToken(clientId, clientSecret)

    const data = await sc2client.getLeagueData(token, {
        region: 'us',
        seasonId: 37,
        queueId: 201,
        teamType: 0,
        leagueId: 6,
        locale: 'en_US'
    })

    console.log({ data })
}

main()