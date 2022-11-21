const express = require('express');
const session = require('express-session');
const router = require('./router');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');
const csrf = require('csurf');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

let sessionOptions = session({
    secret: 'example secret',
    store: MongoStore.create({ client: require("./db") }),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true, sameSite: 'strict'}
});

app.use(sessionOptions);

// middleware to use flash messages;
app.use(flash());

// middleware to make session data available in template (must be before router)
app.use(function(req, res, next){

    // make user session data available from within view templates
    res.locals.user = req.session.user;
    // make sitewide flash error messages available from within all templates
    res.locals.errors = req.flash('errors');
     // make sitewide flash success messages available from within all templates
    res.locals.success = req.flash('success');

    next();
})

// static folder for frontend js
app.use(express.static("public"));
app.use('/images', express.static('images'));

// set ejs to handle templates
app.set('view engine', 'ejs');

// middleware for user avatar upload
app.use(fileUpload({
    limits: {fileSize: 2 * 1024 * 1024}
}));

// html req need matching token or req will be reqjected
app.use(csrf());

// make csrf tokens available in html templates
app.use(function(req, res, next){
    res.locals.csrfToken = req.csrfToken();
    next();
})


app.use('/', router);


const server = require("http").createServer(app);


module.exports = server;