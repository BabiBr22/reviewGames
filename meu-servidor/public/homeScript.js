// Espera o DOM carregar completamente
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a aplicação
    initializeApp();
});

// Função principal de inicialização
async function initializeApp() {
    try {
        // Carregar jogos iniciais
        await loadTopGames();
        
        // Configurar busca
        setupSearch();
        
        // Configurar modal
        setupModal();
    } catch (error) {
        console.error('Erro ao inicializar a aplicação:', error);
    }
}

function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    let searchTimeout;

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const searchTerm = e.target.value.trim();
            
            if (searchTerm) {
                searchTimeout = setTimeout(() => searchGames(searchTerm), 300);
            } else {
                const mainContent = document.querySelector('.main-column .content-area');
                if (mainContent) mainContent.innerHTML = '';
            }
        });
    }
}

function setupModal() {
    const modal = document.getElementById('gameModal');
    const closeButton = modal?.querySelector('.close-button');
    
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Função para carregar jogos populares
async function loadTopGames() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;

    try {
        const response = await fetch('/api/games/top');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const games = await response.json();
        carousel.innerHTML = renderGameCards(games.slice(0, 6));
        addCardClickEvents();
    } catch (error) {
        console.error('Erro ao carregar jogos:', error);
        carousel.innerHTML = '<p>Erro ao carregar jogos</p>';
    }
}

