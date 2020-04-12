import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, RootState } from '../../app/store'
import * as models from '../../models'
import * as utilities from '../../utilities'
import * as client from '../../services/client'

type State = {
    users: models.User[]
}

const initialState: State = {
    users: [],
}

export const slice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setUsers: (state, action: PayloadAction<{ users: models.User[] }>) => {
            state.users = action.payload.users
        },
    },
})

const { setUsers } = slice.actions
export { }

export const getUsersThunk = (): AppThunk => async dispatch => {
    const users = await client.getUsers()
    dispatch(setUsers({ users }))
}

export const selectUsers = (state: RootState) =>
    state.users

export default slice.reducer
