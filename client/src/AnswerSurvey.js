
import { useState, useEffect } from 'react'
import { Container, Row, Col, Button, Alert } from 'react-bootstrap'

import React from 'react';
import { Formik, Field, Form } from 'formik';
import { Redirect, Link } from 'react-router-dom'

import API from './API'



const uniqid = require('uniqid')

function AnswerSurvey(props) {
    const [survey, setSurvey] = useState({ id: '', title: '', questions: [] })
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => { //visualizza tutti i survey
        const getSurvey = async () => {
            const survey = await API.getSurveysById(props.idSurvey)
            setSurvey(survey)
        }
        getSurvey()
    }, [])

    const validateNumCharacter = value => {
        let errorMessage;
        if (value.length > 200) {
            errorMessage = 'Answer too long';
        }
        return errorMessage;
    };


    const iv = () => {
        let name
        let iv = {}
        for (let q of survey.questions) {
            name = q.id
            iv[name] = ''
        }

        return iv;
    }

    const validate = (values) => {
        const errors = {};

        for (let q of survey.questions) {
            if (q.type === 'close') {
                    if (values[q.id].length < q.min) {
                        errors[q.id] = `Must select at least ${q.min} options!`   
                    }
                    if (values[q.id].length > q.max) {
                        errors[q.id] = `You can select maximum ${q.max} options!`
                    }

            }
            else if(q.type === 'open'){
                if (values[q.id].length < q.min) {
                    errors[q.id] = `Answer is required`
                }
            }
        }
        return errors;
    }

    const MyForm = () => (
        <Formik
            initialValues={
                iv()// genero dinamicame i valori inziali
            }
            validate={validate}
            onSubmit={async values => {
                let risposte = []
                console.log(JSON.stringify(values, null, 2));

                for (let q of survey.questions) {
                    //console.log("IdQuestions: " + q.id)
                    if (values[q.id] !== undefined) {
                        //qui mi costruisco le risposte
                        risposte.push({ idQuestions: q.id, type: q.type, choices: values[q.id] })
                    }
                }

                props.addSubmission(survey.id, props.submission.name, risposte)
                setSubmitted(true)
            }}
        >



            {({ errors, touched }) => (<Form>
                {survey.questions.map((q, index) => {
                    let choices
                    if (q.type === 'close') {
                        choices = q.choices.map((c) => {
                            return <Row key={uniqid()}>
                                <label>
                                    <Field type="checkbox" name={q.id} value={c.content} />
                                    {c.content}
                                </label>
                            </Row>
                        })
                    }
                    else if (q.type === 'open') {
                        choices = <>
                            <Field validate={validateNumCharacter} type="text" name={q.id} placeholder='Insert your answer' />
                        </>
                    }

                    return <>
                        <Row className='ml-1'>
                            {q.question}
                            {q.type === 'close' ? `   (min:${q.min}, max:${q.max})` : q.min === 1 ? '   (required)' : '   (optional)'}
                        </Row>

                        <Row>
                            <Col sm={12} className='offset-sm-1' >
                                {choices}
                                {errors[q.id] && touched[q.id] ? <Alert className='mt-2' variant="danger">{errors[q.id]}</Alert> : null}
                            </Col>
                        </Row>
                    </>
                })

                }

                <Row className="fixed-right-bottom">

                    <Button className='mr-1' type="submit">Submit</Button>

                    <Link to={'/listSurvey/'}>
                        <Button type="button" variant='secondary' className='ml-0' onClick={() => { props.deleteSubmission() }}>
                            Cancel
                </Button>
                    </Link>

                </Row>



            </Form>
            )}
        </Formik>
    );


    return (submitted ? <Redirect to='/listSurvey' /> : <Container className='below-nav'>
        <h3>{props.submission.name}</h3>

        <MyForm />

    </Container>)
}


export default AnswerSurvey