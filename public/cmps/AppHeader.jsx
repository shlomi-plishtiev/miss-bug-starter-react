const { Link, NavLink } = ReactRouterDOM
const { useEffect, useState } = React
const { useNavigate } = ReactRouter

import { UserMsg } from './UserMsg.jsx'
import { LoginSignup } from './LoginSignup.jsx'
import { userService } from '../services/user.service.js'

export function AppHeader() {
    const navigate = useNavigate()
    const [user, setUser] = useState(userService.getLoggedinUser())

    function onLogout() {
        userService.logout()
            .then(() => onSetUser(null))
            .catch(err => showErrorMsg('OOPs try again'))
    }

    function onSetUser(user) {
        setUser(user)
        navigate('/')
    }

    return (
        <header className='container'>
            <UserMsg />
            <nav>
                <NavLink to="/">Home</NavLink> |<NavLink to="/bug">Bugs</NavLink> |
                <NavLink to="/about">About</NavLink>
            </nav>
            <h1>Bugs are Forever</h1>
            {user ? (
                <section className="header-name">

                    <Link to={`/user/${user._id}`} className="header-txt" >Hello   {user.fullname}</Link>
                    <br />
                    <button className="header-btn" onClick={onLogout}>Logout</button>
                </section>
            ) : (
                <section>
                    <LoginSignup onSetUser={onSetUser} />
                </section>
            )}
        </header>
    )
}
