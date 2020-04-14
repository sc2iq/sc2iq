import React from 'react'
import * as RRD from 'react-router-dom'
import Index from './routes/Index'
import Debug from './routes/Debug'
import Questions from './routes/Questions/Questions'
import Scores from './routes/Scores/Scores'
import Polls from './routes/Polls/Polls'
import Users from './routes/Users/Users'
import UsersIndex from './routes/Users/UsersIndex'
import User from './routes/Users/User/User'
import Profile from './routes/Profile/Profile'
import Review from './routes/Review/Review'
import Test from './routes/Test'
import PrivateRoute from './components/PrivateRoute'
import { useAuth0 } from "./react-auth0-spa"
import history from "./utilities/history"
import * as client from './services/client'
import { UserInput } from './models'
import './App.css'
import { useSelector, useDispatch } from 'react-redux'
import * as ProfileSlice from './routes/Profile/profileSlice'

const Routes = (RRD as any).Routes

function App() {
    const { loading, user, isAuthenticated, getTokenSilently } = useAuth0()
    const profileState = useSelector(ProfileSlice.selectProfile)
    const dispatch = useDispatch()

    // Attempt to create new user when user is authenticated.
    React.useEffect(() => {
        async function createUserIfNotExist(userInput: UserInput) {
            try {
                return await client.getUser(userInput.id)
            }
            // Intentionally catch 404 rejection. This is signal that use does not exist yet.
            catch (e) {
                const error: Error = e
                console.error(error)

                const token = await getTokenSilently()
                return await client.postUser(token, userInput)
            }
        }

        async function getTokenData() {
            const t = await getTokenSilently()
            const tokenData = await client.verify(t)
            console.log(`ID Token: `, user)
            console.log(`Access Token: `, tokenData)

            dispatch(ProfileSlice.setAccessTokenData({ tokenData }))
        }

        if (user && isAuthenticated) {
            createUserIfNotExist({
                id: user.sub,
                name: user.name,
            })

            if (profileState.accessTokenData === undefined) {
                getTokenData()
            }
        }
    }, [isAuthenticated, getTokenSilently])

    if (loading) {
        return <div className="placeholder">
            <div className="container">
                <div>Loading...</div>
            </div>
        </div>
    }

    return (
        <RRD.Router history={history}>
            <header>
                <div className="container">
                    <nav>
                        <RRD.NavLink to="/">SC2IQ</RRD.NavLink>
                        <RRD.NavLink to="/questions">Questions</RRD.NavLink>
                        <RRD.NavLink to="/test">Test</RRD.NavLink>
                        <RRD.NavLink to="/scores">Scores</RRD.NavLink>
                        <RRD.NavLink to="/polls">Polls</RRD.NavLink>
                        <RRD.NavLink to="/users">Users</RRD.NavLink>
                        <b></b>
                        <RRD.NavLink to="/profile">Profile</RRD.NavLink>
                    </nav>
                </div>
            </header>
            <main>
                <div className="container">
                    <Routes>
                        <RRD.Route path="/" element={<Index />} />
                        <RRD.Route path="questions" element={<Questions />} />
                        <RRD.Route path="test" element={<Test />} />
                        <RRD.Route path="scores" element={<Scores />} />
                        <RRD.Route path="polls" element={<Polls />} />
                        <RRD.Route path="users" element={<Users />} >
                            <RRD.Route path="/" element={<UsersIndex />} />
                            <RRD.Route path=":userId" element={<User />} />
                        </RRD.Route>
                        <PrivateRoute path="profile" element={<Profile />} />
                        <RRD.Route path="debug" element={<Debug />} />
                        <RRD.Route path="review" element={<Review />} />
                    </Routes>
                </div>
            </main>
            <footer>
                <div className="container">
                    SC2IQ © 2020
                    {profileState.accessTokenData?.permissions.includes('write:all')
                        && (
                            <div>
                                <RRD.NavLink to="/debug">Debug</RRD.NavLink> &nbsp;
                                <RRD.NavLink to="/review">Review</RRD.NavLink>
                            </div>
                        )}
                </div>
            </footer>
        </RRD.Router>
    )
}

export default App
