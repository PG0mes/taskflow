# TaskFlow

![TaskFlow Status](https://img.shields.io/badge/Status-Concluído-brightgreen)

**TaskFlow** é uma aplicação Fullstack de gerenciamento de tarefas estilo Kanban. Desenvolvida para oferecer uma experiência fluida com Drag and Drop.

---

## 📸 Screenshots

<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
  <img src="./screenshots/tela.inicial.png" alt="Tela Inicial do Sistema" width="45%" style="border-radius: 10px; border: 1px solid #ccc;" />
  <img src="./screenshots/tela.quadro.png" alt="Board Kanban com Drag and Drop" width="45%" style="border-radius: 10px; border: 1px solid #ccc;" />
</div>

> *Acima: Visão da tela de inicial e do painel principal de tarefas.*
---

## 🛠️ Tecnologias Utilizadas

O projeto foi desenvolvido utilizando as seguintes tecnologias:

### **Frontend**
* ⚛️ **React + Vite**
* 🎨 **Tailwind CSS**
* ✨ **Glassmorphism** - UI Design translúcido.
* 🤚 **@hello-pangea/dnd** - Drag and Drop.

### **Backend**
* 🟢 **Node.js + Express**
* 🐘 **PostgreSQL (Neon DB)**
* 💎 **Prisma ORM** - Gerenciamento de banco de dados e migrações.
* 🔐 **JWT + BCrypt** - Autenticação e segurança de senhas.

---

## ✨ Funcionalidades

- [x] **Autenticação:** Login e Cadastro com criptografia segura.
- [x] **Gestão de Quadros:**
- [x] **Kanban Interativo:** Arraste e solte tarefas entre colunas.
- [x] **Persistência de Ordem:**
- [x] **Detalhes da Tarefa:** Prioridade (Alta/Média/Baixa), descrição e edição rápida.
- [x] **Perfil de Usuário:** Atualização de dados pessoais.
- [x] **UI Responsiva:**

---

## Como Rodar o Projeto

### Pré-requisitos
* Node.js instalado
* Uma URL de banco de dados PostgreSQL

# Clone o repositório
```bash
git clone (https://github.com/PG0mes/taskflow.git)
cd taskflow

# Entre na pasta do servidor
cd server

# Instale as dependências
npm install

# Crie um arquivo .env na raiz da pasta server e adicione sua URL do banco:
# DATABASE_URL="postgresql://usuario:senha@host:porta/banco"

# Rode as migrações para criar as tabelas no banco
npx prisma migrate dev --name init

# Inicie o servidor
node index.js

# Entre na pasta do cliente (a partir da raiz do projeto)
cd client

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

```

Feito por Pedro Gomes.
