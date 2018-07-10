import PassportLocal from 'passport-local';
import bcrypt from 'bcryptjs';

import User from '../models/User';

const LocalStrategy = PassportLocal.Strategy;

export default (passport) => {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        const user = await User.findOne({ email });

        if (!user) {
            return done(null, false, { message: 'Email or password incorrect' });
        }

        if (await bcrypt.compare(password, user.password)) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Email or password incorrect' });
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
};