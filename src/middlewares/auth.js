module.exports = (req, res, next) => {
  if (req.session.logged !== true) {
    req.flash("error", "Você precisa estar logado primeiro.");
    return res.redirect("/login")
  }
  return next();
}