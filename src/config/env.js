import 'dotenv/config'

const env = {
  HOST: process.env.HOST,
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  ADMIN: process.env.ADMIN,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
}

export default env
