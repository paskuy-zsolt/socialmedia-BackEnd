export const formatValidationErrors = (errorsObject) => {
    const errors = Object.values(errorsObject).map(error => error.message);
    return errors;
};