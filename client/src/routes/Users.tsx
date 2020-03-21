import React from 'react'
import * as client from '../services/client'
import User from "../components/User"

const Users: React.FC = () => {
    const [users, setUsers] = React.useState<any[]>([])

    const onClickLoadUsers = async () => {
        try {
            const users = await client.getUsers()
            setUsers(users)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div>
            <h1>Users</h1>

            <div>
                <button onClick={onClickLoadUsers}>
                    Load users
                </button>
            </div>
            {users.length === 0
                ? <div>No users</div>
                : users.map(user =>
                    <User user={user} key={user.id} />
                )}
        </div>
    )
}

export default Users
