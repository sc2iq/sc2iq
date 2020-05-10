import dotenv from "dotenv"
import auth0 from "auth0"
import * as models from "./models"
import * as client from "./services/client"

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

    /*
    Token: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik5ESXdPRGhHUWtJelFrTkNNRGMyUmpZeFF6TTNSREF5TnpGRE9EQTFSa1JCUWpaRk9EQXpOQSJ9.eyJpc3MiOiJodHRwczovL3NjMmlxLmF1dGgwLmNvbS8iLCJzdWIiOiJFM1YxRmFLWjhhblF0MEs0RzBUbndqcER1bmQ1UTZpM0BjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9zYzJpcS5jb20vYXBpIiwiaWF0IjoxNTg5MTM4ODIwLCJleHAiOjE1ODkyMjUyMjAsImF6cCI6IkUzVjFGYUtaOGFuUXQwSzRHMFRud2pwRHVuZDVRNmkzIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIiwicGVybWlzc2lvbnMiOltdfQ.hBk6Jqnt477xsM2YzHNX-_IciOow5lwjZ61zUaFVYGmhvN9AEPHkwnqZpiISSZFvF2tu-y3mL79hfEF_N63korHVq5fYjKXWuNR6n6NUaA89aGe7L70ifXBBFHdQ2-cAoz2nRDBJRs-EjBOgwMif6ECrrnLWBq7o1IhKXPuMbUQVzg_LT89j-euTtXBDpB1bVrLBs4JG6W2kZKTqa37yjjshNM6BYPtiAku50gr3doatwUlHNA12pmjIPfhmmLxmOlgz2dMruWB6_w--dqhs3kb8t-mnP4wV18hM8QihzG8dht70QwCTXAlSHNGPEgH7hPCNJEshMNn_5XsybR2d-w
    User:

    {
        "iss": "https://sc2iq.auth0.com/",
        "sub": "E3V1FaKZ8anQt0K4G0TnwjpDund5Q6i3@clients",
        "aud": "https://sc2iq.com/api",
        "iat": 1589138820,
        "exp": 1589225220,
        "azp": "E3V1FaKZ8anQt0K4G0TnwjpDund5Q6i3",
        "gty": "client-credentials",
        "permissions": []
    }
*/
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

    const question1: models.QuestionInput = {
        question: 'Question from M2M',
        answer1: 'Answer One',
        answer2: 'Answer 2',
        answer3: 'Answer 3',
        answer4: 'Answer 4',
        difficulty: 4,
        source: '',
        tags: ['tag1', 'tag2', 'terran', 'ghost']
    }

    try {
        const savedQuestion = await client.postQuestion(tokenResponse.access_token, question1)
        console.log(`Saved Question: `, { savedQuestion })
    }
    catch (e)  {
        console.log(`Error: `, { e })
        await delay(10000)
    }
}

async function delay(ms: number): Promise<void> {
    await new Promise((res) => setTimeout(() => res(), ms))
} 

main()