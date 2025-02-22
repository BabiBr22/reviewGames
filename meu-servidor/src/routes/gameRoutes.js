const express = require('express');
const router = express.Router();
const axios = require('axios');

// Rota para obter jogos populares
router.get('/top', async (req, res) => {
    try {
        const response = await axios.get('https://www.freetogame.com/api/games');
        const games = response.data.slice(0, 10); // Pegando os 10 primeiros jogos
        res.json(games);
    } catch (error) {
        console.error('Erro ao buscar jogos:', error);
        res.status(500).json({ message: 'Erro ao buscar jogos' });
    }
});

// Rota para buscar jogos
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        const response = await axios.get('https://www.freetogame.com/api/games');
        const games = response.data.filter(game => 
            game.title.toLowerCase().includes(q.toLowerCase())
        );
        res.json(games);
    } catch (error) {
        console.error('Erro ao pesquisar jogos:', error);
        res.status(500).json({ message: 'Erro ao pesquisar jogos' });
    }
});

module.exports = router; 