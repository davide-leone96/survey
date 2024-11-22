import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import API from './API.js'

import { useState, useEffect } from 'react'

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Redirect } from 'react-router'

import NavBar from './NavBar.js'
import { LoginForm } from './LoginComponents'
import ListSurvey from './ListSurvey'
import { CreateSurvey, CreateSurveyModal } from './CreateSurvey'
import { CreateCloseQuestion, CreateOpenQuestion } from './CreateQuestion'


import ShowSurvey from './ShowSurvey'
import AnswerSurvey from './AnswerSurvey'
import AnswerSurveyModal from './AnswerSurveyModal'
import { Container } from 'react-bootstrap'


function App() {
  const [dirty, setDirty] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [user, setUser] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)

  const [surveys, setSurveys] = useState([])


  const [submission, setSubmission] = useState({ idSurvey: '', name: '', choices: [{}] })

  //AUTENTICAZIONE
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getUserInfo()
        setUser(user.name)
        setLoggedIn(true)
      } catch (err) {
        console.error(err.error)
      }
    }
    checkAuth()
  }, [])

  //CARICA SURVEY DA DB
  useEffect(() => { //visualizza tutti i survey
    const getSurveys = async () => {
      let surveys = []
      if (loggedIn) {
        surveys = await API.getSurveysByUser()
      }
      else {
        surveys = await API.getAllSurveys()
      }
      setSurveys(surveys)
      setDirty(false)
      setLoading(false)
    }
    getSurveys()
  }, [dirty, loggedIn])

  const doLogIn = async (credentials) => {
    try {
      const user = await API.logIn(credentials)
      setUser(user)
      setLoggedIn(true)
      setDirty(true)
      setLoading(true)
      setMessage({ msg: `Welcome, ${user}!`, type: 'success' })
    } catch (err) {
      setMessage({ msg: err, type: 'danger' })
    }
  }

  const doLogOut = async () => {
    await API.logOut()
    setUser('')
    setDirty(false)
    setLoading(false)
    setLoggedIn(false)
    setMessage('')
  }

  const addSurvey = (survey) => {
    setSurveys(oldSurveys => [...oldSurveys, survey])
  }

  const saveSurvey = async (survey) => {
    console.log('\n\nSALVATAGGIO su server del surveys!!!')
    await API.addSurvey(survey)
    setDirty(true)
  }



  const deleteLastSurvey = () => {
    setSurveys(oldSurvey => oldSurvey.filter((s, index) => index !== surveys.length - 1))
  }

  const deleteSubmission = () => {
    setSubmission({ idSurvey: '', name: '', choices: [{}] })
  }

  const addQuestion = (idSurvey, newQuestion) => {
    let questions

    setSurveys(oldSurveys => oldSurveys.map((s) => {
      if (s.id === idSurvey) {
        //costruire nuovo oggetto da ritornare !!!
        questions = [...s.questions, newQuestion]
        return { id: s.id, title: s.title, questions: questions }
      }
      else {
        return s
      }
    })
    )
  }

  const deleteQuestion = (idSurvey, question) => { // FUNZIONA!!!!!!
    let questions

    setSurveys(oldSurveys => oldSurveys.map((s) => {
      if (s.id === idSurvey) {
        //costruire nuovo oggetto da ritornare !!!
        questions = s.questions.filter((q) => q.id !== question.id).map((q, index) => {
          if(q.type === 'close'){
            return { id: index, question: q.question, type: q.type, min: q.min, max: q.max, choices: question.choices }
          }
          else if(q.type === 'open'){
            return { id: index, question: q.question, type: q.type, min: q.min, max: q.max }
          }
          
        })
        return { id: s.id, title: s.title, questions: questions }
      }
      else {
        return s
      }
    })
    )
  }

  const modifyQuestionsSurvey = (survey, newQuestions) => {
    //qui creo il nuovo questions modificato !!!
    //mi serve per creare il nuovo survey usando il nuovo questions
    //creo una funziona modifica surveys
    setSurveys(oldSurveys => oldSurveys.map((s) => {
      if (s.id === survey.id) {
        //costruire nuovo oggetto da ritornare !!!
        return { id: s.id, title: s.title, questions: newQuestions }
      }
      else {
        return s
      }
    })
    )
  }

  const upOrDown = (survey, question, up) => {
    let tmp //serve per effettuare swap
    let newQuestions //conterra' le nuove questions

    if (up && question.id > 0) {
      tmp = survey.questions[question.id - 1]
      newQuestions = survey.questions.map((q) => {
        if (q.id === question.id - 1) {
          return { id: q.id, type: question.type, min: question.min, max: question.max, question: question.question, choices: question.choices }
        }
        else if (q.id === question.id) {
          return { id: q.id, type: tmp.type, min: tmp.min, max: tmp.max, question: tmp.question, choices: tmp.choices }
        }
        else {
          return q
        }
      })
      modifyQuestionsSurvey(survey, newQuestions)
    } else if (!up && question.id < survey.questions.length - 1) {
      tmp = survey.questions[question.id + 1]
      newQuestions = survey.questions.map((q) => {
        if (q.id === question.id + 1) {
          return { id: q.id, type: question.type, min: question.min, max: question.max, question: question.question, choices: question.choices }
        }
        else if (q.id === question.id) {
          return { id: q.id, type: tmp.type, min: tmp.min, max: tmp.max, question: tmp.question, choices: tmp.choices }
        }
        else {
          return q
        }
      })
      modifyQuestionsSurvey(survey, newQuestions)
    }
  }

  const addSubmission = async (idSurveyForm, nameForm, choicesForm) => {
    setSubmission({ idSurvey: idSurveyForm, name: nameForm, choices: [...choicesForm] })
    let newSubmission = { idSurvey: idSurveyForm, name: nameForm, choices: [...choicesForm] }
    API.addSubmission(newSubmission)
    console.log('Aggiungo al server: ' + JSON.stringify(choicesForm, null, 2));
  }

  return (loading ? <Container>Loading...</Container> :
    <Router>
      <NavBar logout={doLogOut} loggedIn={loggedIn} user={user} message={message} />

      <Switch>

        <Route exact path="/login" render={() =>
          <> {loggedIn ? <Redirect to="/listSurvey" /> : <LoginForm login={doLogIn} errmsg={message.msg ? message.msg : ''} />} </>
        } />

        <Route exact path="/createSurvey" render={() =>
          <> {loggedIn ? <CreateSurvey survey={surveys[surveys.length - 1]} deleteQuestion={deleteQuestion} deleteLastSurvey={deleteLastSurvey} upOrDown={upOrDown} saveSurvey={saveSurvey} /> : <Redirect to="/login" />} </>
        } />

        <Route exact path="/createSurvey/addCloseQuestion" render={() =>
          <CreateCloseQuestion addQuestion={addQuestion} survey={surveys[surveys.length - 1]} />
        } />

        <Route exact path="/createSurvey/addOpenQuestion" render={() =>
          <CreateOpenQuestion addQuestion={addQuestion} survey={surveys[surveys.length - 1]} />
        } />

        <Route exact path="/listSurvey" render={() =>
          <ListSurvey loggedIn={loggedIn} surveys={surveys} />
        } />

        <Route exact path="/listSurvey/createSurvey" render={() =>
          <> {loggedIn ? <CreateSurveyModal surveys={surveys} addSurvey={addSurvey} /> : <Redirect to='/listSurvey' />} </>
        } />

        <Route exact path="/listSurvey/showSurvey/:id/:submission" render={({ match }) =>
          <> {loggedIn ? <ShowSurvey idSurvey={match.params.id} indexSubmission={match.params.submission} /> : <Redirect to='/listSurvey' />} </>
        } />

        <Route exact path="/answersSurvey/:id" render={({ match }) =>
          <> {!loggedIn ? <AnswerSurvey idSurvey={match.params.id} submission={submission} addSubmission={addSubmission} deleteSubmission={deleteSubmission} /> : <Redirect to='/listSurvey' />} </>
        } />

        <Route exact path="/newSubmission/:id" render={({ match }) =>
          <> {!loggedIn ? <AnswerSurveyModal surveys={surveys} setSubmission={setSubmission} idSurvey={match.params.id} /> : <Redirect to='/listSurvey' />} </>
        } />


        <Route path="/" render={() =>
          <Redirect to="/listSurvey" />
        } />

      </Switch>
    </Router>

  )
}

export default App
