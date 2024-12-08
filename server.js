const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Enable CORS for React app
app.use(cors({
  origin: 'http://localhost:3000'
}));

app.get('/api/charities', async (req, res) => {
  try {
    const response = await axios.get('https://api.charityapi.org/api/charities/recent', {
      headers: {
        'Authorization': 'test-RFHMUf02R2XhW00jjEEgiWJGH6BeahBcaAbKVpW3tZQYYI6U4EYzggQ7Gweb6fbe6z0CvRaqaRGjhTGZ'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 