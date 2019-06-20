const { resetServer } = require('./reset-server');

resetServer()
    .catch(err => console.error(err));
