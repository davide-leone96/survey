import { Container, Col, Button, Modal, Form, Alert } from 'react-bootstrap'
import { useState } from 'react'
import { Redirect, Link } from 'react-router-dom'
import { useFormik } from 'formik'

function CreateOpenQuestion(props) {
    const [submitted, setSubmitted] = useState(false)
    //const [errorPostSubmit, setErrorPostSubmit] = useState(undefined)

    let dim = props.survey.questions.length > 0;

    const validate = values => {
        const errors = {};

        if (!values.question) {
            errors.question = 'Question is required';
        }
        else if(values.question[values.question.length-1] !== '?'){
            errors.question = 'Last character must be ?';
        }

        return errors;
    };

    const formik = useFormik({
        initialValues: {
            id: dim ? props.survey.questions.length : 0,
            question: '',
            min: true,
            max: 1
        }, enableReinitialize: true,
        validate,
        onSubmit: values => {
            const question = { id: values.id, type: 'open', question: values.question, min: values.min ? 1 : 0, max: values.max };
            props.addQuestion(props.survey.id, question);
            setSubmitted(true);
        }
    });

    return (submitted ? <Redirect to='/createSurvey' /> :
        <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={true} animation={false} backdrop="static">
            <Modal.Header>
                <Modal.Title>Creating open question</Modal.Title>
            </Modal.Header>

            <Modal.Body>

                <Form onSubmit={formik.handleSubmit}>
                    <Form.Row>
                        <Form.Group as={Col} sm="12" >
                            <Form.Control type="text" id="question" name="question" placeholder="Insert your question"
                                value={formik.values.question}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                            />
                            {formik.errors.question && formik.touched.question && (
                                <Alert className='mt-2' variant="danger">{formik.errors.question}</Alert>)}
                        </Form.Group>
                    </Form.Row>

                    <Form.Row>
                        <Form.Group as={Col} sm="12" lg="4">
                            <Form.Check type="switch" label="mandatory" id="mandatory" name="min" checked={formik.values.min} onChange={formik.handleChange} />
                        </Form.Group>
                    </Form.Row>

                    <Container className='d-flex justify-content-end'>

                        <Button type="submit" >Submit</Button>

                        <Link to={'/createSurvey'} >
                            <Button className='ml-3' type='button' variant='secondary' >Cancel</Button>
                        </Link>
                    </Container>
                </Form>

            </Modal.Body>
        </Modal >
    );

}


