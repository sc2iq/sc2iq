import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import questionsReducer from '../routes/Questions/questionsSlice'
import scoresReducer from '../routes/Scores/scoresSlice'
import usersReducer from '../routes/Users/usersSlice'
import pollsReducer from '../routes/Polls/pollsSlice'
import profileReducer from '../routes/Profile/profileSlice'

export const store = configureStore({
  reducer: {
    questions: questionsReducer,
    scores: scoresReducer,
    users: usersReducer,
    polls: pollsReducer,
    profile: profileReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>
