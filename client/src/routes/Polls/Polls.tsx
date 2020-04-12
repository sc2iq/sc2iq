import React from 'react'
import * as Auth0 from "../../react-auth0-spa"
import * as client from '../../services/client'
import * as models from '../../models'
import PollForm from '../../components/PollForm'
import Poll from '../../components/Poll'
import Search from '../../components/Search'
import { useSelector, useDispatch } from 'react-redux'
import * as PollsSlice from './pollsSlice'

type Props = {
    polls: models.Poll[],
    getPollsAsync: () => Promise<void>
    postPollAsync: (pollInput: models.PollInput) => Promise<void>
}

const Polls: React.FC<Props> = (props) => {

    const onSubmitPoll = async (pollInput: models.PollInput) => {
        props.postPollAsync(pollInput)
    }

    const onClickLoadPolls = async () => {
        console.log(`on load more polls`)
    }

    const onSubmitSearch = async (search: models.Search) => {
        console.log('on click submit search', search)
    }

    return (
        <div>
            <PollForm onSubmit={onSubmitPoll} />
            <Search onSubmit={onSubmitSearch} />

            <h3>Polls</h3>
            {props.polls.length === 0
                ? <div>
                    <div>No Polls</div>
                </div>
                : props.polls.map((poll, i) =>
                    <div key={poll.id}>{i.toString().padStart(3, ' ')}: <Poll poll={poll} /></div>
                )}

            <div>
                <button onClick={onClickLoadPolls}>
                    Load More Scores
                </button>
            </div>
        </div>
    )
}

const PollsContainer: React.FC = () => {
    const state = useSelector(PollsSlice.selectPolls)
    const dispatch = useDispatch()
    const { getTokenSilently } = Auth0.useAuth0()
    React.useEffect(() => {
        async function loadUsers() {
            dispatch(PollsSlice.getPollsThunk())
        }

        if (state.polls.length === 0) {
            loadUsers()
        }
    }, [])

    const getPollsAsync = async () => {
        PollsSlice.getPollsThunk()
    }

    const postPollAsync = async (pollInput: models.PollInput) => {
        const token = await getTokenSilently()
        PollsSlice.postPollThunk(token, pollInput)
    }

    return (
        <Polls
            polls={state.polls}
            getPollsAsync={getPollsAsync}
            postPollAsync={postPollAsync}
        />
    )
}

export default PollsContainer
