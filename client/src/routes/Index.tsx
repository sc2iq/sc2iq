import React from 'react'
import * as Auth0 from "../react-auth0-spa"
import styles from './Index.module.css'

const Home: React.FC = () => {
    const { loading, isAuthenticated, loginWithRedirect } = Auth0.useAuth0()

    return (
        <div>
            <h1>Home</h1>

            <button
                className={styles.loginButton}
                onClick={() => loginWithRedirect()}
            >
                Login
            </button>
        </div>
    )
}

export default Home