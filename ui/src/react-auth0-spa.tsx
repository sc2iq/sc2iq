import React, { useState, useEffect, useContext } from "react"
import createAuth0Client from "@auth0/auth0-spa-js"

type Auth0Client = any

type Auth0User = {
    given_name: string
    family_name: string
    nickname: string
    name: string
    picture: string
    locale: string
    updated_at: string
    email: string
    email_verified: boolean
    sub: string
}

type Auth0HookOutput = {
    isAuthenticated: boolean
    user: Auth0User | undefined
    loading: boolean
    popupOpen: boolean
    loginWithPopup: Function
    handleRedirectCallback: Function
    getIdTokenClaims: Function
    loginWithRedirect: Function
    getTokenSilently: Function
    getTokenWithPopup: Function
    logout: Function
}

type Props = Auth0ClientOptions
    & {
        onRedirectCallback: (appState: any) => void
    }

const DEFAULT_REDIRECT_CALLBACK = () =>
    window.history.replaceState({}, document.title, window.location.pathname)


export const Auth0Context = React.createContext<any>(undefined)
export const useAuth0 = (): Auth0HookOutput => useContext(Auth0Context)

export const Auth0Provider: React.FC<Props> = ({
    children,
    onRedirectCallback = DEFAULT_REDIRECT_CALLBACK,
    ...initOptions
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [user, setUser] = useState<Auth0User | undefined>()
    const [auth0Client, setAuth0] = useState<Auth0Client | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const [popupOpen, setPopupOpen] = useState(false)

    useEffect(() => {
        const initAuth0 = async () => {
            const auth0FromHook = await createAuth0Client(initOptions)
            setAuth0(auth0FromHook)

            if (
                window.location.search.includes("code=") &&
                window.location.search.includes("state=")
            ) {
                const { appState } = await auth0FromHook.handleRedirectCallback()
                onRedirectCallback(appState)
            }

            const isAuthenticated = await auth0FromHook.isAuthenticated()

            setIsAuthenticated(isAuthenticated)

            if (isAuthenticated) {
                const user = await auth0FromHook.getUser()
                setUser(user)
            }

            setLoading(false)
        }
        initAuth0()
        // eslint-disable-next-line
    }, [])

    const loginWithPopup = async (params = {}) => {
        setPopupOpen(true)
        try {
            await auth0Client.loginWithPopup(params)
        } catch (error) {
            console.error(error)
        } finally {
            setPopupOpen(false)
        }
        const user = await auth0Client.getUser()
        setUser(user)
        setIsAuthenticated(true)
    }

    const handleRedirectCallback = async () => {
        setLoading(true)
        await auth0Client.handleRedirectCallback()
        const user = await auth0Client.getUser()
        setLoading(false)
        setIsAuthenticated(true)
        setUser(user)
    }

    const value = {
        isAuthenticated,
        user,
        loading,
        popupOpen,
        loginWithPopup,
        handleRedirectCallback,
        getIdTokenClaims: (...p: any[]) => auth0Client.getIdTokenClaims(...p),
        loginWithRedirect: (...p: any[]) => auth0Client.loginWithRedirect(...p),
        getTokenSilently: (...p: any[]) => auth0Client.getTokenSilently(...p),
        getTokenWithPopup: (...p: any[]) => auth0Client.getTokenWithPopup(...p),
        logout: (...p: any[]) => auth0Client.logout(...p),
    }

    return (
        <Auth0Context.Provider
            value={value}
        >
            {children}
        </Auth0Context.Provider>
    )
}