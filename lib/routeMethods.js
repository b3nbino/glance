module.exports = {
  formatDate(post) {
    post.date_created = post.date_created
      .toString()
      .split(" ")
      .slice(1, 4)
      .join(" ");
  },
  catchError(handler) {
    return (req, res, next) => {
      Promise.resolve(handler(req, res, next)).catch(next);
    };
  },
  requiresAuth(req, res, next) {
    if (!res.locals.signedIn) {
      req.session.desiredUrl = req.originalUrl;

      res.redirect(302, "/sign-in");
    } else {
      next();
    }
    next();
  },
};
