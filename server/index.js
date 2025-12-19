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

// --- MIDDLEWARE DE AUTENTICAÇÃO ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1] ? authHeader.split(' ')[1] : authHeader;

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    // IMPORTANTE: O 'user' aqui contém o payload do token ({ id: 1, email: ... })
    req.user = user; 
    next();
  });
}

// --- ROTAS PÚBLICAS ---

app.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: "Email já cadastrado" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { email, name, password: hashedPassword }
    });

    res.status(201).json({ message: "Usuário criado!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao registrar" });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Usuário ou senha inválidos" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Usuário ou senha inválidos" });

    // UNIFICAÇÃO: Usando 'id' no payload para bater com o resto do código
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Erro no login" });
  }
});

// --- ROTAS PROTEGIDAS ---

// 1. Obter Perfil
app.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }, // CORRIGIDO: usa req.user.id
      select: { id: true, name: true, email: true, createdAt: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar perfil" });
  }
});

// 2. Atualizar Perfil
app.put('/me', authenticateToken, async (req, res) => {
  const { name, password } = req.body;
  try {
    const dataToUpdate = { name };
    if (password && password.trim() !== "") {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id }, // CORRIGIDO: usa req.user.id
      data: dataToUpdate,
      select: { id: true, name: true, email: true }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
});

// 3. Listar Boards
app.get('/boards', authenticateToken, async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: req.user.id }, // CORRIGIDO: usa req.user.id
          { members: { some: { id: req.user.id } } }
        ]
      },
      include: { 
        members: { select: { id: true, name: true, email: true } },
        owner: { select: { name: true } }
      } 
    });
    res.json(boards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar quadros." });
  }
});

// 4. Criar Board
app.post('/boards', authenticateToken, async (req, res) => {
  const { title } = req.body;
  try {
    const newBoard = await prisma.board.create({
      data: {
        title,
        ownerId: req.user.id, // CORRIGIDO: O erro estava aqui (era userId)
      },
    });
    res.json(newBoard);
  } catch (error) {
    console.error("Erro Prisma:", error);
    res.status(500).json({ error: "Erro ao criar o quadro." });
  }
});

// 5. Pegar Board Específico (ATUALIZADO)
app.get('/boards/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const board = await prisma.board.findFirst({
      where: { 
        id: parseInt(id),
        OR: [
            { ownerId: req.user.id },
            { members: { some: { id: req.user.id } } }
        ]
      },
      include: { 
        lists: {
          include: { cards: true }
        },
        members: { // <--- ADICIONE ISSO AQUI!
          select: { id: true, name: true, email: true } 
        },
        owner: { // <--- E ISSO PARA SABER O DONO
          select: { id: true, name: true } 
        }
      }
    });

    if (!board) return res.status(404).json({ error: "Quadro não encontrado." });
    
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar quadro." });
  }
});

// 1. ROTA DE CONVITE ATUALIZADA (Cria o convite, não adiciona direto)
app.post('/boards/:id/invite', authenticateToken, async (req, res) => {
  const { email } = req.body;
  const boardId = parseInt(req.params.id);

  try {
    const board = await prisma.board.findUnique({ where: { id: boardId }, include: { members: true } });
    if (!board || board.ownerId !== req.user.id) {
        return res.status(403).json({ error: "Sem permissão." });
    }

    const receiver = await prisma.user.findUnique({ where: { email } });
    if (!receiver) return res.status(404).json({ error: 'Usuário não encontrado.' });

    // Verifica se já é membro
    const isMember = board.members.some(m => m.id === receiver.id);
    if (isMember) return res.status(400).json({ error: 'Usuário já é membro.' });

    // Verifica se já tem convite pendente
    const inviteExists = await prisma.invite.findFirst({
        where: { boardId, receiverId: receiver.id }
    });
    if (inviteExists) return res.status(400).json({ error: 'Convite já enviado.' });

    // Cria o convite
    await prisma.invite.create({
      data: {
        senderId: req.user.id,
        receiverId: receiver.id,
        boardId
      }
    });

    res.json({ message: 'Convite enviado!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar convite.' });
  }
});

// 2. NOVA ROTA: Listar meus convites pendentes
app.get('/notifications', authenticateToken, async (req, res) => {
    try {
        const invites = await prisma.invite.findMany({
            where: { receiverId: req.user.id },
            include: {
                sender: { select: { name: true } },
                board: { select: { title: true } }
            }
        });
        res.json(invites);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar notificações" });
    }
});

// 3. NOVA ROTA: Aceitar ou Recusar Convite
app.post('/notifications/:id/respond', authenticateToken, async (req, res) => {
    const { accept } = req.body; // true ou false
    const inviteId = parseInt(req.params.id);

    try {
        const invite = await prisma.invite.findUnique({ where: { id: inviteId } });
        if (!invite) return res.status(404).json({ error: "Convite não encontrado" });

        if (accept) {
            // Adiciona o usuário ao quadro
            await prisma.board.update({
                where: { id: invite.boardId },
                data: {
                    members: { connect: { id: req.user.id } }
                }
            });
        }

        // Deleta o convite (seja aceito ou recusado)
        await prisma.invite.delete({ where: { id: inviteId } });

        res.json({ message: accept ? "Convite aceito!" : "Convite recusado." });
    } catch (error) {
        res.status(500).json({ error: "Erro ao responder convite" });
    }
});

// 4. NOVA ROTA: Deletar Quadro
app.delete('/boards/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        // Verifica se é o dono antes de deletar
        const board = await prisma.board.findUnique({ where: { id: parseInt(id) } });
        if (!board || board.ownerId !== req.user.id) {
            return res.status(403).json({ error: "Apenas o dono pode deletar." });
        }

        // O delete apaga listas e cards automaticamente (se configurou onDelete Cascade no Prisma)
        // Se não, o prisma pode reclamar. No nosso schema List tem onDelete Cascade, mas Invite precisa ter também.
        await prisma.board.delete({ where: { id: parseInt(id) } });
        
        res.json({ message: "Quadro deletado." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao deletar quadro." });
    }
});

// --- ROTAS LISTAS E CARDS (Simplificadas) ---

app.post('/lists', async (req, res) => {
  const { title, boardId } = req.body;
  const newList = await prisma.list.create({
    data: { title, boardId: parseInt(boardId) }
  });
  res.json(newList);
});

app.post('/cards', async (req, res) => {
  const { title, listId } = req.body;
  const count = await prisma.card.count({ where: { listId: parseInt(listId) } });
  const newCard = await prisma.card.create({
    data: { title, listId: parseInt(listId), order: count }
  });
  res.json(newCard);
});

app.put('/cards/reorder', async (req, res) => {
  const { listId, cardIds } = req.body;
  try {
    await prisma.$transaction(
      cardIds.map((cardId, index) => 
        prisma.card.update({
          where: { id: parseInt(cardId) },
          data: { order: index, listId: parseInt(listId) }
        })
      )
    );
    res.json({ message: 'Ordem atualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao reordenar' });
  }
});

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

app.delete('/cards/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.card.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'Deletado' });
});

app.delete('/lists/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.list.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'Deletada' });
});

app.get('/', (req, res) => res.send('API TaskFlow V3'));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});