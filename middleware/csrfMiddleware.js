import csrf from 'csurf';

// Initialize CSRF middleware with cookie option
const csrfMiddleware = csrf({ cookie: true });

// Wrapper middleware to apply CSRF and expose the token as a cookie
const csrfEnhancedMiddleware = (req, res, next) => {
  csrfMiddleware(req, res, (err) => {
    if (err) {
      // Handle CSRF errors if necessary (e.g., logging or custom error response)
      return next(err);
    }
    // Set the CSRF token as a cookie for the frontend
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
  });
};

export default csrfEnhancedMiddleware;
