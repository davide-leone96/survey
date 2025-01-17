'use strict';
/* Data Access Object (DAO) module for accessing users */

const sqlite = require('sqlite3');

/* Open the database */
const db = new sqlite.Database('questionari.db', (err) => {
  if (err)
    throw err;
});


const bcrypt = require('bcrypt');

exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM amministratori WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err)
        reject(err);
      else if (row === undefined)
        resolve({ error: 'User not found.' });
      else {
        // by default, the local strategy looks for "username": not to create confusion in server.js, we can create an object with that property
        const user = { id: row.id, username: row.email, name: row.name }
        resolve(user);
      }
    });
  });
};

exports.getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM amministratori WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err)
        reject(err);

      else if (row === undefined)
        resolve(false);

      else {
        const user = { id: row.id, name: row.name, email: row.email };
        // check the hashes with an async call, given that the operation may be CPU-intensive (and we don't want to block the server)
        bcrypt.compare(password, row.hash).then(result => {
          if (result)
            resolve(user);
          else
            resolve(false);
        });
      }
    });
  });
};