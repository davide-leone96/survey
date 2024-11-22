import { useState } from 'react'
import { Container, Col, Button, Form, Modal, Alert } from 'react-bootstrap'
import { Link, Redirect } from 'react-router-dom'
import { useFormik } from 'formik'

function AnswerSurveyModal(props) {
    const [submitted, setSubmitted] = useState(false)

    const validate = values => {
        const errors = {};

        if (!values.name) {
            errors.name = 'Name user is required';
        }

        return errors;
    };


    const formik = useFormik({
        initialValues: {
            name: ''
        }, enableReinitialize: true,
        validate,
        onSubmit: values => {
            props.setSubmission({ idSurvey: '', name: values.name, choices: [{}] })
            setSubmitted(true)
        }
    });

    return ( submitted ? <Redirect to={`/answersSurvey/${props.idSurvey}`} /> :
        <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={true} animation={false} backdrop="static">
            <Modal.Header>
                <Modal.Title>New submission</Modal.Title>
            </Modal.Header>

            <Modal.Body>

                <Form onSubmit={formik.handleSubmit}>
                    <Form.Row>
                        <Form.Group as={Col} sm="12" >
                            <Form.Control type="text" id="name" name="name" placeholder="Your name"
                                value={formik.values.name}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                            />
                            {formik.errors.name && formik.touched.name && (
                                <Alert className='mt-2' variant="danger">{formik.errors.name}</Alert>)}
                        </Form.Group>
                    </Form.Row>

                    <Container className='d-flex justify-content-end'>
                        
                        <Button className='mr-1' type="submit" >Submit</Button>

                        <Link to={'/listSurvey'} >
                            <Button type='button' variant='secondary' >Cancel</Button>
                        </Link>

                    </Container>
                </Form>

            </Modal.Body>
        </Modal >
    );
}

export default AnswerSurveyModal