import dotenv from "dotenv"
import auth0 from "auth0"
import * as models from "./models"
import * as client from "./services/client"
import fs from 'fs'

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

    const questionInputsString = await fs.promises.readFile('./questionInputs.json', 'utf8')
    const questionInputs: models.QuestionInput[] = JSON.parse(questionInputsString)
    
    const tokenResponse = await authenticationClient.clientCredentialsGrant({ audience: 'https://sc2iq.com/api' })

    // Fake user to represent this M2M Client?
    const userInput: models.UserInput = {
        id: 'E3V1FaKZ8anQt0K4G0TnwjpDund5Q6i3@clients',
        name: 'sc2info.com',
    }

    let user: models.User

    try {
        user = await client.getUser(userInput.id)
    }
    // Intentionally catch 404 rejection. This is signal that use does not exist yet.
    catch (e) {
        const error: Error = e
        console.error(error)

        user = await client.postUser(tokenResponse.access_token, userInput)
    }
    console.log({ user })

    const savedQuestions: string[] = []
    try {
        for(const question of questionInputs) {
                const savedQuestion = await client.postQuestion(tokenResponse.access_token, question)
                savedQuestions.push(savedQuestion.id)
        }
    }
    catch (e)  {
        console.log(`Error: `, { e })
        await delay(10000)
    }

    console.log(`Saved Question id: `, { savedQuestions })
}

async function delay(ms: number): Promise<void> {
    await new Promise((res) => setTimeout(() => res(), ms))
} 

main()