import { Container, Row, Col, Button, ListGroup } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import { iconPlus } from './Icon'

const uniqid = require('uniqid');

function ListSurvey(props) {
    const listSurvey = props.surveys.map((survey, index) => {
        return <ListGroup.Item key={uniqid()}>
            <Container className="d-flex w-100 justify-content-between">
                {props.loggedIn ?
                    <Col xs={6}>
                        <Link to={`/listSurvey/showSurvey/${survey.id}/${0}`} >
                            {survey.title}
                        </Link>
                    </Col>
                    : <Col xs={6}>
                        <Link to={'/newSubmission/' + survey.id} >
                            {survey.title}
                        </Link>
                    </Col>
                }

                {props.loggedIn ? <Col xs={6}>Number of submissions: {survey.count}</Col> : ''}
            </Container>
        </ListGroup.Item >
    })

    return (
        <Container className="below-nav">
            <Row>
                <h1>Surveys list</h1>
            </Row>
            <ListGroup variant='flush'>
                {listSurvey}
            </ListGroup>

            {props.loggedIn ? <Row className="fixed-right-bottom">
                <Link to={'/listSurvey/createSurvey'}>
                    <Button type="button" className="button-shape mr-1">
                        {iconPlus}
                    </Button>
                </Link>
            </Row> : ''}

        </Container>
    );
}

export default ListSurvey