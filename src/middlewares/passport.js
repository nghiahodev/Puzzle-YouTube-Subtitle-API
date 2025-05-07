import passport from 'passport'
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'

import env from '~/config/env'
import userModel from '~/models/user.model'

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.ACCESS_TOKEN_SECRET,
}

passport.use(
  'passport-jwt',
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await userModel.findById(jwt_payload.id)
      if (!user) return done(null, false)
      return done(null, user)
    } catch (err) {
      return done(err, false)
    }
  }),
)

const passportJWT = passport.authenticate('passport-jwt', { session: false })
export default passportJWT
