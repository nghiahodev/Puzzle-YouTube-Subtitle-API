import 'dotenv/config'

const env = {
  HOST: process.env.HOST,
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  ADMIN: process.env.ADMIN,
}

export default env
