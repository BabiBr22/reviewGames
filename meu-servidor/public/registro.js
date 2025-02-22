document.getElementById('registroForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
    }

    try {
        const resposta = await fetch('/api/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            alert('Registro realizado com sucesso!');
            window.location.href = '/login.html'; // Mantém o redirecionamento para a página de login
        } else {
            alert(dados.mensagem || 'Erro ao registrar');
        }
    } catch (erro) {
        alert('Erro ao conectar ao servidor');
        console.error(erro);
    }
});