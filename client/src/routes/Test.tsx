import React from 'react'
import * as Auth0 from "../react-auth0-spa"
import * as client from '../services/client'
import * as models from '../models'
import * as util from '../utils'
import Test from '../components/Test'

const TestRoute: React.FC = () => {
    const { getTokenSilently } = Auth0.useAuth0()
    const [questions, setQuestions] = React.useState<models.Poll[]>([])
    const [score, setScore] = React.useState<models.ScoreComputed>()

    const getKeyAsync = async () => {
        // TODO: Should use separate method to trigger reset?
        setScore(undefined)
        const key = await client.getKey()
        return key
    }

    const onSubmitTest = async (scoreInput: models.ScoreInput) => {
        try {
            const token = await getTokenSilently()
            const score = await client.postScore(token, scoreInput)
            const scoreComputed = util.computeDurationsOfScore(score)
            setScore(scoreComputed)
        } catch (error) {
            console.error(error)
        }
    }

    const onClickReady = async () => {
        try {
            const qs = await client.getRandomQuestions()
            setQuestions(qs.slice(0, 10))
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div>
            <Test
                onClickReady={onClickReady}
                questions={questions}
                onSubmit={onSubmitTest}
                getKeyAsync={getKeyAsync}
                score={score}
            />
        </div>
    )
}

export default TestRoute
