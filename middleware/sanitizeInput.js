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

const urlRegex = /https?:\/\/(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\S*)?/g;

const sanitizeObject = (obj) => {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    }

    const sanitizedObj = {};
    
    Object.keys(obj).forEach((key) => {
      sanitizedObj[key] = sanitizeObject(obj[key]);
    });

    return sanitizedObj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  return obj;
};

const sanitizeString = (str) => {
  let sanitized = "";
  let lastIndex = 0;

  for (const match of str.matchAll(urlRegex)) {
    sanitized += xss(str.substring(lastIndex, match.index));
    sanitized += match[0];
    lastIndex = match.index + match[0].length;
  }

  sanitized += xss(str.substring(lastIndex));
  return sanitized;
};