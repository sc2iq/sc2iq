import React from "react"
import { Route } from "react-router-dom"
import { useAuth0 } from "../react-auth0-spa"

type Props = {
    element: JSX.Element
    path: string
}
const PrivateRoute: React.FC<Props> = ({ element, path, ...rest }) => {
    const { loading, isAuthenticated, loginWithRedirect } = useAuth0()

    React.useEffect(() => {
        if (loading || isAuthenticated) {
            return
        }
        const fn = async () => {
            await loginWithRedirect({
                appState: { targetUrl: path }
            })
        }
        fn()
    }, [loading, isAuthenticated, loginWithRedirect, path])

    const render = isAuthenticated === true
            ? element
            : null

    return <Route path={path} element={render} {...rest} />
}

export default PrivateRoute