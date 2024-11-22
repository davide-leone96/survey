'use strict';

const sqlite = require('sqlite3');

/* Open the database */
const db = new sqlite.Database('questionari.db', (err) => {
  if (err)
    throw err;
});

//surveys relativi ad un amministratore
exports.getSurveysByUser = (user) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM surveys WHERE user = ?';
    db.all(sql, [user], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const surveys = rows.map(s => ({
        id: s.id,
        title: s.title,
        questions: []
      }));
      resolve(surveys);
    });
  });
};


exports.getSurveysById = (id, user) => { //versione autenticata
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM surveys WHERE id = ? AND user = ?';
    db.get(sql, [id, user], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        resolve({ error: 'Survey not found.' });
      }
      else {
        const survey = { id: row.id, title: row.title };
        resolve(survey);
      }
    });
  });
};

exports.getSurveyForReply = (id) => { //versione non autenticata
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM surveys WHERE id = ?';
    db.get(sql, [id, user], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        resolve({ error: 'Survey not found.' });
      }
      else {
        const survey = { id: row.id, title: row.title };
        resolve(survey);
      }
    });
  });
};

exports.getQuestionsBySurvey = (survey) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM questions WHERE idSurvey = ?';
    db.all(sql, [survey.id], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const questions = rows.map(q => ({
        id: q.id,
        orderId: q.orderId,
        question: q.content,
        //options: []
      }));
      resolve(questions);
    });
  });
};

exports.getOptionsByQuestion = (question, idSurvey) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM options WHERE idQuestion = ?';
    db.all(sql, [question.id], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const options = rows.map(o => ({
        id: o.id,
        content: o.content,
      }));
      resolve(options);
    });
  });
};


//---------CREAZIONE QUESTIONARIO USANDO PIU' TABELLE--------------------------
exports.createSurvey = (survey) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO surveys(title, user) VALUES(?, ?)'; //da cambiare
    db.run(sql, [survey.title, survey.user], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};

exports.addQuestion = (question, idSurvey) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO questions(idOrder, idSurvey, type, content, min, max) VALUES(?, ?, ?, ?, ?, ?)';
    db.run(sql, [question.id, idSurvey, question.type, question.question, question.min, question.max], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};

exports.addOption = (option, idSurvey, idQuestion) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO options(idSurvey, idQuestion, content) VALUES(?, ?, ?)';
    db.run(sql, [idSurvey, idQuestion, option], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};



//___________Prende le risposte________
exports.getSubmissions = (idSurvey) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM submissions WHERE idSurvey = ? ';
    db.all(sql, [idSurvey], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const submissions = rows.map(s => ({
        id: s.id,
        name: s.userName,
      }));
      resolve(submissions);
    });
  });
};

exports.getChoicesBySubmissionId = (idSubmission) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM choices WHERE idSubmission = ? ';
    db.all(sql, [idSubmission], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      else if (rows === undefined) {
        resolve([])
      }
      else {
        const choices = rows.map(c => ({
          id: c.id,
          idQuestion: c.idQuestion,
          type: 'close',
          content: [
            c.risp1,
            c.risp2,
            c.risp3,
            c.risp4,
            c.risp5,
            c.risp6,
            c.risp7,
            c.risp8,
            c.risp9,
            c.risp10]
        }));
        resolve(choices);
      }
    });
  });
};

exports.getOpenAnswerBySubmissionId = (idSubmission) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM openAnswers WHERE idSubmission = ? ';
    db.all(sql, [idSubmission], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      if (rows === undefined) {
        resolve([])
      }
      else {
        const content = rows.map(c => ({
          id: c.id,
          idQuestion: c.idQuestion,
          type: 'open',
          content: c.content
        }));
        resolve(content);
      }
    });
  });
};


exports.getNumberOfSubmissionsForEachSurvey = (idSurvey) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT COUNT(idSurvey) as count FROM submissions WHERE idSurvey = ? ';
    db.all(sql, [idSurvey], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      const numOfSubmissions = result.map(r => ({
        result: r.count
      }));
      resolve(numOfSubmissions);
    });
  });
};

