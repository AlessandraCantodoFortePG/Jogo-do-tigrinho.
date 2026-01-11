require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/get-creative-message', async (req, res) => {
    const { result, prize, symbol } = req.body;

    let userPrompt = '';
    if (result === 'win') {
        userPrompt = `Gere uma frase curta, divertida e empolgante para um jogador de caça-níqueis que acabou de ganhar ${prize} moedas com uma combinação de três '${symbol}'.`;
    } else {
        userPrompt = `Gere uma frase curta, divertida e encorajadora para um jogador de caça-níqueis que não ganhou nada na última rodada.`;
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Você é um assistente de um jogo de caça-níqueis chamado 'Jogo do Tigrinho'. Suas respostas devem ser criativas, curtas (no máximo 15 palavras) e no estilo do jogo." },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.8,
        });

        const creativeMessage = completion.choices[0].message.content;
        res.json({ message: creativeMessage });

    } catch (error) {
        console.error("Erro ao chamar a API da OpenAI:", error);
        res.status(500).json({ message: result === 'win' ? `Parabéns! Você ganhou ${prize}!` : 'Tente de novo!' });
    }
});

app.listen(port, () => {
    console.log(`Servidor do Jogo do Tigrinho rodando em http://localhost:${port}`);
});
