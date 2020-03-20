import React from "react"
import * as Auth0 from "../react-auth0-spa"
import * as client from "../services/client"

let tokenData: object | undefined

const Profile = () => {
    const { loading, user, isAuthenticated, getTokenSilently, loginWithRedirect, logout } = Auth0.useAuth0()
    const [serverUser, setServerUser] = React.useState<any>(undefined)

    React.useEffect(() => {
        async function getTokenData() {
            const t = await getTokenSilently()
            tokenData = await client.verify(t)
            setServerUser(tokenData)
        }

        if (isAuthenticated && tokenData === undefined) {
            getTokenData()
        }
    }, [isAuthenticated, getTokenSilently])

    if (loading || !user) {
        return <div>Loading...</div>
    }

    return (
        <>
            <img src={user.picture} alt="Profile" />

            <div>
                {isAuthenticated
                    ? <button onClick={() => logout()}>Log out</button>
                    : <button onClick={() => loginWithRedirect({})}>Log in</button>}
            </div>

            <h2>{user.name}</h2>
            <p>{user.email}</p>

            <h3>ID Token:</h3>
            <pre>{JSON.stringify(user, null, 2)}</pre>

            <h3>Access Token:</h3>
            <pre>{JSON.stringify(serverUser, null, 2)}</pre>
        </>
    )
}

export default Profile