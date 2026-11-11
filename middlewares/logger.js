const logger = (req, res, next) => {
    console.log(`[LOGGER] ${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
    if (req.method === 'POST') {
        console.log('Data Masuk:', req.body);
    }
    next();
};

module.exports = logger;