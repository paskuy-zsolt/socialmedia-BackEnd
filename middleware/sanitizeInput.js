import xss from 'xss';

export const sanitizeInput = (req, res, next) => {
  try {
    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
  } catch (error) {
    console.error('Error sanitizing input:', error);
    return res.status(400).json({ message: 'Invalid request data.' });
  }

  next();
};

const sanitizeObject = (obj) => {
  if (obj && typeof obj === 'object') {
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    }

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