import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, RootState } from '../../app/store'
import * as models from '../../models'
import * as utilities from '../../utilities'
import * as client from '../../services/client'

type State = {
    scores: models.ScoreComputed[]
}

const initialState: State = {
    scores: [],
}

export const slice = createSlice({
    name: 'scores',
    initialState,
    reducers: {
        setScores: (state, action: PayloadAction<{ scores: models.Score[] }>) => {
            state.scores = action.payload.scores.map(s => {
                return {
                    ...s,
                    avgDifficulty: 0,
                    duration: 0,
                    points: 0,
                }
            })
        },
        addScore: (state, action: PayloadAction<{ score: models.Score }>) => {
            state.scores.push(action.payload.score)
        }
    },
})

const { setScores, addScore } = slice.actions
export { }

export const getScoresThunk = (): AppThunk => async dispatch => {
    const scores = await client.getScores()
    dispatch(setScores({ scores }))
}

export const postScoreThunk = (token: string, scoreInput: models.ScoreInput): AppThunk => async dispatch => {
    const score = await client.postScore(token, scoreInput)
    dispatch(addScore({ score }))
}

export const selectScores = (state: RootState) =>
    state.scores

export default slice.reducer
