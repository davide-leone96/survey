'use strict';

const sqlite = require('sqlite3');

/* Open the database */
const db = new sqlite.Database('questionari.db', (err) => {
    if (err)
        throw err;
});


//prende tutti i survey...serve per utenti non loggati
exports.listSurveys = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM surveys'
        db.all(sql, [], (err, rows) => {
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
        })
    });
}


exports.getSurveyById = (id) => { //versione non autenticata
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM surveys WHERE id = ?';
        db.get(sql, [id], (err, row) => {
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

exports.getQuestions = (survey) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM questions WHERE idSurvey = ?';
        db.all(sql, [survey.id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const questions = rows.map(q => ({
                id: q.id,
                orderId: q.idOrder,
                type: q.type,
                question: q.content,
                min: q.min,
                max: q.max
            }));
            resolve(questions);
        });
    });
};

exports.getOptions = (question, idSurvey) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM options WHERE idSurvey = ? AND idQuestion = ?';
        db.all(sql, [idSurvey, question.id], (err, rows) => {
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

//###########____________SAVE NEW SUBMISSION____________##############
exports.createSubmission = (submission) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO submissions(idSurvey, userName) VALUES(?, ?)'; //da cambiare
      db.run(sql, [submission.idSurvey, submission.name], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      });
    });
  };

  exports.addChoice = (idQuestion, idSubmission, choices) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO choices(idSubmission, idQuestion, risp1,risp2,risp3,risp4,risp5,risp6,risp7,risp8,risp9,risp10) VALUES(?, ?, ?,?,?,?,?,?,?,?,?,?)';
      db.run(sql, [idSubmission, idQuestion, choices[0] ? choices[0]:'', choices[1] ? choices[1] : '' , choices[2] ? choices[2] : '',choices[3]? choices[3] : '',choices[4]? choices[4] : '',choices[5]? choices[5] : '',choices[6]? choices[6] : '',choices[7]? choices[7] : '',choices[8]? choices[8] : '',choices[9]? choices[9] : ''], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      });
    });
  };

  exports.addOpenAnswer = (idQuestion, idSubmission, content) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO openAnswers(idSubmission, idQuestion, content) VALUES(?, ?, ?)';
      db.run(sql, [idSubmission, idQuestion, content], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      });
    });
  };