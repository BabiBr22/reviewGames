const axios = require('axios');

const BASE_URL = 'https://www.freetogame.com/api';

const gamesApi = {
    async getTopGames() {
        try {
            const response = await axios.get(`${BASE_URL}/games`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar jogos:', error);
            throw error;
        }
    },

    async getGamesByCategory(category) {
        try {
            const response = await axios.get(`${BASE_URL}/games`, {
                params: { category: category }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar jogos por categoria:', error);
            throw error;
        }
    },

    async getGameDetails(gameId) {
        try {
            const response = await axios.get(`${BASE_URL}/game`, {
                params: { id: gameId }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar detalhes do jogo:', error);
            throw error;
        }
    },

    async searchGames(searchTerm) {
        try {
            // Busca todos os jogos e filtra no lado do servidor
            const response = await axios.get(`${BASE_URL}/games`);
            const allGames = response.data;
            
            // Filtra os jogos que correspondem ao termo de busca
            const filteredGames = allGames.filter(game => 
                game.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            return filteredGames;
        } catch (error) {
            console.error('Erro ao pesquisar jogos:', error);
            throw error;
        }
    }
};

module.exports = gamesApi; 