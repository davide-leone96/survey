import { useState } from 'react'
import { Container, Row, Col, Button, ListGroup, Form, Modal, Alert } from 'react-bootstrap'
import { Link, Redirect } from 'react-router-dom'
import { iconArrowUp, iconArrowDown, iconDelete, iconPlus, iconSave } from './Icon.js'
import { useFormik } from 'formik'

const uniqid = require('uniqid'); //dovrebbe essere sufficiente solo qui...In caso anche in ListSurvey.js

function CreateSurvey(props) {
    const listQuestions = props.survey.questions.map((q, index) => { //mappo sui questionari // un survey specifico
        return <ListGroup.Item key={uniqid()} >
            <Container className="d-flex w-100 justify-content-between">
                <Col xs={10}>
                {`(${q.type})  ${q.question}`}
                </Col>
                <Col xs={3}>
                    <span style={{ cursor: "pointer" }} onClick={() => { props.upOrDown(props.survey, q, true) }} > {iconArrowUp} </span>
                    <span style={{ cursor: "pointer" }} onClick={() => { props.upOrDown(props.survey, q, false) }} > {iconArrowDown} </span>
                    <span style={{ cursor: "pointer" }} onClick={() => props.deleteQuestion(props.survey.id, q)} > {iconDelete} </span>
                </Col>
            </Container>
        </ListGroup.Item >
    });


    return (
        <Container className="below-nav">
            <Row>
                <h1>{props.survey.title}</h1>
            </Row>

            <ListGroup variant='flush'>
                {listQuestions}
            </ListGroup>

            <Row className="fixed-right-bottom">
                {props.survey.questions.length > 0 ?
                    <Link to={'/listSurvey'} >
                        <Button type="button" className="button-shape mr-1" onClick={() => { props.saveSurvey(props.survey) }} >
                            {iconSave}
                        </Button>
                    </Link> : ''
                }
                <Link to={'/createSurvey/addCloseQuestion'}>
                    <Button className='ml-2 mr-1' type="button" variant='dark'>
                        {iconPlus} close
                    </Button>
                </Link>
                <Link to={'/createSurvey/addOpenQuestion'}>
                    <Button type="button" variant='dark'>
                        {iconPlus} open
                    </Button>
                </Link>
                <Col sm={3}>
                    <Link to={'/listSurvey/'}>
                        <Button type="button" variant='secondary' className='ml-0' onClick={() => { props.deleteLastSurvey() }}>
                            Cancel
                    </Button>
                    </Link>
                </Col>

            </Row>

        </Container>
    );
}


//Componente per prendere NOME SURVEY   
function CreateSurveyModal(props) {
    const [submitted, setSubmitted] = useState(false)

    let dim = props.surveys.length > 0

    const validate = values => {
        const errors = {};

        if (!values.title) {
            errors.title = 'Title is required';
        }

        return errors;
    };

    const formik = useFormik({
        initialValues: {
            id: dim ? props.surveys.length : 0,
            title: '',
            questions: []
        }, enableReinitialize: true,
        validate,
        onSubmit: values => {
            let survey = { id: values.id, title: values.title, questions: values.questions }
            props.addSurvey(survey)
            console.log('NewSurvey id: ' + survey.id + 'title: ' + survey.title)
            setSubmitted(true)
        }
    });

    return (submitted ? <Redirect to='/createSurvey' /> :
        <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={true} animation={false} backdrop="static">
            <Modal.Header>
                <Modal.Title>Create Survey</Modal.Title>
            </Modal.Header>

            <Modal.Body>

                <Form onSubmit={formik.handleSubmit}>
                    <Form.Row>
                        <Form.Group as={Col} sm="12" >
                            <Form.Control type="text" id="title" name="title" placeholder="Insert title survey"
                                value={formik.values.title}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                            />
                            {formik.errors.title && formik.touched.title && (
                                <Alert className='mt-2' variant="danger">{formik.errors.title}</Alert>)}
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

export { CreateSurvey, CreateSurveyModal };