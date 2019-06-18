var ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  } else {
    if (req.query.event_id) {
      res.redirect('/user/login?event_id=' + req.query.event_id)
    } else {
      // req.flash('error_msg','You are not logged in');
      res.redirect('/user/login')
    }
  }
}

module.exports = ensureAuthenticated
