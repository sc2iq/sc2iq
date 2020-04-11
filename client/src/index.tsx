import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { store } from './app/store'
import { Provider as ReduxProvider } from 'react-redux'
import { Auth0Provider } from "./react-auth0-spa"
import config from "./auth_config.json"
import history from "./utilities/history"
import './index.css'

// A function that routes the user to the right place
// after login
const onRedirectCallback = (appState: any) => {
    history.push(
        appState?.targetUrl ?? window.location.pathname
    )
}

ReactDOM.render((
    <Auth0Provider
        domain={config.domain}
        client_id={config.clientId}
        audience={config.audience}
        redirect_uri={window.location.origin}
        onRedirectCallback={onRedirectCallback}
    >
        <ReduxProvider store={store}>
            <App />
        </ReduxProvider>
    </Auth0Provider>
), document.getElementById('root'))
