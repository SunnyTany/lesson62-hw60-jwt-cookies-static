import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'

const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.set('view engine', 'pug')
app.set('views', './views')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.render('index')
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/theme', (req, res) => {
  const title = 'Users list'
  res.render('theme')
})

app.post('/theme', (req, res) => {
  const theme = req.body
  res.cookie('theme', theme, { httpOnly: true })
  res.send('Тема успішно змінена')
})


app.post('/login', (req, res) => {
  console.log(req.body)
  const { username, password } = req.body

  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ username }, 'your-secret-key', { algorithm: 'HS512', expiresIn: '30s' })
    res.cookie('token', token, { httpOnly: true, maxAge: 60000 })
    res.json({ message: 'Ви успішно увійшли' })
  } else {
    res.status(401).send('Невірний логін або пароль')
  }
})

const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token

  if (token) {
    jwt.verify(token, 'your-secret-key', (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Доступ заборонено або токен недійсний' })
      }
      req.user = user
      next()
    })
  } else {
    res.status(401).json({ message: 'Необхідна авторизація' })
  }
}

app.get('/protected', authenticateJWT, (req, res) => {
  res.json({ message: 'Все ОК! Ви зайшли на захищений маршрут' })
})

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})