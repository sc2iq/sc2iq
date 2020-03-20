import React from 'react'
import * as Auth0 from "../react-auth0-spa"
import * as client from '../services/client'
import * as models from '../models'
import QuestionForm from '../components/QuestionForm'
import Question from '../components/Question'
import Search from '../components/Search'

const Questions: React.FC = () => {
    const { getTokenSilently } = Auth0.useAuth0()
    const [questions, setQuestions] = React.useState<models.Question[]>([])

    const onSubmitQuestion = async (questionInput: models.QuestionInput) => {
        try {
            const token = await getTokenSilently()
            const question = await client.postQuestion(token, questionInput)
            setQuestions(questions => [...questions, question])
        } catch (error) {
            console.error(error)
        }
    }

    const onClickLoadQuestions = async () => {
        try {
            const questions = await client.getQuestions()
            setQuestions(questions)
        } catch (error) {
            console.error(error)
        }
    }

    const onSubmitSearch = async (search: models.Search) => {
        try {
            const searchResults = await client.postQuestionsSearch(search)
            setQuestions(searchResults)
        }
        catch (error) {
            console.error(error)
        }
    }

    return (
        <div>
            <QuestionForm onSubmit={onSubmitQuestion} />
            <Search onSubmit={onSubmitSearch} />

            <h3>Questions</h3>
            {questions.length === 0
                ? <div>
                    <div>No Questions</div>
                    <button onClick={onClickLoadQuestions}>
                        Load Questions
                    </button>
                </div>
                : questions.map((q, i) =>
                    <div key={q.id}>{i.toString().padStart(3, ' ')}: <Question question={q} /></div>
                )}
        </div>
    )
}

export default Questions
