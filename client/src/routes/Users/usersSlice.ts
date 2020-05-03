import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, RootState } from '../../app/store'
import * as models from '../../models'
import * as utilities from '../../utilities'
import * as client from '../../services/client'

type State = {
    users: models.User[]
    currentUser: models.User | undefined
    accessTokenData: models.AccessToken | undefined
}

const initialState: State = {
    users: [],
    currentUser: undefined,
    accessTokenData: undefined,
}

export const slice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setAccessTokenData: (state, action: PayloadAction<{ tokenData: models.AccessToken }>) => {
            state.accessTokenData = action.payload.tokenData
        },
        setUsers: (state, action: PayloadAction<{ users: models.User[] }>) => {
            state.users = action.payload.users
        },
        upsertUser: (state, action: PayloadAction<{ user: models.User }>) => {
            const updatedUser = action.payload.user
            const userIndex = state.users.findIndex(user => user.id === updatedUser.id)
            // If found, replace, otherwise add
            if (typeof userIndex === 'number') {
                state.users.splice(userIndex, 1, updatedUser)
            }
            else {
                state.users.push(updatedUser)
            }
        },
        setCurrentUser: (state, action: PayloadAction<{ user: models.User }>) => {
            state.currentUser = action.payload.user
        }
    },
})

const { setAccessTokenData, setUsers, setCurrentUser, upsertUser } = slice.actions
export { }

export const createUserIfNotExistThunk = (token: string, userInput: models.UserInput): AppThunk => async dispatch => {
    let user: models.User

    try {
        user = await client.getUser(userInput.id)
    }
    // Intentionally catch 404 rejection. This is signal that use does not exist yet.
    catch (e) {
        const error: Error = e
        console.error(error)

        user = await client.postUser(token, userInput)
    }

    dispatch(setCurrentUser({ user }))

    return user
}

export const setAccessTokenDataThunk = (token: string): AppThunk => async dispatch => {
    const tokenData = await client.verify(token)
    dispatch(setAccessTokenData({ tokenData }))
}

export const getUsersThunk = (): AppThunk => async dispatch => {
    const users = await client.getUsers()
    dispatch(setUsers({ users }))
}

export const getUserThunk = (userId: string): AppThunk => async dispatch => {
    const user = await client.getUser(userId)
    dispatch(upsertUser({ user }))
}

export const selectUsers = (state: RootState) =>
    state.users

export default slice.reducer
