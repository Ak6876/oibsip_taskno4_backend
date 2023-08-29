const connectToMongo = require('./db')
const express = require('express')
var cors = require('cors')
const app = express()
const port = 5000

connectToMongo()

app.use(cors())
app.use(express.json())

//Available routes
app.use('/api/auth', require('./routes/auth'))

app.listen(port, () => {
  console.log(`Login Page listening on port http://localhost:${port}`)
})