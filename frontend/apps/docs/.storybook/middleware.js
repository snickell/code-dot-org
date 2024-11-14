module.exports = function expressMiddleware(app) {
    app.use(function (req, res, next) {
      res.setHeader('X-Content-Type-Options', '')
  
      next();
    });
  };