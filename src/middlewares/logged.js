module.exports = (req, res, next) => {
  if (req.session.logged === true) {
    req.flash("error", "Você ja esta logado.");
    return res.redirect("/")
  }
  return next();
}