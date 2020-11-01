import React from 'react'
import faker from "faker"
import * as Auth0 from "../react-auth0-spa"
import * as client from '../services/client'
import * as models from '../models'

type Props = {
}

const Debug: React.FC<Props> = (props) => {
    const [generateNumber, setGenerateNumber] = React.useState(20)
    const { getTokenSilently } = Auth0.useAuth0()

    const createQuestion = async () => {
        const question = faker.random.words(2)
        const answer1 = faker.random.words(2)
        const answer2 = faker.random.words(2)
        const answer3 = faker.random.words(2)
        const answer4 = faker.random.words(2)
        const difficulty = faker.random.number(10)
        const tags = [
            'terran',
            'zerg',
            faker.hacker.ingverb(),
            faker.hacker.adjective(),
            faker.hacker.verb(),
            faker.hacker.verb(),
        ]
        const source = faker.internet.url()

        const questionInput: models.QuestionInput = {
            question,
            answer1,
            answer2,
            answer3,
            answer4,
            difficulty,
            source,
            tags,
        }

        const token = await getTokenSilently()
        await client.postQuestion(token, questionInput)
    }

    const createPoll = async () => {
        const pollInput: models.PollInput = {
            question: faker.random.words(2),
            answer1: faker.random.words(2),
            answer2: faker.random.words(2),
            answer3: faker.random.words(2),
            answer4: faker.random.words(2),
            tags: [
                'terran',
                'zerg',
                faker.hacker.ingverb(),
                faker.hacker.adjective(),
                faker.hacker.verb(),
                faker.hacker.verb(),
            ],
        }

        const token = await getTokenSilently()
        await client.postPoll(token, pollInput)
    }

    const onChangeNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGenerateNumber(Number(event.target.value))
    }

    const onClickGenerateQuestions = async (numQuestions: number) => {
        const max = numQuestions
        for (let i = 0; i < max; i++) {
            await createQuestion()
        }
    }

    const onClickGeneratePolls = async (numQuestions: number) => {
        const max = numQuestions
        for (let i = 0; i < max; i++) {
            await createPoll()
        }
    }

    return (
        <div>
            <h1>Debug</h1>
            <div>
                <input type="number" min={0} value={generateNumber} onChange={onChangeNumber} />
                <div>
                    <button type="button" onClick={() => onClickGenerateQuestions(generateNumber)}>Generate {generateNumber} Questions</button>
                </div>
                <div>
                    <button type="button" onClick={() => onClickGeneratePolls(generateNumber)}>Generate {generateNumber} Polls</button>
                </div>
            </div>
        </div>
    )
}

export default Debug