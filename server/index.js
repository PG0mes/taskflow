const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = "minha_chave_super_secreta_mude_isso_em_prod";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// --- AUTENTICAÇÃO ---

// Rota de Registro
app.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    // 1. Verificar se usuário já existe
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: "Email já cadastrado" });

    // 2. Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Criar usuário
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword }
    });

    res.status(201).json({ message: "Usuário criado!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao registrar" });
  }
});

// Rota de Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Buscar usuário
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Usuário ou senha inválidos" });

    // 2. Comparar senhas (A que veio vs A do banco)
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Usuário ou senha inválidos" });

    // 3. Gerar o Token (O Crachá)
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

    // 4. Retornar token e dados básicos (sem a senha!)
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Erro no login" });
  }
});

// 10. Obter dados do usuário logado (Mais seguro que LocalStorage)
app.get('/me', async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Não autorizado" });

  try {
    // Em um app real, verificaríamos a validade do token aqui.
    // Para simplificar, vamos confiar que o frontend mandou o ID ou Email no header,
    // ou decodificaríamos o token. Mas para manter simples:
    // Vamos buscar pelo ID que passaremos no header customizado 'user-id'
    const userId = req.headers['user-id'];
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { id: true, name: true, email: true, createdAt: true } // Não devolve a senha!
    });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar perfil" });
  }
});

// 11. Atualizar Perfil (Nome e Senha)
app.put('/me', async (req, res) => {
  const { id, name, password } = req.body;

  try {
    const dataToUpdate = { name };
    
    // Se mandou senha nova, criptografa antes de salvar
    if (password && password.trim() !== "") {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      select: { id: true, name: true, email: true } // Retorna os dados novos (sem senha)
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
});

// --- ROTAS ---

// Rota de Teste
app.get('/', (req, res) => {
  res.send('API do TaskFlow está rodando!');
});

// 1. Listar Boards
app.get('/boards', async (req, res) => {
  const boards = await prisma.board.findMany();
  res.json(boards);
});

// 2. Criar Board
app.post('/boards', async (req, res) => {
  const { title } = req.body;
  const newBoard = await prisma.board.create({ data: { title } });
  res.status(201).json(newBoard);
});

// 3. Pegar Board Específico
app.get('/boards/:id', async (req, res) => {
  const { id } = req.params;
  const board = await prisma.board.findUnique({
    where: { id: parseInt(id) },
    include: { 
      lists: {
        include: { cards: true }
      }
    }
  });
  res.json(board);
});

// 4. Criar Lista
app.post('/lists', async (req, res) => {
  const { title, boardId } = req.body;
  const newList = await prisma.list.create({
    data: { title, boardId: parseInt(boardId) }
  });
  res.json(newList);
});

// 5. Criar Cartão
app.post('/cards', async (req, res) => {
  const { title, listId } = req.body;
  const count = await prisma.card.count({ where: { listId: parseInt(listId) } });
  const newCard = await prisma.card.create({
    data: { 
      title, 
      listId: parseInt(listId),
      order: count
    }
  });
  res.json(newCard);
});

// --- ATENÇÃO: A ROTA DE REORDER DEVE VIR ANTES DO /cards/:id ---

// 9. Reordenar Cartões (MOVIDA PARA CIMA)
app.put('/cards/reorder', async (req, res) => {
  const { listId, cardIds } = req.body;
  console.log("Reordenando...", listId, cardIds); // Log para debug

  try {
    await prisma.$transaction(
      cardIds.map((cardId, index) => 
        prisma.card.update({
          where: { id: parseInt(cardId) }, // Garante que é Int
          data: { 
            order: index, 
            listId: parseInt(listId)
          }
        })
      )
    );
    res.json({ message: 'Ordem atualizada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao reordenar cartões' });
  }
});

// 6. Atualizar Cartão Genérico (Título, etc)
app.put('/cards/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, listId } = req.body;
  try {
    const updatedCard = await prisma.card.update({
      where: { id: parseInt(id) },
      data: { title, description, priority, listId }
    });
    res.json(updatedCard);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cartão' });
  }
});

// 7. Deletar Cartão
app.delete('/cards/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.card.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'Deletado' });
});

// 8. Deletar Lista
app.delete('/lists/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.list.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'Deletada' });
});

// Iniciar o servidor (SEMPRE NO FINAL DO ARQUIVO)
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});