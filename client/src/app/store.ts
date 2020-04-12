import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import questionsReducer from '../routes/Questions/questionsSlice'
import scoresReducer from '../routes/Scores/scoresSlice'

export const store = configureStore({
  reducer: {
    questions: questionsReducer,
    scores: scoresReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>
