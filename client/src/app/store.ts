import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import * as models from '../models'
import questionsReducer from '../routes/Questions/questionsSlice'

export const store = configureStore({
  reducer: {
    questions: questionsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>
