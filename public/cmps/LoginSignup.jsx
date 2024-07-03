const { useState } = React

import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'
import { userService } from '../services/user.service.js'

export function LoginSignup({ onSetUser }) {

    const [isSignup, setIsSignUp] = useState(false)
    const [credentials, setCredentials] = useState(userService.getEmptyCredentials())

    function handleChange({ target }) {
        const { name: field, value } = target
        setCredentials(prevCreds => ({ ...prevCreds, [field]: value }))
    }

    function handleSubmit(ev) {
        ev.preventDefault()
        isSignup ? signup(credentials) : login(credentials)
    }

    function login(credentials) {
        userService.login(credentials)
            .then(onSetUser)
            .then(() => { showSuccessMsg('Logged in successfully') })
            .catch((err) => { showErrorMsg('Oops try again') })
    }

    function signup(credentials) {
        userService.signup(credentials)
            .then(onSetUser)
            .then(() => { showSuccessMsg('Signed in successfully') })
            .catch((err) => { showErrorMsg('Oops try again') })
    }
    return (
        <div className="login-box">
            <h2>Login</h2>
            <form className="login-form" onSubmit={handleSubmit}>
                <div className="user-box">
                    <input
                        type="text"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        required
                        autoFocus
                    />
                    <label>Username</label>
                </div>
                <div className="user-box">
                    <input
                        type="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                        autoComplete="off"
                    />
                    <label>Password</label>
                </div>
                {isSignup && (
                    <div className="user-box">
                        <input
                            type="text"
                            name="fullname"
                            value={credentials.fullname}
                            onChange={handleChange}
                            required
                        />
                        <label>Full name</label>
                    </div>
                )}
                <button>{isSignup ? 'Signup' : 'Login'}</button>
            </form>

            <div className="btns">
                <a href="#" onClick={() => setIsSignUp(!isSignup)}>
                    {isSignup ?
                        'Already a member? Login' :
                        'New user?   Signup here'
                    }
                </a >
            </div>
        </div >
    )
}
