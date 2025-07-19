const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { HfInference } = require('@huggingface/inference')

dotenv.config()

const app = express()
const port = process.ENV.port || 5000

app.use(cors())
app.use(express.json())

const hf = new HfInference(process.env.HF_ACCESS_TOKEN)

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients and suggests a recipe.
The recipe can include extra ingredients but should use most of what the user has.
Respond in markdown format.
`

app.post('/api/recipe', async (req, res) => {
    const ingredientsArr = req.body.ingredients
    const ingredientsString = ingredientsArr.join(', ')

    try {
        const response = await hf.chatCompletion({
            model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
            messages: [
                {role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!`},
            ],
            max_tokens: 1024,
        })
        res.json({ recipe: response.choices[0].message.content})
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ error: 'Failed to fetch recipe' })
    }
})

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`)
})

