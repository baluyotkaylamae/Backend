function errorHandler(err, req, res, next) {
    console.error('Error occurred:', err); // Log the error for debugging

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: "The user is not authorized" });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message }); // Changed to 400 for validation errors
    }

    // Default to 500 server error
    return res.status(500).json({ message: "Internal server error", error: err.message || err });
}

module.exports = errorHandler;
