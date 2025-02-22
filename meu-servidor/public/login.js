document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const resposta = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            // Salva o token no localStorage
            localStorage.setItem('token', dados.token);
            localStorage.setItem('usuario', JSON.stringify(dados.usuario));
            
            alert('Login realizado com sucesso!');
            window.location.href = '/home.html';
        } else {
            alert(dados.mensagem || 'Erro ao fazer login');
        }
    } catch (erro) {
        alert('Erro ao conectar ao servidor');
        console.error(erro);
    }
}); 