import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, RootState } from '../../app/store'
import * as models from '../../models'
import * as utilities from '../../utilities'
import * as client from '../../services/client'

type State = {
    questions: models.Question[]
}

const initialState: State = {
    questions: [],
}

export const slice = createSlice({
    name: 'questions',
    initialState,
    reducers: {
        setQuestions: (state, action: PayloadAction<{ questions: models.Question[] }>) => {
            state.questions = action.payload.questions
        },
        addQuestion: (state, action: PayloadAction<{ question: models.Question }>) => {
            state.questions.push(action.payload.question)
        }
    },
})

const { setQuestions, addQuestion } = slice.actions
export { }

export const getQuestionsThunk = (): AppThunk => async dispatch => {
    const questions = await client.getQuestions()
    dispatch(setQuestions({ questions }))
}

export const postQuestionThunk = (token: string, questionInput: models.QuestionInput): AppThunk => async dispatch => {
    const question = await client.postQuestion(token, questionInput)
    dispatch(addQuestion({ question }))
}

export const selectQuestions = (state: RootState) =>
    state.questions

export default slice.reducer
