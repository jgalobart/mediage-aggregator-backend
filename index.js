const express = require('express')
const app = express()
const port = 3008
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.json())

app.get('/clients/:id/social-config', (req, res) => {
  res.send({
  "logo": process.env.INSTAGRAM_LOGO,
  "instagram": {
    /*"accessToken": process.env.INSTAGRAM_ACCESS_TOKEN,
    "userId": process.env.INSTAGRAM_USER_ID
    "client_id": process.env.INSTAGRAM_CLIENT_ID,
    "client_secret": process.env.INSTAGRAM_CLIENT_SECRET,*/
    "user": process.env.INSTAGRAM_USER,
    "logo": process.env.INSTAGRAM_LOGO,
    
  },
  "twitter": {
    /*"apiKey": process.env.TWITTER_API_KEY,
    "apiSecret": process.env.TWITTER_API_SECRET,
    "accessToken": process.env.TWITTER_ACCESS_TOKEN,
    "accessTokenSecret": process.env.TWITTER_ACCESS_TOKEN_SECRET,
    "bearerToken": process.env.TWITTER_BEARER_TOKEN,
    "username": process.env.TWITTER_USERNAME,
    "client_id": process.env.TWITTER_CLIENT_ID,
    "client_secret": process.env.TWITTER_CLIENT_SECRET,
    "accessToken": process.env.TWITTER_ACCESS_TOKEN,
    "refreshToken": process.env.TWITTER_REFRESH_TOKEN,*/
    "user": process.env.TWITTER_USER,
  },
  "linkedin": {
    /*"accessToken": process.env.LINKEDIN_ACCESS_TOKEN,
    "organizationId": process.env.LINKEDIN_ORGANIZATION_ID*/
    "user": process.env.LINKEDIN_USER,
  }
}
)
})

app.post('/clients/1/twitter/token', async (req, res) => {
  console.log("Get Twitter Token", req.body)
  res.status(200).json({msg: "Twitter token saved"})
})

// Endpoint para manejar el intercambio de tokens OAuth para Twitter
app.post('/auth/twitter/token', async (req, res) => {
  try {
    const { code, redirectUri, codeVerifier } = req.body;
    
    if (!code || !redirectUri || !codeVerifier) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Obtener credenciales de Twitter
    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: 'Twitter credentials not configured' });
    }
    
    // Crear la autorización Basic para la API de Twitter
    const authorization = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    // Hacer la solicitud a la API de Twitter para intercambiar el código por un token
    const tokenParams = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    }).toString();
    
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authorization}`
      },
      body: tokenParams
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Twitter token exchange failed: ${errorText}`);
    }
    
    const response = {
      data: await tokenResponse.json()
    };
    
    // Obtener información del usuario si tenemos un token de acceso
    let userData = {};
    if (response.data.access_token) {
      try {
        const userResponse = await fetch('https://api.twitter.com/2/users/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${response.data.access_token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData && userData.data) {
            response.data.screen_name = userData.data.username;
          }
        }
      } catch (userError) {
        console.error('Error fetching Twitter user data:', userError);
        // Continuamos incluso si falla la obtención de datos del usuario
      }
    }
    
    // Devolver los datos del token al cliente
    res.json(response.data);
  } catch (error) {
    console.error('Error exchanging Twitter token:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to exchange Twitter token',
      details: error.response?.data || error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})