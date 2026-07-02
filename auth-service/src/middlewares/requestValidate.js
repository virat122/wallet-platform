const requestValidate = (schema, property = 'body') => {
    return (req, res, next) => {

        const { error, value } = schema.validate(
            req[property]
        );

        if (error) {
            return res.status(400).json({
                errors: error.details.map(
                    err => err.message
                )
            });
        }

        req[property] = value;

        next();
    };
};

module.exports = requestValidate;