import dotenv from "dotenv"
import * as models from "./models"
import * as client from "./services/client"
import fs from 'fs'
import { createClerkClient } from "@clerk/remix/api.server"

process.on('unhandledRejection', (reason) => {
    throw reason
})

const result = dotenv.config()
if (result.error) {
    throw result.error
}

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
})

async function main() {
    const questionInputsString = await fs.promises.readFile('./questionInputs.json', 'utf8')
    const questionInputs: models.QuestionInput[] = JSON.parse(questionInputsString)

    const systemAdmin = await clerkClient.users.createUser({
      firstName: 'System',
      lastName: 'Administrator',
    })

    console.log({ systemAdmin })
    // TODO: Get Token
    const accessToken = ""

    const savedQuestions: string[] = []
    try {
        for(const question of questionInputs) {
                const savedQuestion = await client.postQuestion(accessToken, question)
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
    await new Promise((res) => setTimeout(() => res(undefined), ms))
}

main()
