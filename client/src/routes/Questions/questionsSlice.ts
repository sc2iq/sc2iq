import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, RootState } from '../../app/store'
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
        setSearchFilter: (state, action: PayloadAction<{ search: models.Search | undefined }>) => {
            state.searchFilter = action.payload.search
        },
        addQuestion: (state, action: PayloadAction<{ question: models.Question }>) => {
            state.questions.push(action.payload.question)
        }
    },
})

const { setQuestions, setSearchFilter, addQuestion } = slice.actions
export { setSearchFilter }

export const getQuestionsThunk = (): AppThunk => async dispatch => {
    const questions = await client.getQuestions()
    dispatch(setQuestions({ questions }))
}

export const postQuestionThunk = (token: string, questionInput: models.QuestionInput): AppThunk => async dispatch => {
    const question = await client.postQuestion(token, questionInput)
    dispatch(addQuestion({ question }))
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
