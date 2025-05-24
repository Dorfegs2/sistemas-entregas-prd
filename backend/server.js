
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Rota de registro
app.post('/api/registrar', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const senhaHash = await bcrypt.hash(senha, 10);
    const result = await db.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id',
      [nome, email, senhaHash]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(400).json({ erro: 'Usuário já existe ou erro ao registrar' });
  }
});

// Rota de login
app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ erro: 'Usuário não encontrado' });

    const senhaOk = await bcrypt.compare(senha, user.senha);
    if (!senhaOk) return res.status(401).json({ erro: 'Senha inválida' });

    res.json({ id: user.id, email: user.email, nome: user.nome });
  } catch (err) {
    res.status(500).json({ erro: 'Erro no login' });
  }
});

// Listar solicitações do usuário
app.get('/api/solicitacoes/:usuario_id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM solicitacoes WHERE usuario_id = $1 ORDER BY data_criacao DESC',
      [req.params.usuario_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar solicitações' });
  }
});

// Criar nova solicitação
app.post('/api/solicitacoes', async (req, res) => {
  try {
    const { usuario_id, nome, numPedido, enderecoA, enderecoB, temRetorno } = req.body;
    const result = await db.query(
      `INSERT INTO solicitacoes 
      (usuario_id, nome, numPedido, enderecoA, enderecoB, temRetorno, status, data_criacao) 
      VALUES ($1, $2, $3, $4, $5, $6, 'aberto', CURRENT_TIMESTAMP) RETURNING id`,
      [usuario_id, nome, numPedido, enderecoA, enderecoB, temRetorno ? true : false]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar solicitação' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
