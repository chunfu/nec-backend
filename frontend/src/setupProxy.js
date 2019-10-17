const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use('/api', proxy({
    target: 'http://localhost:8080',
    proxyTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
  }));
};
