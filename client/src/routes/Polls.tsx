import React from 'react'
import * as Auth0 from "../react-auth0-spa"
import * as client from '../services/client'
import * as models from '../models'
import PollForm from '../components/PollForm'
import Poll from '../components/Poll'
import Search from '../components/Search'

const Polls: React.FC = () => {
    const { getTokenSilently } = Auth0.useAuth0()
    const [polls, setPolls] = React.useState<models.Poll[]>([])

    const onSubmitPoll = async (pollInput: models.PollInput) => {
        try {
            const token = await getTokenSilently()
            const poll = await client.postPoll(token, pollInput)
            setPolls(polls => [...polls, poll])
        } catch (error) {
            console.error(error)
        }
    }

    const onClickLoadPolls = async () => {
        try {
            const polls = await client.getPolls()
            setPolls(polls)
        } catch (error) {
            console.error(error)
        }
    }

    const onSubmitSearch = async (search: models.Search) => {
        try {
            const searchResults = await client.postPollsSearch(search)
            setPolls(searchResults)
        }
        catch (error) {
            console.error(error)
        }
    }

    return (
        <div>
            <PollForm onSubmit={onSubmitPoll} />
            <Search onSubmit={onSubmitSearch} />

            <h3>Polls</h3>
            {polls.length === 0
                ? <div>
                    <div>No Polls</div>
                    <button onClick={onClickLoadPolls}>
                        Load Polls
                    </button>
                </div>
                : polls.map((poll, i) =>
                    <div key={poll.id}>{i.toString().padStart(3, ' ')}: <Poll poll={poll} /></div>
                )}
        </div>
    )
}

export default Polls
