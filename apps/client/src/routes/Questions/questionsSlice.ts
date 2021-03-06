import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AwaitableThunk, AppThunk, RootState } from '../../app/store'
import * as models from '../../models'
import * as utilities from '../../utilities'
import * as client from '../../services/client'

type State = {
    questions: models.Question[],
    searchFilter: models.Search | undefined,
}

const initialState: State = {
    questions: [],
    searchFilter: undefined,
}

export const slice = createSlice({
    name: 'questions',
    initialState,
    reducers: {
        setQuestions: (state, action: PayloadAction<{ questions: models.Question[] }>) => {
            state.questions = action.payload.questions
        },
        upsertQuestion: (state, action: PayloadAction<{ question: models.Question }>) => {
            const updatedQuestion = action.payload.question
            const questionIndex = state.questions.findIndex(q => q.id === updatedQuestion.id)
            if (typeof questionIndex === 'number') {
                state.questions.splice(questionIndex, 1, updatedQuestion)
            }
            else {
                state.questions.push(updatedQuestion)
            }
        },
        setSearchFilter: (state, action: PayloadAction<{ search: models.Search | undefined }>) => {
            state.searchFilter = action.payload.search
        },
        addQuestion: (state, action: PayloadAction<{ question: models.Question }>) => {
            state.questions.push(action.payload.question)
        }
    },
})

const { setQuestions, setSearchFilter, addQuestion, upsertQuestion } = slice.actions
export { setSearchFilter }

export const getQuestionsThunk = (questionState: models.QuestionState): AppThunk => async dispatch => {
    const questions = await client.getQuestions(questionState)
    dispatch(setQuestions({ questions }))
}

export const getQuestionThunk = (id: string): AwaitableThunk => async dispatch => {
    const question = await client.getQuestion(id)
    dispatch(upsertQuestion({ question }))
}

export const postQuestionThunk = (token: string, questionInput: models.QuestionInput): AppThunk => async dispatch => {
    const question = await client.postQuestion(token, questionInput)
    dispatch(addQuestion({ question }))
}

export const setQuestionStateThunk = (token: string, questionId: string, state: models.QuestionState.APPROVED | models.QuestionState.REJECTED): AppThunk => async dispatch => {
    const question = await client.setQuestionState(token, questionId, state)
    dispatch(upsertQuestion({ question }))
}

export const submitSearchThunk = (search: models.Search): AppThunk => async dispatch => {
    const searchResults = await client.postQuestionsSearch(search)
    const questions = [...new Map(searchResults.map(q => [q.id, q])).values()]
    dispatch(setSearchFilter({ search }))
    dispatch(setQuestions({ questions }))
}

export const selectQuestions = (state: RootState) =>
    state.questions

export default slice.reducer
