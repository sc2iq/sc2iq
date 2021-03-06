import React from "react"
import * as Auth0 from "../../react-auth0-spa"
import * as client from "../../services/client"
import { useSelector, useDispatch } from 'react-redux'
import * as UsersSlice from '../Users/usersSlice'
import * as models from '../../models'

type Props = {
    tokenData: models.AccessToken | undefined
}

const Profile: React.FC<Props> = (props) => {
    const { user, logout } = Auth0.useAuth0()

    if (!user) {
        return <div>You must login to view your profile</div>
    }

    return (
        <>
            <img src={user.picture} alt="Profile" />

            <div>
                <button onClick={() => logout()}>❌ Log out</button>
            </div>
            <h2>🧑 {user.name}</h2>
            <p>📧 {user.email} {user.email_verified && '✔ Verified'}</p>
            <p>💳 ID: {user.sub}</p>
            <p>👮‍♂️ Permissions: {props.tokenData?.permissions.join(', ') ?? 'None'}</p>
        </>
    )
}

const ProfileContainer: React.FC = () => {
    const state = useSelector(UsersSlice.selectUsers)

    return (
        <Profile
            tokenData={state.accessTokenData}
        />
    )
}


export default ProfileContainer