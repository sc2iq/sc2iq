import React from 'react'
import * as Auth0 from "../../react-auth0-spa"
import * as models from '../../models'
import User from "../../components/User"
import { useSelector, useDispatch } from 'react-redux'
import * as UsersSlice from './usersSlice'

type Props = {
    users: models.User[]
    getUsersAsync: () => Promise<void>
}

const Users: React.FC<Props> = (props) => {
    return (
        <div>
            <h1>Users</h1>

            {props.users.length === 0
                ? <div>No users</div>
                : props.users.map(user =>
                    <User user={user} key={user.id} />
                )}
        </div>
    )
}

const UsersContainer: React.FC = () => {
    const state = useSelector(UsersSlice.selectUsers)
    const dispatch = useDispatch()

    React.useEffect(() => {
        async function loadUsers() {
            dispatch(UsersSlice.getUsersThunk())
        }

        if (state.users.length === 0) {
            loadUsers()
        }
    }, [])

    const getUsersAsync = async () => {
        dispatch(UsersSlice.getUsersThunk())
    }

    return (
        <Users
            users={state.users}
            getUsersAsync={getUsersAsync}
        />
    )
}

export default UsersContainer