// Função para buscar jogos
async function searchGames(searchTerm) {
    const mainContent = document.querySelector('.main-column .content-area');
    if (!mainContent) return;

    try {
        const response = await fetch(`/api/games/search?q=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const games = await response.json();
        mainContent.innerHTML = games.length > 0 
            ? `<div class="search-results">
                <h2>Resultados para: "${searchTerm}"</h2>
                <div class="games-grid">${renderGameCards(games)}</div>
               </div>`
            : `<p>Nenhum resultado encontrado para "${searchTerm}"</p>`;
        
        addCardClickEvents();
    } catch (error) {
        console.error('Erro na busca:', error);
        mainContent.innerHTML = '<p>Erro ao buscar jogos</p>';
    }
}

// Função para renderizar cards dos jogos
function renderGameCards(games) {
    if (!games?.length) return '';
    
    return games.map(game => `
        <div class="game-card" style="background-image: url('${game.thumbnail}')" 
             data-game='${JSON.stringify(game)}'>
            <div class="game-info">
                <h3>${game.title || 'Sem título'}</h3>
                <p>${game.short_description || 'Sem descrição'}</p>
                <span class="game-genre">${game.genre || 'Sem gênero'}</span>
            </div>
        </div>
    `).join('');
}

// Função para adicionar eventos de clique aos cards
function addCardClickEvents() {
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => {
            const gameData = JSON.parse(card.dataset.game);
            showGameDetails(gameData);
        });
    });
}

// Função para verificar se usuário está logado
function isUserLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Função para mostrar detalhes do jogo
async function showGameDetails(game) {
    const modal = document.getElementById('gameModal');
    if (!modal) return;

    const modalTitle = modal.querySelector('.modal-header h2');
    const gameImage = modal.querySelector('.game-image');
    const gameDescription = modal.querySelector('.game-description');
    const gameMetadata = modal.querySelector('.game-metadata');
    const reviewContent = modal.querySelector('#reviewContent');

    if (modalTitle) modalTitle.textContent = game.title;
    if (gameImage) gameImage.src = game.thumbnail;
    if (gameDescription) gameDescription.textContent = game.short_description;
    if (gameMetadata) {
        gameMetadata.innerHTML = `
            <span class="metadata-tag">${game.genre}</span>
            <span class="metadata-tag">${game.platform}</span>
            ${game.publisher ? `<span class="metadata-tag">Publisher: ${game.publisher}</span>` : ''}
        `;
    }

    if (reviewContent) {
        reviewContent.innerHTML = `
            ${isUserLoggedIn() 
                ? `<button class="review-button">Escrever Review</button>
                   ${createReviewForm()}`
                : `<div class="login-prompt">
                     <p>Faça <a href="/login.html" class="login-link">login</a> para deixar sua review!</p>
                   </div>`
            }
            <div class="reviews-list"></div>
        `;

        if (isUserLoggedIn()) {
            setupReviewSystem(modal, game.id);
        }
    }

    modal.style.display = 'block';
    await loadReviews(game.id);
}

// Função para criar o modal
function createModal() {
    const modal = document.createElement('div');
    modal.id = 'gameModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2></h2>
                <button class="close-button">&times;</button>
            </div>
            <div class="game-details">
                <div class="game-image-container">
                    <img class="game-image" src="" alt="Game Image">
                </div>
                <div class="game-info-details">
                    <p class="game-description"></p>
                    <div class="game-metadata"></div>
                </div>
            </div>
            <div class="review-section">
                <h3>Reviews</h3>
                <div id="reviewContent"></div>
                <div class="reviews-list"></div>
            </div>
        </div>
    `;

    // Adicionar evento para fechar o modal
    const closeButton = modal.querySelector('.close-button');
    closeButton.onclick = () => modal.style.display = 'none';

    // Fechar modal ao clicar fora
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    document.body.appendChild(modal);
    return modal;
}

// Função para criar formulário de review
function createReviewForm() {
    return `
        <div class="review-form">
            <div class="star-rating">
                ${Array(5).fill().map((_, i) => 
                    `<span class="star" data-rating="${i + 1}">★</span>`
                ).join('')}
            </div>
            <textarea class="review-textarea" placeholder="Escreva sua review..."></textarea>
            <button class="review-submit">Enviar Review</button>
        </div>
    `;
}

// Função para formatar data
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Função para carregar reviews
async function loadReviews(gameId) {
    if (!gameId) {
        console.error('ID do jogo não fornecido para loadReviews');
        return;
    }

    try {
        console.log('Carregando reviews para o jogo:', gameId);
        const response = await fetch(`/api/reviews/${gameId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reviews = await response.json();
        console.log('Reviews carregadas:', reviews);
        
        const reviewsList = document.querySelector('.reviews-list');
        if (!reviewsList) {
            console.error('Lista de reviews não encontrada no DOM');
            return;
        }

        if (!Array.isArray(reviews) || reviews.length === 0) {
            reviewsList.innerHTML = '<p>Nenhuma review ainda. Seja o primeiro a avaliar!</p>';
            return;
        }

        const usuarioAtual = localStorage.getItem('usuario') ? 
            JSON.parse(localStorage.getItem('usuario')) : null;

        reviewsList.innerHTML = reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-info">
                        <span class="review-stars">${'★'.repeat(review.nota)}${'☆'.repeat(5-review.nota)}</span>
                        <span class="review-author">${review.usuario?.nome || 'Usuário anônimo'}</span>
                    </div>
                    ${usuarioAtual && usuarioAtual._id === review.usuarioId ? 
                        `<button class="delete-review-btn" onclick="deleteReview('${review._id}', '${gameId}')">
                            <span class="delete-icon">🗑️</span>
                        </button>` 
                        : ''
                    }
                </div>
                <p class="review-text">${review.comentario}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar reviews:', error);
        const reviewsList = document.querySelector('.reviews-list');
        if (reviewsList) {
            reviewsList.innerHTML = '<p>Erro ao carregar reviews</p>';
        }
    }
}

// Função para configurar o sistema de reviews
function setupReviewSystem(modal, gameId) {
    const reviewButton = modal.querySelector('.review-button');
    const reviewForm = modal.querySelector('.review-form');
    const stars = modal.querySelectorAll('.star');
    const submitButton = modal.querySelector('.review-submit');
    let currentRating = 0;

    if (reviewButton) {
        reviewButton.addEventListener('click', () => {
            if (reviewForm) {
                reviewForm.style.display = reviewForm.style.display === 'none' ? 'block' : 'none';
            }
        });
    }

    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.dataset.rating);
            stars.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.rating) <= rating);
            });
        });

        star.addEventListener('click', () => {
            currentRating = parseInt(star.dataset.rating);
        });
    });

    if (submitButton) {
        submitButton.addEventListener('click', async () => {
            const comentario = modal.querySelector('.review-textarea').value;
            if (currentRating === 0 || !comentario.trim()) {
                alert('Por favor, dê uma nota e escreva um comentário!');
                return;
            }

            try {
                const response = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        gameId,
                        nota: currentRating,
                        comentario
                    })
                });

                if (response.ok) {
                    alert('Review enviada com sucesso!');
                    reviewForm.style.display = 'none';
                    await loadReviews(gameId);
                } else {
                    alert('Erro ao enviar review');
                }
            } catch (error) {
                console.error('Erro ao enviar review:', error);
                alert('Erro ao enviar review');
            }
        });
    }
}

// Função global para deletar review
window.deleteReview = async function(reviewId, gameId) {
    if (!confirm('Tem certeza que deseja excluir sua review?')) {
        return;
    }

    try {
        const response = await fetch(`/api/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            await loadReviews(gameId);
            const reviewButton = document.querySelector('.review-button');
            if (reviewButton) {
                reviewButton.disabled = false;
                reviewButton.textContent = 'Escrever Review';
            }
        } else {
            alert('Erro ao excluir review');
        }
    } catch (error) {
        console.error('Erro ao excluir review:', error);
        alert('Erro ao excluir review');
    }
}; 