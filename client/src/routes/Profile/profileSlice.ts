import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import * as models from '../../models'

type State = {
    accessTokenData: models.AccessToken | undefined
}

const initialState: State = {
    accessTokenData: undefined,
}

export const slice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setAccessTokenData: (state, action: PayloadAction<{ tokenData: models.AccessToken }>) => {
            state.accessTokenData = action.payload.tokenData
        },
    },
})

const { setAccessTokenData } = slice.actions
export { setAccessTokenData }

export const selectProfile = (state: RootState) =>
    state.profile

export default slice.reducer
