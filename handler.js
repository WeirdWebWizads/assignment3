const homeRoutes = require('./routes/homeRoutes');
const authRoutes = require('./routes/authRoutes');
const regRoutes = require('./routes/regRoutes');

module.exports = function (app) {
    app.use('/', homeRoutes);
    app.use('/auth', authRoutes);
    app.use('/reg', regRoutes);
};
