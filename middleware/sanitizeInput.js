import xss from 'xss';

export const sanitizeInput = (req, res, next) => {
  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  
  next();
};

const sanitizeObject = (obj) => {
  if (obj && typeof obj === 'object') {
    const sanitizedObj = {};

    Object.keys(obj).forEach((key) => {
      sanitizedObj[key] = sanitizeObject(obj[key]);
    });

    return sanitizedObj;

  } else if (typeof obj === 'string') {
    return xss(obj);
  } else {
    return obj;
  }
};