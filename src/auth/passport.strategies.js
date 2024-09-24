import passport from "passport"
import local from "passport-local"

import gitHubStrategy from "passport-github2"
import GoogleStrategy from "passport-google-oauth20"
import config from "../config.js"
import { usersManagers } from "../controller/users.manager.js"
import { isValidPassword } from "../services/utils.js"

const localStrategy = local.Strategy
const um = new usersManagers()

const initAuthStrategies = () => {
    passport.use("login", new localStrategy(
        { passReqToCallback: true, usernameField: "email" },
        async (req, username, password, done) => {
            try {
                const user = await um.findUser({ email: username })
                if (user && isValidPassword(user, password)) {
                    const { password, ...filteredUser } = user
                    return done(null, filteredUser)
                } else {
                    return done(null, false, {message: "Usuario o contraseña inválidos."})
                }
            } catch (err) {
                return done(err, false)
            }
        }
    ))
    passport.use("ghlogin", new gitHubStrategy({
        clientID: config.GITHUB_CLIENT_ID,
        clientSecret: config.GITHUB_CLIENT_SECRET,
        callbackURL: config.GITHUB_CALL_BACK
    },
        async function (accessToken, refreshToken, profile, done) {
            try {
                const gitEmail = profile._json?.email || null
                if (gitEmail) {
                    
                    const userMongo = await um.findUser({ email: gitEmail })
                    const { password, ...filteredUser } = userMongo
                    if (!filteredUser) {
                        const process = await um.addUser(profile._json.name.split(' ')[0], profile._json.name.split(' ')[1], gitEmail, 0, "none")
                        return done(null, process)
                    } else {
                        return done(null, filteredUser)
                    }
                } else {
                    return done(new Error(`Faltan datos del sistema.`), null)
                }
            } catch (err) {
                return done(err, false);
            }
        }
    ));
    passport.use("ggllogin", new GoogleStrategy({
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.GOOGLE_CALL_BACK
    },
        async function (accessToken, refreshToken, profile, done) {
            try {
                const googleEmail = profile._json?.email || null

                if (googleEmail) {
                    const userMongo = await um.findUser({ email: googleEmail })
                    const { password, ...filteredUser } = userMongo
                    if (!filteredUser) {
                        const process = await um.addUser(profile._json.name.split(' ')[0], profile._json.name.split(' ')[1], googleEmail, 0, "none")
                        return done(null, process)
                    } else {
                        return done(null, filteredUser)
                    }
                } else {
                    return done(new Error(`Faltan datos del sistema.`), null)
                }
            } catch (err) {
                return done(err, false);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user)
    })
    passport.deserializeUser((user, done) => {
        done(null, user)
    })
}

export default initAuthStrategies