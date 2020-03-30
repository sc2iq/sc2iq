import axios from "axios"

type TokenResponse = {
    access_token: string
    token_type: string
    expires_in: number
}

export async function getToken(clientId: string, clientSecret: string): Promise<string> {
    // TODO: Send scopes for token?
    // sc2.profile openid
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const body = 'grant_type=client_credentials'
    const response = await axios.post<TokenResponse>(`https://us.battle.net/oauth/token`, body, {
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    })

    const data = response.data

    return data.access_token
}


export type LeagueData = {
    region: string
    seasonId: number
    queueId: number
    teamType: number
    leagueId: number
    locale: string
}

export async function getLeagueData(accessToken: string, leagueData: LeagueData) {
    const response = await axios.get(`https://${leagueData.region}.api.blizzard.com/data/sc2/league/${leagueData.seasonId}/${leagueData.queueId}/${leagueData.teamType}/${leagueData.leagueId}?locale=${leagueData.locale}&access_token=${accessToken}`)
    return response.data
}