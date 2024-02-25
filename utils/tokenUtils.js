import jwt from 'jsonwebtoken';

export const generateAuthToken = (user) => {
    const key = process.env.JWT_SECRET;

    return jwt.sign({ userID: user._id, email: user.email }, key)
};

export const generateResetToken = (email) => {
    const key = process.env.JWT_RESET;
    const token = jwt.sign({ email }, key);

    return token;
};

export const verifyResetToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_RESET);

        return decoded.email;
    } catch (error) {
        console.error('Error verifying reset token:', error);
        return null;
    }
};