require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

const port = process.env.PORT || 6400;
const openaiApiKey = process.env.OPENAI_API_KEY; // Retrieve the API key from environment variables

app.use(cors());
app.use(express.json()); // Using Express built-in JSON parser

let conversationHistory = '';

app.post('/query', async (req, res) => {
    const userQuery = req.body.query;
    conversationHistory += `User: ${userQuery}\n`;

    if (userQuery.toLowerCase().includes('bye doctor')) {
        conversationHistory = '';
        return res.json({ response: 'Goodbye! Take care.' });
    }

    const prompt = `
    System: You are a medical professional, assistant to a doctor, you only have knowledge about the medical field. You talk to the user until he says goodbye doctor. To any query that is not related to the medical, injuries, sports, nutrition field, I want you to reply with "As a medical assistant, I don't have the answer to this query. Additionally, my main area of expertise is in the medical field.". Just tell the possible medical conditions and suggest remedies or medicines, suggest any scans or tests that the user may take if you feel like so.
    ${conversationHistory}
    Assistant:`;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/engines/text-davinci-003/completions',
            {
                prompt,
                temperature: 0.8,
                max_tokens: 400,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiApiKey}`, // Use the retrieved API key
                },
            },
        );

        const assistantResponse = response.data.choices[0].text.trim();
        conversationHistory += `Assistant: ${assistantResponse}\n`;

        res.json({ response: assistantResponse });
    } catch (error) {
      console.error(error); // Log the entire error object
      console.log(error.message + ` utkarsh`); // Log the error message
      res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
