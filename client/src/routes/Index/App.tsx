import React from 'react'
import * as RRD from 'react-router-dom'
import Index from '../Index'
import Debug from '../Debug'
import Questions from '../Questions/Questions'
import Scores from '../Scores/Scores'
import Polls from '../Polls/Polls'
import Users from '../Users/Users'
import UsersIndex from '../Users/UsersIndex'
import User from '../Users/User/User'
import Profile from '../Profile/Profile'
import Review from '../Review/Review'
import Test from '../Test'
import PrivateRoute from '../../components/PrivateRoute'
import UserBanner from '../../components/UserBanner'
import { useAuth0 } from "../../react-auth0-spa"
import history from "../../utilities/history"
import * as client from '../../services/client'
import * as models from '../../models'
import './App.css'
import { useSelector, useDispatch } from 'react-redux'
import * as UsersSlice from '../Users/usersSlice'

const Routes = (RRD as any).Routes

type Props = {
    loading: boolean
    currentUser: models.User | undefined
    permissions: string[]
}

const App: React.FC<Props> = (props) => {
    if (props.loading) {
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
                        <RRD.NavLink to="/profile">{props.currentUser ? props.currentUser.name : 'Profile'}</RRD.NavLink>
                    </nav>
                </div>
                {props.currentUser
                    && (
                        <section className="subheader">
                            <div className="container">
                                <UserBanner user={props.currentUser} />
                            </div>
                        </section>
                    )}
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
                    {props.permissions.includes('write:all')
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

const AppContainer: React.FC = () => {
    const { loading, user, isAuthenticated, getTokenSilently } = useAuth0()
    const usersState = useSelector(UsersSlice.selectUsers)
    const dispatch = useDispatch()

    // Attempt to create new user when user is authenticated.
    React.useEffect(() => {
        async function createUserIfNotExist(userInput: models.UserInput) {
            const token = await getTokenSilently()
            dispatch(UsersSlice.createUserIfNotExistThunk(token, userInput))
        }

        async function getTokenData() {
            const token = await getTokenSilently()
            dispatch(UsersSlice.setAccessTokenDataThunk(token))
        }

        if (user && isAuthenticated) {
            createUserIfNotExist({
                id: user.sub,
                name: user.name,
            })

            if (usersState.accessTokenData === undefined) {
                getTokenData()
            }
        }
    }, [isAuthenticated, getTokenSilently])

    const state = useSelector(UsersSlice.selectUsers)

    return (
        <App
            loading={loading}
            currentUser={state.currentUser}
            permissions={state.accessTokenData?.permissions ?? []}
        />
    )
}

export default AppContainer
