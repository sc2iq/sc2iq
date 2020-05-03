import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk, RootState } from '../../app/store'
import * as models from '../../models'
import * as utilities from '../../utilities'
import * as client from '../../services/client'

type State = {
    polls: models.Poll[]
}

const initialState: State = {
    polls: [],
}

export const slice = createSlice({
    name: 'polls',
    initialState,
    reducers: {
        setPolls: (state, action: PayloadAction<{ polls: models.Poll[] }>) => {
            state.polls = action.payload.polls
        },
        upsertPoll: (state, action: PayloadAction<{ poll: models.Poll }>) => {
            const updatedPoll = action.payload.poll
            const pollIndex = state.polls.findIndex(poll => poll.id === updatedPoll.id)
            if (typeof pollIndex === 'number') {
                state.polls.splice(pollIndex, 1, updatedPoll)
            }
            else {
                state.polls.push(updatedPoll)
            }
        },
        addPoll: (state, action: PayloadAction<{ poll: models.Poll }>) => {
            state.polls.push(action.payload.poll)
        },
    },
})

const { setPolls, upsertPoll, addPoll } = slice.actions
export { }

export const getPollsThunk = (state: models.PollState): AppThunk => async dispatch => {
    const polls = await client.getPolls(state)
    dispatch(setPolls({ polls }))
}

export const getPollThunk = (pollId: string): AppThunk => async dispatch => {
    const poll = await client.getPoll(pollId)
    dispatch(upsertPoll({ poll }))
}

export const postPollThunk = (token: string, pollInput: models.PollInput): AppThunk => async dispatch => {
    const poll = await client.postPoll(token, pollInput)
    dispatch(addPoll({ poll }))
}

export const setPollStateThunk = (token: string, pollId: string, state: models.PollState.APPROVED | models.PollState.REJECTED): AppThunk => async dispatch => {
    const poll = await client.setPollState(token, pollId, state)
    dispatch(upsertPoll({ poll }))
}

export const selectPolls = (state: RootState) =>
    state.polls

export default slice.reducer
