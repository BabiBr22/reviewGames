const express = require('express');
const path = require('path');
const routes = require('./routes/index');

const app = express();

// Configurações
app.use(express.static(path.join(__dirname, '../public'))); // Arquivos estáticos
app.use(express.json()); // Para receber JSON no body das requisições
app.use(express.urlencoded({ extended: true })); // Para receber formulários

// Rotas
app.use('/', routes);

module.exports = app;