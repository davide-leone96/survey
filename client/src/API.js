const BASEURL = "/api"

async function getSurveysByUser() {
  try {
    const response = await fetch(BASEURL + '/surveysByUser');
    if (!response.ok) {
      throw Error(response.statusText);
    }
    let type = response.headers.get('Content-Type');
    //type = 'application/json; charset=utf-8'. 
    //Per prendere solo application/json, faccio split sullo spazio vuoto (restituisce un array) e prendo il primo elemento [0] 
    if (type.split(' ')[0] !== 'application/json;') {
      throw new TypeError(`Expected JSON, got ${type}`);
    }
    const surveys = await response.json();
    return surveys;
  } catch (err) {
    console.log(err);
  }
}

async function getSurveysById(idSurvey, loggedIn) {
  try {
    const response = loggedIn ? await fetch(BASEURL + '/survey/' + idSurvey) : await fetch(BASEURL + '/compileSurvey/' + idSurvey);
    if (!response.ok) {
      throw Error(response.statusText);
    }
    let type = response.headers.get('Content-Type');
    //type = 'application/json; charset=utf-8'. 
    //Per prendere solo application/json, faccio split sullo spazio vuoto (restituisce un array) e prendo il primo elemento [0] 
    if (type.split(' ')[0] !== 'application/json;') {
      throw new TypeError(`Expected JSON, got ${type}`);
    }
    const survey = await response.json();
    return survey;
  } catch (err) {
    console.log(err);
  }
}




async function getAllSurveys() { //tramite id
  try {
    const response = await fetch(BASEURL + '/surveys');
    if (!response.ok) {
      throw Error(response.statusText);
    }
    let type = response.headers.get('Content-Type');
    //prendo solo application/json 
    if (type.split(' ')[0] !== 'application/json;') {
      throw new TypeError(`Expected JSON, got ${type}`);
    }
    const surveys = await response.json();
    return surveys;
  } catch (err) {
    console.log(err);
  }
}

async function addSurvey(survey) {
  try {
    const response = await fetch(BASEURL + '/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(survey),
    });

    if (!response.ok) {
      throw Error(response.statusText);
    }

    let type = response.headers.get('Content-Type');
    if (type.split(' ')[0] !== 'application/json;') {
      throw new TypeError(`Expected JSON, got ${type}`);
    }

    const idSurvey = await response.json();
    const s = { id: idSurvey, ...survey }; //da togliere id 
    return s;
  } catch (err) {
    console.log('Failed to store data on server: ' + err);
  }
}

async function addSubmission(submission) {
  try {
    const response = await fetch(BASEURL + '/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });

    if (!response.ok) {
      throw Error(response.statusText);
    }

    let type = response.headers.get('Content-Type');
    if (type.split(' ')[0] !== 'application/json;') {
      throw new TypeError(`Expected JSON, got ${type}`);
    }

    const idSubmission = await response.json();
    //const s = { id: idSurvey, ...survey }; //da togliere id 
    return idSubmission;
  } catch (err) {
    console.log('Failed to store data on server: ' + err);
  }
}

async function getSubmissionsByIdSurvey(idSurvey) {
  try {
    const response = await fetch(BASEURL + '/submissions/' + idSurvey);
    if (!response.ok) {
      throw Error(response.statusText);
    }
    let type = response.headers.get('Content-Type');
    //type = 'application/json; charset=utf-8'. 
    //Per prendere solo application/json, faccio split sullo spazio vuoto (restituisce un array) e prendo il primo elemento [0] 
    if (type.split(' ')[0] !== 'application/json;') {
      throw new TypeError(`Expected JSON, got ${type}`);
    }
    const submissions = await response.json();
    return submissions;
  } catch (err) {
    console.log(err);
  }
}


















async function logIn(credentials) {
  let response = await fetch(BASEURL + '/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user.name;
  }
  else {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch (err) {
      throw err;
    }
  }
}

async function logOut() {
  await fetch(BASEURL + '/sessions/current', { method: 'DELETE' });
}

async function getUserInfo() {
  const response = await fetch(BASEURL + '/sessions/current');
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}


const API = { getAllSurveys, getSurveysById, getSurveysByUser, addSurvey, addSubmission, getSubmissionsByIdSurvey, logIn, logOut, getUserInfo };
export default API;