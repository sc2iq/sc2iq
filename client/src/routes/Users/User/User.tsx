import React from "react"
import * as RRD from "react-router-dom"
import * as Auth0 from "../../../react-auth0-spa"
import * as client from "../../../services/client"
import * as models from '../../../models'
import { useSelector, useDispatch } from 'react-redux'
import * as UsersSlice from '../usersSlice'

type Props = {
    user?: models.User
}

const User: React.FC<Props> = (props) => {
    if (!props.user) {
        return <>
            <div>No user</div>
        </>
    }

    return (
        <>
            <h2>{props.user.name}</h2>
            <dl>
                <dt>Points</dt><dd>{props.user.points}</dd>
                <dt>Reputation</dt><dd>{props.user.reputation}</dd>
                <dt>Status</dt><dd>{props.user.status}</dd>
            </dl>

            <h3>Questions:</h3>

            <h3>Scores:</h3>

            <h3>Polls:</h3>
        </>
    )
}

const UserContainer: React.FC = () => {
    const state = useSelector(UsersSlice.selectUsers)
    const params = RRD.useParams<{ userId: string }>()
    const userId = decodeURIComponent(params.userId)
    const user = state.users.find(u => u.id === userId)
    const dispatch = useDispatch()

    React.useEffect(() => {
        async function loadUser() {
            dispatch(UsersSlice.getUserThunk(userId))
        }

        if (user === undefined) {
            loadUser()
        }
    }, [user])

    return (
        <User
            user={user}
        />
    )
}

export default UserContainer