import React from 'react'
import * as RRD from "react-router-dom"
import * as models from '../../../models'
import Poll from '../../../components/Poll'
import { useSelector, useDispatch } from 'react-redux'
import * as pollsSlice from '../pollsSlice'

type Props = {
    poll?: models.Poll
}

const PollRoute: React.FC<Props> = (props) => {
    if (!props.poll) {
        return (
            <div>
                No question
            </div>
        )
    }

    return (
        <Poll
            poll={props.poll}
        />
    )
}

const PollContainer: React.FC = () => {
    const state = useSelector(pollsSlice.selectPolls)
    const params = RRD.useParams<{ pollId: string }>()
    const pollId = decodeURIComponent(params.pollId)
    const poll = pollId
        ? state.polls.find(p => p.id === pollId)
        : undefined
    const dispatch = useDispatch()

    React.useEffect(() => {
        async function loadPoll() {
            dispatch(pollsSlice.getPollThunk(pollId))
        }

        if (poll === undefined) {
            loadPoll()
        }
    }, [poll])

    return (
        <PollRoute
            poll={poll}
        />
    )
}

export default PollContainer