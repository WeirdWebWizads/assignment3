const path = require('path');

exports.index = (req, res) => {
  if (req.session.loggedin) {
    res.sendFile(path.join(__dirname, '..', '/public/index.html'));
  } else {
    res.redirect('/login');
  }
};

exports.login = (req, res) => {
  if (req.session.loggedin) {
    res.redirect('/');
  } else {
    res.sendFile(path.join(__dirname, '..', '/public/login.html'));
  }
};

exports.register = (req, res) => {
  if (req.session.loggedin) {
    res.redirect('/');
  } else {
    res.sendFile(path.join(__dirname, '..', '/public/register.html'));
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};