function CreateCloseQuestion(props) {
    const [submitted, setSubmitted] = useState(false)
    //const [errorPostSubmit, setErrorPostSubmit] = useState(undefined)


    const validate = values => {
        const errors = {};

        if (!values.question && values.question < 10) {
            errors.question = 'Description Required';
        }
        else if(values.question[values.question.length-1] !== '?'){
            errors.question = 'Last character must be ?';
        }

        if (values.min && values.min < 0) {
            errors.min = 'Can not select negative number';
        }
        else if (values.min && values.min > values.max) {
            errors.min = 'Can not select min greater than max';
        }

        if (values.max && values.max > 10) {
            errors.max = 'Can not select max greter than 10';
        }
        else if (values.max && values.max < values.min) {
            errors.max = 'Can not select max smaller than min';
        }

        let answer = []
        answer.push(values.answer1)
        answer.push(values.answer2)
        answer.push(values.answer3)
        answer.push(values.answer4)
        answer.push(values.answer5)
        answer.push(values.answer6)
        answer.push(values.answer7)
        answer.push(values.answer8)
        answer.push(values.answer9)
        answer.push(values.answer10)
        for (let i = 0; i < values.max; i++) {
            if (!answer[i]) {
                errors.answers = `Must insert at least ${values.max} answers`
                console.log('Errore: ' + errors.answers)
            }
        }

        return errors;
    };

    let dim = props.survey.questions.length > 0;

    const formik = useFormik({
        initialValues: {
            id: dim ? props.survey.questions.length : 0,
            question: '',
            min: 0,
            max: 10,
            answer1: '',
            answer2: '',
            answer3: '',
            answer4: '',
            answer5: '',
            answer6: '',
            answer7: '',
            answer8: '',
            answer9: '',
            answer10: ''
        }, enableReinitialize: true,
        validate,
        onSubmit: values => {
            const options = []
            options.push(values.answer1)
            options.push(values.answer2)
            options.push(values.answer3)
            options.push(values.answer4)
            options.push(values.answer5)
            options.push(values.answer6)
            options.push(values.answer7)
            options.push(values.answer8)
            options.push(values.answer9)
            options.push(values.answer10)
            const question = { id: values.id, type: 'close', question: values.question, choices: [...options], min: values.min, max: values.max }; //da aggiungere le risposte
            console.log('question title : ' + question.question + ' min: ' + question.min + ' max: ' + question.max)
            props.addQuestion(props.survey.id, question);
            setSubmitted(true);
        }
    });

    return (submitted ? <Redirect to='/createSurvey' /> :
        <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={true} animation={false} backdrop="static">
            <Modal.Header>
                <Modal.Title>Creating close question</Modal.Title>
            </Modal.Header>

            <Modal.Body>

                <Form onSubmit={formik.handleSubmit}>
                    <Form.Row>
                        <Form.Group as={Col} sm="12" >
                            <Form.Control type="text" id="question" name="question" placeholder="Insert your question"
                                value={formik.values.question}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                            />
                            {formik.errors.question && formik.touched.question && (
                                <Alert className='mt-2' variant="danger">{formik.errors.question}</Alert>)}
                        </Form.Group>
                    </Form.Row>

                    <Form.Row>

                        <Form.Label htmlFor="min" className='mt-2 ml-1'>
                            Min
                        </Form.Label>
                        <Form.Group as={Col} sm="3" >
                            <Form.Control type="number" id="min" name="min"
                                value={formik.values.min}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                            />
                            {formik.errors.min && (
                                <Alert className='mt-2' variant="danger">{formik.errors.min}</Alert>)}
                        </Form.Group>

                        <Form.Label htmlFor="max" className='mt-2 ml-4'>
                            Max
                        </Form.Label>
                        <Form.Group as={Col} sm="3" >
                            <Form.Control type="number" id="max" name="max"
                                value={formik.values.max}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                            />
                            {formik.errors.max && (
                                <Alert className='mt-2' variant="danger">{formik.errors.max}</Alert>)}
                        </Form.Group>

                    </Form.Row>


                    {/*-------RISPOSTE----------- */}
                    <Form.Row>
                        <Form.Group as={Col} sm="12" >
                            <Form.Control type="text" id="answer1" name="answer1" placeholder="Answer 1"
                                value={formik.values.answer1}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                            />
                        </Form.Group>
                    </Form.Row>

                    <Form.Row>
                        <Form.Group as={Col} sm="12" >
                            <Form.Control type="text" id="answer2" name="answer2" placeholder="Answer 2"
                                value={formik.values.answer2}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                                disabled={!formik.values.answer1} value={!formik.values.answer1 ? "" : formik.values.answer2}
                            />
                        </Form.Group>
                    </Form.Row>

                    <Form.Row>
                        <Form.Group as={Col} sm="12" >
                            <Form.Control type="text" id="answer3" name="answer3" placeholder="Answer 3"
                                value={formik.values.answer3}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                                disabled={!formik.values.answer2} value={!formik.values.answer2 ? "" : formik.values.answer3}
                            />
                        </Form.Group>
                    </Form.Row>

                    <Form.Row>
                        <Form.Group as={Col} sm="12" >
                            <Form.Control type="text" id="answer4" name="answer4" placeholder="Answer 4"
                                value={formik.values.answer4}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                                disabled={!formik.values.answer3} value={!formik.values.answer3 ? "" : formik.values.answer4}
                            />
                        </Form.Group>
                    </Form.Row>

                    <Form.Row>
                        <Form.Group as={Col} sm="12" >
                            <Form.Control type="text" id="answer5" name="answer5" placeholder="Answer 5"
                                value={formik.values.answer5}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                                disabled={!formik.values.answer4} value={!formik.values.answer4 ? "" : formik.values.answer5}
                            />
                        </Form.Group>
                    </Form.Row>

                    <Form.Row>
                        <Form.Group as={Col} sm="12" >
                            <Form.Control type="text" id="answer6" name="answer6" placeholder="Answer 6"
                                value={formik.values.answer6}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                                disabled={!formik.values.answer5} value={!formik.values.answer5 ? "" : formik.values.answer6}
                            />
                        </Form.Group>
                    </Form.Row>

                    <Form.Row>
                        <Form.Group as={Col} sm="12" >
                            <Form.Control type="text" id="answer7" name="answer7" placeholder="Answer 7"
                                value={formik.values.answer7}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                                disabled={!formik.values.answer6} value={!formik.values.answer6 ? "" : formik.values.answer7}
                            />
                        </Form.Group>
                    </Form.Row>

                    <Form.Row>
                        <Form.Group as={Col} sm="12" >
                            <Form.Control type="text" id="answer8" name="answer8" placeholder="Answer 8"
                                value={formik.values.answer8}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                                disabled={!formik.values.answer7} value={!formik.values.answer7 ? "" : formik.values.answer8}
                            />
                        </Form.Group>
                    </Form.Row>

                    <Form.Row>
                        <Form.Group as={Col} sm="12" >
                            <Form.Control type="text" id="answer9" name="answer9" placeholder="Answer 9"
                                value={formik.values.answer9}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                                disabled={!formik.values.answer8} value={!formik.values.answer8 ? "" : formik.values.answer9}
                            />
                        </Form.Group>
                    </Form.Row>

                    <Form.Row>
                        <Form.Group as={Col} sm="12" >
                            <Form.Control type="text" id="answer10" name="answer10" placeholder="Answer 10"
                                value={formik.values.answer10}
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                                disabled={!formik.values.answer9} value={!formik.values.answer9 ? "" : formik.values.answer10}
                            />
                        </Form.Group>
                    </Form.Row>
                    {formik.errors.answers && (
                        <Alert variant="danger">{formik.errors.answers}</Alert>)}

                    <Container className='d-flex justify-content-end'>

                        <Button type="submit" >Submit</Button>

                        <Link className='ml-3' to={'/createSurvey'} >
                            <Button type='button' variant='secondary' >Cancel</Button>
                        </Link>
                    </Container>
                </Form>

            </Modal.Body>
        </Modal >
    );
}

export { CreateCloseQuestion, CreateOpenQuestion };