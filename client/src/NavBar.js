import { Navbar, Dropdown, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import { iconSurvey, iconUser } from './Icon.js'
import { LogoutButton } from './LoginComponents.js'


function NavBar(props) {
    return (
        <Navbar collapseOnSelect bg="dark" fixed="top" expand="sm">

            <Navbar.Brand>
                <Link to={{ pathname: '/listSurvey' }} style={{ color: "white", textDecoration: "none" }}>
                    {iconSurvey} Surveys
                </Link>
            </Navbar.Brand >

            {props.loggedIn ?
                    <Dropdown className="ml-auto">
                        <Dropdown.Toggle variant="dark">
                            Welcome {props.user} {iconUser}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <LogoutButton logout={props.logout}></LogoutButton>
                        </Dropdown.Menu>
                    </Dropdown>
                    : <Link className="ml-auto" to={
                                { pathname: '/login' }
                            }>
                        <Button type="button" variant="dark">
                            Login {iconUser}
                        </Button>
                    </Link>}
        </Navbar>
    );
}

export default NavBar