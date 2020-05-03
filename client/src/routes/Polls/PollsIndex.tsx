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

    let filteredPolls = props.polls
        .filter(q => q.state === models.PollState.APPROVED)

    return (
        <div>
            <PollForm onSubmit={onSubmitPoll} />
            <Search onSubmit={onSubmitSearch} />

            <h3>Polls</h3>
            {filteredPolls.length === 0
                ? <div>
                    <div>No Polls</div>
                </div>
                : <div className="list">
                    {filteredPolls.map((poll, i) =>
                        <Poll
                            key={poll.id}
                            poll={poll}
                            index={i}
                        />
                    )}
                </div>}

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
            dispatch(PollsSlice.getPollsThunk(models.PollState.APPROVED))
        }

        if (state.polls.length < 10) {
            loadUsers()
        }
    }, [])

    const getPollsAsync = async () => {
        dispatch(PollsSlice.getPollsThunk(models.PollState.APPROVED))
    }

    const postPollAsync = async (pollInput: models.PollInput) => {
        const token = await getTokenSilently()
        dispatch(PollsSlice.postPollThunk(token, pollInput))
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
