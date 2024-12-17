import csrf from 'csurf';

// Initialize CSRF middleware with cookie option
const csrfMiddleware = csrf({
  cookie: {
      httpOnly: true,
      secure: true, // Use secure cookies
      sameSite: 'strict', // Prevent CSRF token leakage
  },
});

const csrfEnhancedMiddleware = (req, res, next) => {
  csrfMiddleware(req, res, (err) => {
    if (err) {
      return next(err);
    }

    // Set the CSRF token as a cookie for the frontend
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
  });
};

export default csrfEnhancedMiddleware;
