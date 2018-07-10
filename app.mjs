import bodyParser from 'body-parser';
import dotenv from "dotenv";
import express from 'express';
import flash from 'connect-flash';
import handlebars from 'express-handlebars';
import session from 'express-session';
import methodOverride from 'method-override';
import mongoose from 'mongoose';
import passport from 'passport';
import path from 'path';

// Set the environment.
dotenv.config();

import passportConfig from './config/passport';
import ideaRouter from './routes/ideas';
import userRouter from './routes/users';

const app = express();
const { PORT, MONGO_URI, SECRET } = process.env;

/// Mongoose
// Connect to mongoose.
mongoose.Promise = global.Promise;

// Passport config
passportConfig(passport);

/// Middleware
// Handlebars
app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Public assets
app.use(express.static(path.join(path.resolve(), 'public')));

// method-override
app.use(methodOverride('_method'));

// express-session
app.use(session({
    secret: SECRET,
    resave: true,
    saveUninitialized: true
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// connect-flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;

    next();
});

// Routes
app.use('/ideas', ideaRouter);
app.use('/users', userRouter);

/// Routes
// Index
app.get('/', (req, res) => {
    res.render('index', { title: 'Welcome' });
});

// About
app.get('/about', (req, res) => {
    res.render('about');
});

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected!');

        // Start the web server.
        app.listen(PORT, () => console.log(`Listening on port ${PORT}.`));
    })
    .catch(err => console.error(err));

export default app;