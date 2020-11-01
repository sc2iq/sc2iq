import React from 'react'
import * as RRD from 'react-router-dom'
import * as Auth0 from "../../react-auth0-spa"
import * as models from '../../models'
import User from "../../components/User"
import { useSelector, useDispatch } from 'react-redux'
import * as UsersSlice from './usersSlice'
import styles from "./UsersIndex.module.css"

type Props = {
    users: models.User[]
    getUsersAsync: () => Promise<void>
}

const UsersIndex: React.FC<Props> = (props) => {
    return (
        <div>
            <h1>Users</h1>

            {props.users.length === 0
                ? <div>No users</div>
                : <div className={styles.users}>
                    <div className={styles.columnHeaders}>
                        <div>Name:</div>
                        <div>Difficulty Rating:</div>
                        <div>Points:</div>
                        <div>Reputation:</div>
                        <div>Status</div>
                    </div>
                    {props.users.map(user =>
                        <RRD.NavLink key={user.id} to={user.id} className={styles.user}>
                            <User user={user} />
                        </RRD.NavLink>
                    )}
                </div>
            }
        </div>
    )
}

const UsersIndexContainer: React.FC = () => {
    const state = useSelector(UsersSlice.selectUsers)
    const dispatch = useDispatch()

    React.useEffect(() => {
        async function loadUsers() {
            dispatch(UsersSlice.getUsersThunk())
        }

        if (state.users.length < 10) {
            loadUsers()
        }
    }, [])

    const getUsersAsync = async () => {
        dispatch(UsersSlice.getUsersThunk())
    }

    return (
        <UsersIndex
            users={state.users}
            getUsersAsync={getUsersAsync}
        />
    )
}

export default UsersIndexContainer
