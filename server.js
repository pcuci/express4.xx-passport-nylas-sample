const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const session = require('express-session')
const request = require('request')

const passport = require('passport')
const NylasStrategy = require('passport-nylas')

const NYLAS_THRD_URL = 'https://api.nylas.com/threads'

require('dotenv').config({
  silent: true
})

const app = express()

const port = process.env.PORT || 4000

app.use(cookieParser())
app.use(session({
  secret: 'best kept secret',
  resave: true,
  saveUninitialized: true
}))

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json())
app.use(logger('dev'))

app.set('view engine', 'pug')
app.set('views', __dirname + '/views')
app.use(express.static(__dirname + '/public'))

app.use(passport.initialize())
app.use(passport.session())

const nylasStrategy = new NylasStrategy({
  clientID: process.env.NYLAS_ID,
  clientSecret: process.env.NYLAS_SECRET,
  callbackURL: process.env.NYLAS_CB
}, (email, accessToken, profile, done) => {
    return done(null, {
      email: email,
      accessToken: accessToken
    })
})

// setup the Nylas API
global.Nylas = require('nylas').config({
  appId: process.env.NYLAS_ID,
  appSecret: process.env.NYLAS_SECRET
})

passport.use(nylasStrategy)

// Passport serializers
// --> configuring Authentication persistance.
passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((obj, done) => {
  done(null, obj)
})

app.get('/', (req, res) => {
  console.log('REQ TO /')
  if (req.user) {
    console.log("USER: " + req.user.email)
    console.log(req.session)
    console.log(req.user.accessToken)

    const nylas = Nylas.with(req.user.accessToken)
    nylas.threads.first().then((thread) => {
      res.render('index', {
        user: req.user,
        thread
      })
    }).catch((err) => {
      console.err(err)
    })
  } else {
    console.log("User: " + req.user)
    res.render('index', { user: req.user })
  }
})

app.get('/auth/nylas', passport.authenticate('nylas', {scope: 'email'}))

app.get('/auth/nylas/cb/', (req, res, next) => {
  passport.authenticate('nylas',
    (err, user, info) => {
      if (err) {
        res.redirect('/login')
      }
      req.login(user, (err) => {
        if (err) {
          console.log('Internal Error, Do try again later')
        }
        res.redirect('/')
      })
    }
  )(req, res, next)
})

app.get('/logout', (req, res) => {
  res.redirect('/')
})

app.listen(port)
console.log('Express App running at ' + port)
