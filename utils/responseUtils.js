export const responseSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
      success: true,
      ...data
  });
};

export const responseError = (res, message, statusCode = 400) => {
  res.status(statusCode).json({
      success: false,
      error: {
          message: message
      }
  });
};

export const responseServerError = (res, message = 'Internal Server Error') => {
  res.status(500).json({
      success: false,
      error: {
          message: message
      }
  });
};