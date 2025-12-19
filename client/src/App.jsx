import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './components/ThemeToggle'; 

// Textura de Ruído (Noise)
const noiseBg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`;

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
    // Fundo Adaptativo: Claro (Slate-50) vs Escuro (#0a0e17)
    <div className="min-h-screen relative overflow-hidden font-sans transition-colors duration-500 bg-slate-50 dark:bg-[#0a0e17]">
      
      {/* --- BACKGROUND VIVO (ADAPTATIVO) --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob opacity-40 dark:opacity-20 bg-purple-300 dark:bg-blue-700"></div>
        <div className="absolute top-[10%] right-[-10%] w-[400px] h-[400px] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] animate-blob animation-delay-2000 opacity-40 dark:opacity-20 bg-yellow-200 dark:bg-sky-600"></div>
        <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000 opacity-40 dark:opacity-30 bg-pink-300 dark:bg-indigo-800"></div>
        <div className="absolute inset-0 z-0 opacity-20 dark:opacity-30" style={{ backgroundImage: noiseBg }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-slate-200 dark:border-white/10 pb-8 gap-6 transition-colors duration-500">
          <div>
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-blue-600 dark:from-white dark:to-blue-200 drop-shadow-sm tracking-tight mb-2">
              TaskFlow
            </h1>
            <p className="text-slate-500 dark:text-blue-200/60 font-light text-lg">
              Painel de Controle
            </p>
          </div>
          
          <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="text-right hidden sm:block mx-2">
                <p className="text-[10px] text-slate-400 dark:text-blue-300/50 uppercase tracking-widest font-bold mb-1">Logado como</p>
                <Link 
                  to="/profile" 
                  className="font-bold text-xl text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                >
                  {user.name || 'Visitante'}
                </Link>
              </div>
              <button 
                onClick={handleLogout} 
                className="
                  px-6 py-2.5 rounded-xl font-medium transition-all duration-300 border
                  bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-red-500
                  dark:bg-red-500/10 dark:text-red-200 dark:border-red-500/30 dark:hover:bg-red-500/20
                "
              >
                Sair
              </button>
          </div>
        </div>

        {/* BARRA DE CRIAÇÃO */}
        <form onSubmit={handleCreateBoard} className="relative group max-w-4xl mx-auto mb-16">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-sky-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="
            relative flex gap-4 p-2 rounded-2xl shadow-2xl backdrop-blur-xl border
            bg-white/80 border-white/50
            dark:bg-[#0f172a]/80 dark:border-white/10
          ">
            <input
              type="text"
              placeholder="Nome do seu próximo projeto..."
              className="
                flex-1 bg-transparent border-none px-6 py-4 font-medium focus:outline-none text-lg
                text-slate-800 placeholder-slate-400
                dark:text-white dark:placeholder-blue-200/30
              "
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg transform transition hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              Criar +
            </button>
          </div>
        </form>

        {/* SEÇÃO DE QUADROS */}
        <h3 className="text-slate-400 dark:text-blue-200/50 uppercase tracking-widest text-xs font-bold mb-6 pl-2 transition-colors">Seus Quadros</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boards.map((board) => (
            <Link to={`/board/${board.id}`} key={board.id} className="block group h-full">
              
              {/* --- CARD ADAPTATIVO CORRIGIDO --- */}
              <div 
                className="
                  relative h-full flex flex-col justify-between p-6 rounded-3xl 
                  transition-all duration-300 border
                  
                  bg-white/60 border-white shadow-lg hover:shadow-xl hover:border-blue-200 hover:bg-white/80
                  
                  dark:bg-white/5 dark:bg-gradient-to-b dark:from-white/10 dark:to-transparent dark:border-white/10 
                  dark:hover:border-blue-400/50 dark:hover:to-white/5 dark:hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]

                  hover:translate-y-[-4px]
                "
                style={{
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="hidden dark:block absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="
                      h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-inner border
                      bg-blue-50 border-blue-100 text-blue-500
                      dark:bg-blue-500/20 dark:border-blue-400/20 dark:text-blue-400
                      group-hover:bg-blue-500 group-hover:text-white group-hover:scale-110
                    ">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-500 dark:text-blue-400/40 dark:bg-black/20">
                      ID {board.id}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold mb-2 leading-tight transition-colors text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-100">
                    {board.title}
                  </h2>
                  <p className="text-xs font-medium text-slate-400 dark:text-blue-300/50">
                    Última atividade: Hoje
                  </p>
                </div>

                <div className="mt-8">
                  <div className="
                    w-full py-3 px-4 rounded-xl text-sm font-bold text-center transition-all duration-300 flex items-center justify-center gap-2 border
                    
                    bg-slate-50 text-blue-600 border-slate-200 
                    dark:bg-blue-600/20 dark:text-blue-200 dark:border-blue-500/30
                    
                    group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500
                  ">
                    Acessar Quadro
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {/* ... (Estado Vazio sem alterações) ... */}
           {boards.length === 0 && (
            <div className="
              col-span-full py-24 flex flex-col items-center justify-center rounded-3xl border border-dashed backdrop-blur-sm
              border-slate-300 bg-slate-50/50
              dark:border-blue-500/20 dark:bg-blue-500/5
            ">
              <div className="text-6xl mb-4 opacity-20 grayscale">📂</div>
              <p className="text-xl font-medium text-slate-600 dark:text-blue-200">
                Nenhum projeto encontrado.
              </p>
              <p className="mt-2 text-sm text-slate-400 dark:text-blue-400/50">
                Crie seu primeiro quadro acima para começar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;