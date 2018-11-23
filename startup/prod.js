const helmet = require('helmet');
const compression = require('compression');

module.exports = funcction(app) {
    app.use(helmet());
    app.use(compression());
}