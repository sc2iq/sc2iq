import React from "react"
import { Route } from "react-router-dom"
import { useAuth0 } from "../react-auth0-spa"

type Props = {
    element: JSX.Element
    path: string
}
const PrivateRoute: React.FC<Props> = ({ element, path, ...rest }) => {
    const { isAuthenticated, loginWithRedirect } = useAuth0()

    const onClickLogin = () => {
        loginWithRedirect({
            appState: { targetUrl: path }
        })
    }

    const render = isAuthenticated === true
        ? element
        : <div>
            You must <button type="button" onClick={onClickLogin}>Log In</button> to continue.
        </div>

    return <Route path={path} element={render} {...rest} />
}

export default PrivateRoute