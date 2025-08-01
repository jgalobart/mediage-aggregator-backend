const express = require('express')
const app = express()
const port = 3008
const cors = require('cors')
require('dotenv').config()

app.use(cors())

app.get('/clients/:id/social-config', (req, res) => {
  res.send({
  "instagram": {
    "accessToken": process.env.INSTAGRAM_ACCESS_TOKEN,
    "userId": process.env.INSTAGRAM_USER_ID
  },
  "twitter": {
    "apiKey": process.env.TWITTER_API_KEY,
    "apiSecret": process.env.TWITTER_API_SECRET,
    "accessToken": process.env.TWITTER_ACCESS_TOKEN,
    "accessTokenSecret": process.env.TWITTER_ACCESS_TOKEN_SECRET,
    "bearerToken": process.env.TWITTER_BEARER_TOKEN,
    "username": process.env.TWITTER_USERNAME
  },
  "linkedin": {
    "accessToken": process.env.LINKEDIN_ACCESS_TOKEN,
    "organizationId": process.env.LINKEDIN_ORGANIZATION_ID
  }
}
)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})