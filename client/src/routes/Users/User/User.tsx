import React from "react"
import * as Auth0 from "../../../react-auth0-spa"
import * as client from "../../../services/client"
import * as models from '../../../models'

type Props = {
    user?: models.User
}

const User: React.FC<Props> = (props) => {
    if (!props.user) {
        return <div>No user</div>
    }

    return (
        <>
            <h2>{props.user.name}</h2>
            <p>{props.user.points}</p>
        </>
    )
}

export default User