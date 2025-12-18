import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [boards, setBoards] = useState([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const fetchBoards = async () => {
    try {
      const response = await fetch('http://localhost:3001/boards');
      const data = await response.json();
      setBoards(data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle) return;

    try {
      await fetch('http://localhost:3001/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newBoardTitle }),
      });

      setNewBoardTitle(''); 
      fetchBoards(); 
    } catch (error) {
      console.error("Erro ao criar:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-400 to-indigo-500 relative overflow-hidden font-sans">
      
      {/* Blobs de fundo (Efeito visual) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        
        {/* CABEÇALHO */}
        <div className="flex justify-between items-end mb-12 border-b border-white/30 pb-4">
          <div>
            <h1 className="text-5xl font-extrabold text-white drop-shadow-sm tracking-tight">
              TaskFlow
            </h1>
            <p className="text-blue-50 mt-1 font-light">
              Painel de Projetos
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-white/90">
             <div className="text-right hidden sm:block">
                <p className="text-xs opacity-70 uppercase tracking-wider font-bold">Logado como</p>
                {/* Link para o Perfil */}
                <Link 
                  to="/profile" 
                  className="font-semibold text-lg hover:underline decoration-indigo-300 underline-offset-4 cursor-pointer"
                  title="Editar Perfil"
                >
                  {user.name || 'Visitante'}
                </Link>
             </div>
             <button 
               onClick={handleLogout} 
               className="bg-white/20 hover:bg-white/30 text-white px-5 py-2 rounded-full backdrop-blur-md transition border border-white/20 font-medium"
             >
               Sair
             </button>
          </div>
        </div>

        {/* BARRA DE CRIAÇÃO (Alto Contraste) */}
        <form onSubmit={handleCreateBoard} className="bg-white/40 backdrop-blur-md border border-white/50 p-3 rounded-2xl shadow-lg mb-12 flex gap-3 max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Qual o nome do seu próximo grande projeto?"
            className="flex-1 bg-white/50 border-none rounded-xl px-6 py-3 text-indigo-900 font-medium placeholder-indigo-700/50 focus:outline-none focus:bg-white/80 focus:ring-2 focus:ring-indigo-400 transition"
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-md transition transform hover:scale-105"
          >
            Criar Projeto
          </button>
        </form>

        {/* GRID DE PROJETOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {boards.map((board) => (
            <Link to={`/board/${board.id}`} key={board.id} className="block group">
              
              {/* Card de Vidro: Opaco para leitura */}
              <div className="aspect-square bg-white/40 backdrop-blur-lg border border-white/60 rounded-[2rem] p-8 flex flex-col justify-between shadow-lg transition-all duration-300 group-hover:bg-white/50 group-hover:scale-[1.03] group-hover:shadow-2xl relative overflow-hidden">
                
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div>
                  {/* Título Escuro (Indigo 900) */}
                  <h2 className="text-2xl font-extrabold text-indigo-900 mb-2 leading-tight group-hover:text-indigo-700 transition-colors">
                    {board.title}
                  </h2>
                  <div className="h-1 w-12 bg-indigo-900/20 rounded-full"></div>
                </div>

                <div className="flex justify-between items-end z-10 relative">
                  <span className="text-xs font-bold text-white bg-indigo-600 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Abrir
                  </span>
                  <p className="text-xs text-indigo-800/70 font-mono font-bold">
                    ID #{board.id}
                  </p>
                </div>

              </div>
            </Link>
          ))}

          {/* Estado Vazio */}
          {boards.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white/30 rounded-[2rem] border border-white/50 backdrop-blur-md">
              <p className="text-indigo-900 text-xl font-bold">
                Nenhum projeto encontrado.
              </p>
              <p className="text-indigo-800/70 mt-2">
                Utilize a barra acima para criar o primeiro.
              </p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default App;