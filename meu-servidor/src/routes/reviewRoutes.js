const express = require('express');
const router = express.Router();
const { conectarAoBanco } = require('../config/dbConfig');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

// Middleware para verificar autenticação
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }
    try {
        const decoded = jwt.verify(token, 'sua_chave_secreta');
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
};

// Rota para criar uma review
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { gameId, nota, comentario } = req.body;
        const db = await conectarAoBanco();
        
        // Verificar se o usuário já fez uma review para este jogo
        const reviewExistente = await db.collection('reviews').findOne({
            gameId: gameId,
            usuarioId: new ObjectId(req.userId)
        });

        if (reviewExistente) {
            return res.status(400).json({ message: 'Você já fez uma review para este jogo' });
        }

        const review = {
            gameId: gameId,
            usuarioId: new ObjectId(req.userId),
            nota: Number(nota),
            comentario: comentario,
            dataCriacao: new Date()
        };

        await db.collection('reviews').insertOne(review);
        res.status(201).json({ message: 'Review criada com sucesso' });
    } catch (error) {
        console.error('Erro ao criar review:', error);
        res.status(500).json({ message: 'Erro ao criar review' });
    }
});

// Rota para buscar reviews de um jogo
router.get('/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        
        if (!gameId) {
            return res.status(400).json({ message: 'ID do jogo não fornecido' });
        }

        const db = await conectarAoBanco();
        
        const reviews = await db.collection('reviews')
            .aggregate([
                { $match: { gameId: gameId } },
                {
                    $lookup: {
                        from: 'usuarios',
                        localField: 'usuarioId',
                        foreignField: '_id',
                        as: 'usuario'
                    }
                },
                { $unwind: '$usuario' },
                {
                    $project: {
                        _id: 1,
                        nota: 1,
                        comentario: 1,
                        dataCriacao: 1,
                        usuarioId: 1,
                        'usuario.nome': 1
                    }
                },
                { $sort: { dataCriacao: -1 } }
            ]).toArray();

        res.json(reviews);
    } catch (error) {
        console.error('Erro ao buscar reviews:', error);
        res.status(500).json({ message: 'Erro ao buscar reviews' });
    }
});

// Rota para excluir uma review
router.delete('/:reviewId', authMiddleware, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const db = await conectarAoBanco();

        const review = await db.collection('reviews').findOne({
            _id: new ObjectId(reviewId)
        });

        if (!review) {
            return res.status(404).json({ message: 'Review não encontrada' });
        }

        // Verifica se o usuário é o dono da review
        if (review.usuarioId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        await db.collection('reviews').deleteOne({
            _id: new ObjectId(reviewId)
        });

        res.json({ message: 'Review excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir review:', error);
        res.status(500).json({ message: 'Erro ao excluir review' });
    }
});

module.exports = router; 