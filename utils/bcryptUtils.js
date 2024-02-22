import bcrypt from "bcrypt";

export const hashPassword = (password) => {
    try {
        const salt = bcrypt.genSaltSync(10);

        return bcrypt.hashSync(password, salt);
    } catch (error) {
        console.error(error);
        throw new Error("Error generating salt for password hashing");
    }
};

export const comparePassword = async (password, hashedPassword) => {
    try {
        return bcrypt.compareSync(password, hashedPassword);
    } catch (error) {
        console.error(error);
        throw new Error("Password comparison failed");
    }
};