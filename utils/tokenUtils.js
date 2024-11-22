import jwt from 'jsonwebtoken';

// Generate authentication token
export const generateAuthToken = (user) => {
    const key = process.env.JWT_SECRET;

    return jwt.sign({ userID: user._id, email: user.email }, key)
};

// Generate a token witch wil be unique for each user (via email) to reset his password
export const generateResetToken = (email) => {
    const key = process.env.JWT_RESET;
    const token = jwt.sign({ email }, key);

    return token;
};

// Used to verify your token to reset your password
export const verifyResetToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_RESET);

        return decoded.email;
    } catch (error) {
        console.error('Error verifying reset token:', error);
        return null;
    }
};