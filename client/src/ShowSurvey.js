import { useState, useEffect } from 'react'
import { Container, Row, Col, Button, ListGroup } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import { iconArrowRigth, iconArrowLeft } from './Icon'
import API from './API'

const uniqid = require('uniqid')

function ShowSurvey(props) {
    const [survey, setSurvey] = useState({ id: '', title: '', questions: [] })
    const [submissions, setSubmissions] = useState([{ idSurvey: '', name: '', choices: [{}] }])

    let position = props.indexSubmission


    useEffect(() => { //visualizza tutti i survey
        const getSurvey = async () => {
            const survey = await API.getSurveysById(props.idSurvey)
            setSurvey(survey)
        }
        const getSubmissions = async () => {
            const submissions = await API.getSubmissionsByIdSurvey(props.idSurvey)
            setSubmissions(submissions)
        }
        getSurvey()
        getSubmissions()
    }, [])

    const nextAnswers = (index, lengthSubmissions) => {
        if (index < lengthSubmissions - 1)
            return `/listSurvey/showSurvey/${survey.id}/${++index}`
        else
            return `/listSurvey/showSurvey/${survey.id}/${index}`
    }

    const previewAnswers = (index, lengthSubmissions) => {
        if (index > 0)
            return `/listSurvey/showSurvey/${survey.id}/${--index}`

        else
            return `/listSurvey/showSurvey/${survey.id}/${index}`
    }


    const questions = survey.questions.map((q, index) => {
        let choices = []
        if (submissions[position] !== undefined) {
            choices = submissions[position].choices.map((c) => {
                if (q.id === c.idQuestion) {
                    if (c.type === 'close') {
                        return c.content.map((content) => {
                            if (content !== '') {
                                return <ListGroup.Item key={uniqid()}>
                                    {content}
                                </ListGroup.Item>
                            }
                        })
                    }
                    else if(c.type === 'open'){
                        return <ListGroup.Item key={uniqid()}>
                                    {c.content}
                                </ListGroup.Item>
                    }

                }
            })
        }
        return <ListGroup.Item key={uniqid()} >
            <Container className="d-flex w-100 justify-content-between">
                <Col xs={10}>
                    {`${index + 1}: ${q.question}`}
                    <ListGroup variant='flush'>
                        {choices}
                    </ListGroup>
                </Col>
            </Container>
        </ListGroup.Item >
    })

    return (
        <Container className='below-nav'>
            <h5>{`Survey: ${survey.title}`}</h5>
            <h6>{submissions[position] !== undefined ? 'User: ' + submissions[position].name : ''}</h6>

            <ListGroup variant='flush'>
                {submissions[position] !== undefined ? questions : 'there are no answers!'}
            </ListGroup>

            <Row className="fixed-right-bottom">
                <Link to={previewAnswers(position, submissions.length)}>
                    <Button type="button" className="button-shape mr-1">
                        {iconArrowLeft}
                    </Button>
                </Link>
                <Link to={nextAnswers(position, submissions.length)}>
                    <Button type="button" className="button-shape mr-1">
                        {iconArrowRigth}
                    </Button>
                </Link>
            </Row>

        </Container>
    );

}

export default ShowSurvey