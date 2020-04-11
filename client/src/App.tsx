import React from 'react'
import * as RRD from 'react-router-dom'
import Index from './routes/Index'
import Debug from './routes/Debug'
import Questions from './routes/Questions'
import Scores from './routes/Scores'
import Polls from './routes/Polls'
import Users from './routes/Users'
import Profile from './routes/Profile'
import Test from './routes/Test'
import PrivateRoute from './components/PrivateRoute'
import { useAuth0 } from "./react-auth0-spa"
import history from "./utils/history"
import * as client from './services/client'
import { UserInput } from './models'
import './App.css'

const Navigate = (RRD as any).Navigate
const Routes = (RRD as any).Routes

function App() {
    const { loading, user, isAuthenticated, getTokenSilently } = useAuth0()

    // Attempt to create new user when user is authenticated.
    React.useEffect(() => {
        async function createUserIfNotExist(userInput: UserInput) {
            try {
                return await client.getUser(userInput.id)
            }
            catch (e) {
                const error: Error = e
                console.error(error)

                const token = await getTokenSilently()
                return await client.postUser(token, userInput)
            }
        }

        if (user && isAuthenticated) {
            createUserIfNotExist({
                id: user.sub,
                name: user.name,
            })
        }
        // eslint-disable-next-line
    }, [user, isAuthenticated])

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <RRD.Router history={history}>
            <div className="sc2iq-app">
                <header>
                    <nav>
                        <RRD.NavLink to="/">SC2IQ</RRD.NavLink>
                        <RRD.NavLink to="/questions">Questions</RRD.NavLink>
                        <RRD.NavLink to="/test">Test</RRD.NavLink>
                        <RRD.NavLink to="/scores">Scores</RRD.NavLink>
                        <RRD.NavLink to="/polls">Polls</RRD.NavLink>
                        <RRD.NavLink to="/users">Users</RRD.NavLink>
                        <RRD.NavLink to="/profile">Profile</RRD.NavLink>
                    </nav>
                </header>
                <main>
                    <Routes>
                        <RRD.Route path="/" element={<Index />} />
                        <RRD.Route path="questions" element={<Questions />} />
                        <RRD.Route path="test" element={<Test />} />
                        <RRD.Route path="scores" element={<Scores />} />
                        <RRD.Route path="polls" element={<Polls />} />
                        <RRD.Route path="users" element={<Users />} />
                        <RRD.Route path="debug" element={<Debug />} />
                        <PrivateRoute path="profile" element={<Profile />} />
                    </Routes>
                </main>
                <footer>
                    <RRD.NavLink to="/debug">Debug</RRD.NavLink>
                </footer>
            </div>
        </RRD.Router>
    )
}

export default App
