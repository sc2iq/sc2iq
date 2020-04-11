import React from 'react'
import * as Auth0 from "../../react-auth0-spa"
import * as client from '../../services/client'
import * as models from '../../models'
import QuestionForm from '../../components/QuestionForm'
import Question from '../../components/Question'
import Search from '../../components/Search'
import { useSelector, useDispatch } from 'react-redux'
import * as QuestionsSlice from './questionsSlice'

type Props = {
    questions: models.Question[]
    getQuestionAsync: () => Promise<void>
    postQuestionAsync: (questionInput: models.QuestionInput) => Promise<void>
}

const Questions: React.FC<Props> = (props) => {
    const onSubmitQuestion = async (questionInput: models.QuestionInput) => {
        try {
            props.postQuestionAsync(questionInput)
        } catch (error) {
            console.error(error)
        }
    }

    const onClickLoadQuestions = async () => {
        console.log(`onClickLoadQuestions`)
    }

    const onSubmitSearch = async (search: models.Search) => {
        try {
            console.log(`onClickSearch`)
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
            {props.questions.length === 0
                ? <div>
                    <div>No Questions</div>
                    <button onClick={onClickLoadQuestions}>
                        Load Questions
                    </button>
                </div>
                : props.questions.map((q, i) =>
                    <div key={q.id}>{i.toString().padStart(3, ' ')}: <Question question={q} /></div>
                )}
        </div>
    )
}

const QuestionsContainer: React.FC = () => {
    const state = useSelector(QuestionsSlice.selectQuestions)
    const dispatch = useDispatch()
    const { getTokenSilently } = Auth0.useAuth0()

    React.useEffect(() => {
        async function loadQuestions() {
            dispatch(QuestionsSlice.getQuestionsThunk())
        }

        if (state.questions.length === 0) {
            loadQuestions()
        }
    }, [])

    const getQuestionAsync = async () => {
        QuestionsSlice.getQuestionsThunk()
    }

    const postQuestionAsync = async (question: models.QuestionInput) => {
        const token = await getTokenSilently()
        QuestionsSlice.postQuestionThunk(token, question)
    }

    return (
        <Questions
            questions={state.questions}
            getQuestionAsync={getQuestionAsync}
            postQuestionAsync={postQuestionAsync}
        />
    )
}


export default QuestionsContainer
