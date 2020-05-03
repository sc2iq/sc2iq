import React from 'react'
import * as RRD from "react-router-dom"
import * as models from '../../../models'
import Question from '../../../components/Question'
import { useSelector, useDispatch } from 'react-redux'
import * as QuestionsSlice from '../questionsSlice'

type Props = {
    question?: models.Question
}

const QuestionRoute: React.FC<Props> = (props) => {
    if (!props.question) {
        return (
            <div>
                No question
            </div>
        )
    }

    return (
        <Question
            question={props.question}
        />
    )
}

const QuestionContainer: React.FC = () => {
    const state = useSelector(QuestionsSlice.selectQuestions)
    const params = RRD.useParams<{ questionId: string }>()
    const questionId = decodeURIComponent(params.questionId)
    const question = questionId
        ? state.questions.find(q => q.id === questionId)
        : undefined
    const dispatch = useDispatch()

    React.useEffect(() => {
        async function loadQuestion() {
            dispatch(QuestionsSlice.getQuestionThunk(questionId))
        }

        if (question === undefined) {
            loadQuestion()
        }
    }, [question])

    return (
        <QuestionRoute
            question={question}
        />
    )
}

export default QuestionContainer