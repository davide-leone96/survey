import './App.css';
import { Form, Button, Alert, Container, Row } from 'react-bootstrap';
import { useState } from 'react';
import { useFormik } from 'formik';
import { Link } from 'react-router-dom';
import { iconUserBlack } from "./Icon.js";

function LoginForm(props) {
  const [errorMessage, setErrorMessage] = useState('');

  const formik = useFormik({
    initialValues: {
      username: '',   //'amministratore1@gmail.com', 
      password: '',   //'MAG2020', 
    }, enableReinitialize: true,
    onSubmit: values => {

      if (!values.username || !values.password || values.password.length < 6) {
        setErrorMessage('Wrong username and/or password');
      }
      else {
        const credentials = { username: values.username, password: values.password };
        setErrorMessage('');

        console.log("loginComponents.js User: "+credentials.username+" Password: " + credentials.password)
        
        props.login(credentials);
      }
    },
  });

  return (
    <Container className="login-form">
      <div className='user-icon text-center'>
        {iconUserBlack}
      </div>

      <h3 className="text-center mb-4 tx-green" >Login</h3>
      <Form onSubmit={formik.handleSubmit}>
        {(errorMessage || props.errmsg) ? <Alert variant="danger">{errorMessage ? errorMessage : props.errmsg}</Alert> : ""}
        <Form.Group controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={formik.values.username}
            onChange={formik.handleChange}
          />
        </Form.Group>

        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
          />
        </Form.Group>
        <Container className='d-flex justify-content-end'>
          <Row>

            <Button type="submit">
              Login
            </Button>
            <Link to={'/'} >
              <Button type="button" className="ml-1" variant="secondary" >Cancel</Button>
            </Link>

          </Row>
        </Container>
      </Form>
    </Container>
  );
}

function LogoutButton(props) {
  return (
    <Button variant="link" className="float-right" onClick={props.logout}>Logout</Button>
  )
}

export { LoginForm, LogoutButton };