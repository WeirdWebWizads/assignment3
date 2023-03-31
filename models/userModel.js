const db = require('../db');
const mysql = require('mysql');

exports.getUserByUsername = async (username) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM www_accounts WHERE username = ?';
        db.query(sql, [username], (error, results) => {
            if (error) return reject(error);
            resolve(results[0]);
        });
    });
};

exports.createUser = async (username, hashedPassword, avatar, data) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO www_accounts (username, password, avatar, data) VALUES (?,?,?,?)';
        db.query(sql, [username, hashedPassword, avatar, data], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};