const { conectarAoBanco } = require('./dbConfig');

async function inicializarBancoDeDados() {
    try {
        const db = await conectarAoBanco();
        
        // Criar coleção de usuários se não existir
        if (!(await db.listCollections({name: 'usuarios'}).toArray()).length) {
            await db.createCollection('usuarios', {
                validator: {
                    $jsonSchema: {
                        bsonType: "object",
                        required: ["nome", "email", "senha"],
                        properties: {
                            nome: {
                                bsonType: "string",
                                description: "Nome completo do usuário"
                            },
                            email: {
                                bsonType: "string",
                                pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                                description: "Email válido necessário"
                            },
                            senha: {
                                bsonType: "string",
                                description: "Senha criptografada"
                            },
                            dataCriacao: {
                                bsonType: "date",
                                description: "Data de criação da conta"
                            },
                            ultimoLogin: {
                                bsonType: "date",
                                description: "Data do último login"
                            }
                        }
                    }
                }
            });
            
            console.log('Coleção de usuários criada com sucesso!');
            
            // Criar índice único para email
            await db.collection('usuarios').createIndex({ "email": 1 }, { unique: true });
            console.log('Índice único criado para email');
        }

        // Criar coleção de reviews se não existir
        const collections = await db.listCollections().toArray();
        if (!collections.find(c => c.name === 'reviews')) {
            await db.createCollection('reviews');
            console.log('Coleção reviews criada com sucesso');
        }

        // Criar índices necessários
        await db.collection('reviews').createIndex({ gameId: 1 });
        await db.collection('reviews').createIndex({ usuarioId: 1 });

        console.log('Banco de dados inicializado com sucesso');
    } catch (erro) {
        console.error('Erro ao inicializar banco de dados:', erro);
        throw erro;
    }
}

module.exports = { inicializarBancoDeDados }; 