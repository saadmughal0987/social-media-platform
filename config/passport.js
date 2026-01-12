const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const initializePassport = function(passport) {
    
    passport.use(new LocalStrategy({ usernameField: 'email' }, 
        async (email, password, done) => {
            try {
                console.log('Received Credentials:', email, password);

                const user = await User.findOne({ email: email });

                if (!user) {
                    return done(null, false, { message: 'Incorrect email.' });
                }

                console.log("User exists");

                const isPasswordMatch = await bcrypt.compare(password, user.password);

                if (isPasswordMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Incorrect Password.' });
                }

            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};

module.exports = initializePassport;