import express from 'express'
import cors from 'cors'
import http from 'http'
import connectDB from './config/connectDB'
import router from './appRoutes'
import handleError from './middlewares/handleError'
import env from './config/env'

const startServer = () => {
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(router)
  app.use(handleError)

  const server = http.createServer(app)

  server.listen(env.PORT, env.HOST, () => {
    console.log(`Server is running at port:${env.PORT}`)
  })
}

connectDB()
  .then(() => startServer())
  .catch((err) => {
    console.log({ err })
    process.exit(1)
  })
