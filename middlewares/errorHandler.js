const errorHandler = (err, req, res, next) => {
    res.status(err.status || 500);
    res.render("error", {
        title: "Error",
        user: req.user,
        error: err.message,
    });
};

module.exports = errorHandler;
