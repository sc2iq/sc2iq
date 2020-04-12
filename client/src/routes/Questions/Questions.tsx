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
    searchFilter: models.Search | undefined
    getQuestionAsync: () => Promise<void>
    clearSearchFilter: () => void
    postQuestionAsync: (questionInput: models.QuestionInput) => Promise<void>
    submitSearchAsync: (search: models.Search) => Promise<void>
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
            props.submitSearchAsync(search)
        }
        catch (error) {
            console.error(error)
        }
    }

    const onClickClearSearchFilter = async () => {
        props.clearSearchFilter()
    }

    const searchFilter = props.searchFilter
    const filteredQuestions = searchFilter
        ? props.questions.filter(q => {
            const questionTags = q.tags.map(t => t.name)
            return searchFilter.minDifficulty <= q.difficulty
                && q.difficulty <= searchFilter.maxDifficulty
                && searchFilter.tags.some(tag => questionTags.includes(tag))
        })
        : props.questions

    return (
        <div>
            <QuestionForm onSubmit={onSubmitQuestion} />
            <Search onSubmit={onSubmitSearch} />

            <h3>Questions</h3>
            {props.searchFilter
                && (
                    <div>
                        <button onClick={onClickClearSearchFilter}>
                            Clear Search Filter ❌
                        </button>
                    </div>
                )}

            {filteredQuestions.length === 0
                ? <div>
                    <div>No Questions</div>
                </div>
                : filteredQuestions.map((q, i) =>
                    <div key={q.id}>{i.toString().padStart(3, ' ')}: <Question question={q} /></div>
                )}

            <div>
                <button onClick={onClickLoadQuestions}>
                    Load More Questions
                </button>
            </div>
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
        dispatch(QuestionsSlice.getQuestionsThunk())
    }

    const postQuestionAsync = async (question: models.QuestionInput) => {
        const token = await getTokenSilently()
        dispatch(QuestionsSlice.postQuestionThunk(token, question))
    }

    const submitSearchAsync = async (search: models.Search) => {
        dispatch(QuestionsSlice.submitSearchThunk(search))
    }

    const clearSearchFilter = () => {
        dispatch(QuestionsSlice.setSearchFilter({ search: undefined }))
    }

    return (
        <Questions
            questions={state.questions}
            searchFilter={state.searchFilter}
            clearSearchFilter={clearSearchFilter}
            getQuestionAsync={getQuestionAsync}
            postQuestionAsync={postQuestionAsync}
            submitSearchAsync={submitSearchAsync}
        />
    )
}

export default QuestionsContainer
