const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
// const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const session  = require('express-session')
const MongoStore = require('connect-mongo').default
const passport = require('passport')
const { Cookie } = require('express-session')

require('dotenv').config()
require('./passport')(passport)

const uri = process.env.MONGO_URI

mongoose.connect( uri, { useNewUrlParser: true, useFindAndModify: true, useUnifiedTopology: true, useCreateIndex: true })
.then(() => {console.log('database server is running')}) 
.catch(error => console.log(error))

const app = express()

app.use(express())
app.use(morgan('dev'))
// app.use(cookieParser())
app.use(cors({
  origin: 'https://lucid-meninsky-d3d666.netlify.app',
  credentials: true
}))
app.set('trust proxy', 1)
const mongoStore = MongoStore.create({
  mongoUrl: uri,
  collectionName: 'sessions'
})

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: mongoStore,
  cookie: {
    sameSite: "none",
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // One Week
  }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use('/', require('./routes/users'))

if(process.env.NODE_ENV === 'production'){
  app.use(express.static('client/build'))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}



const PORT =  process.env.PORT || 5000 

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
})