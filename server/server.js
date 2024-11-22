'use strict';

const express = require('express');
const morgan = require('morgan');
const { check, validationResult, Result } = require('express-validator');


const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy; // username and password for login

const session = require('express-session'); // enable sessions

const userDao = require('./userDao');
const dao = require('./dao');
const normalDao = require('./normalDao')

passport.use(new LocalStrategy(
  function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});


// init express
const app = new express();
const port = 3001;

app.use(morgan('dev'));
app.use(express.json());


// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => { //inserire come secondo parametri di una app.get o app.qualcosa
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'not authenticated' });
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'a secret sentence for the exam-questionario, not to share with anybody and anywhere, used to sign the session ID cookie',
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

//login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);
      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Unauthenticated user!' });;
});

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout();
  res.end();
});

//##################_______________USER PART_____________###############################
app.get('/api/surveys', (req, res) => {
  normalDao.listSurveys()
    .then((surveys) => res.status(200).json(surveys))
    .catch(() => res.status(500).end());
});

app.get('/api/compileSurvey/:id', (req, res) => { 
  normalDao.getSurveyById(req.params.id)
    .then((survey) => {
      let promises = []
      let result = []
      normalDao.getQuestions(survey).then((questions) => {

        for (let q of questions) {
          if(q.type === 'close'){
            promises.push(normalDao.getOptions(q, survey.id).then((choices) => {
              q.choices = [...choices]
            }))
          }
          else{
            q.choices = []
          }
          result.push(q)
        }

        survey.questions = [...result]
        Promise.all(promises).then(() => res.status(200).json(survey))
        //survey.questions = [...questions]

      })//.then( () => res.status(200).json(result) )
    })
    .catch(() => res.status(500).end())
});

//##############______________QUERY  RELATIVE ALLE RISPOSTE________________________#####################
app.post('/api/submissions', (req, res) => {
  const submission = {
    idSurvey: req.body.idSurvey,
    name: req.body.name,
    choices: [...req.body.choices], //{idQuestion, choices[]}
  };
  normalDao.createSubmission(submission)
    .then((idSubmission) => {
      let choices = []
      for (let c of submission.choices) {
        if(c.type === 'close'){
          choices.push(normalDao.addChoice(c.idQuestions, idSubmission, c.choices)) //memorizzare anche le scelte
        }
        else if(c.type === 'open'){
          choices.push(normalDao.addOpenAnswer(c.idQuestions, idSubmission, c.choices)) //memorizzare anche le scelte
        }
        
      }
      Promise.all(choices).then(() => res.status(200).json(idSubmission))
      //res.status(200).json(idSubmission)
    })
    .catch(() => res.status(500).end())
});

app.get('/api/submissions/:id', isLoggedIn, (req, res) => {
  dao.getSubmissions(req.params.id)
    .then((submissions) => {
      let promisesChoices = []
      let promisesOpen = []
      let result = []

      for (let s of submissions) {
        promisesChoices.push(dao.getChoicesBySubmissionId(s.id).then((choices) => s.choices = [...choices] ))
        promisesOpen.push(dao.getOpenAnswerBySubmissionId(s.id).then((choice) =>  s.choices = [...s.choices, ...choice] ))
        result.push(s)
      }
      Promise.all(promisesOpen).then(() =>  res.status(200).json(result))
    })
    .catch(() => res.status(500).end());
});




//##############____________AMMINISTRATOR PART____________#########################################
//Aggiunge survey nel db usando piu' tabelle
app.post('/api/surveys', isLoggedIn, (req, res) => {
  const survey = {
    title: req.body.title,
    user: req.user.id,
    questions: [...req.body.questions],
    choices: [req.body.choices]
  };
  dao.createSurvey(survey)
    .then((idSurvey) => {
      let questions = []
      for (let q of survey.questions) {
        questions.push(dao.addQuestion(q, idSurvey).then((idQuestion) => {
          if (q.type === 'close') {
            let choices = []
            for (let c of q.choices) {// qui inghippo
              if (c != '')
                choices.push(dao.addOption(c, idSurvey, idQuestion))
            }
            Promise.all(choices).then(() => res.status(200))
          }

        }))
      }
      Promise.all(questions).then(() => res.status(200).json(idSurvey))
    })
    .catch(() => res.status(500).end())
});

app.get('/api/surveysByUser', isLoggedIn, (req, res) => {
  dao.getSurveysByUser(req.user.id)
    .then((surveys) => { 
      
      let promises = []
      let result = []
      for(let s of surveys){
        promises.push(dao.getNumberOfSubmissionsForEachSurvey(s.id).then((r) => { s.count = r[0].result}))
        result.push(s)
      }
      Promise.all(promises).then(() => res.status(200).json(result) )
    
     })
    .catch(() => res.status(500).end())

    
});

app.get('/api/survey/:id', isLoggedIn, (req, res) => {
  dao.getSurveysById(req.params.id, req.user.id)
    .then((survey) => {
      let promises = []
      let result = []
      dao.getQuestionsBySurvey(survey).then((questions) => {
        for (let q of questions) {
          promises.push(dao.getOptionsByQuestion(q, survey.id).then((choices) => {
            q.choices = [...choices]
          }))
          result.push(q)
        }
        survey.questions = [...result]
        Promise.all(promises).then(() => res.status(200).json(survey))
        //survey.questions = [...questions]

      })//.then( () => res.status(200).json(result) )
    })
    .catch(() => res.status(500).end())
});


// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


