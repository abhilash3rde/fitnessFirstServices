function handleError(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.statusCode||err.status || 500);
  res.json({error:err});
}

// catch errors, no need to write try catch everywhere
const autoCatch = function (fn) {
  return function () {
    try {
      return fn.apply(this, arguments);
    } catch (ex) {
      res.status(500).json({
        err: err.message
      });
    }
  };
};

module.exports = {
  handleError,
  autoCatch
}