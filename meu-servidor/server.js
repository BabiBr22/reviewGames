const express = require('express'); // Importa o módulo Express
const path = require('path'); // Importa o módulo path para manipulação de caminhos

const app = express(); // Cria uma instância do Express
const port = process.env.PORT || 3000; // Define a porta (usa a variável de ambiente PORT ou 3000 como padrão)

// Middleware para servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware para tratar erros 404 (página não encontrada)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Inicia o servidor e faz com que ele escute na porta definida
const server = app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`); // Mensagem no console
});

// Encerra o servidor corretamente ao pressionar Ctrl + C
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Servidor encerrado.');
    process.exit(0);
  });
});