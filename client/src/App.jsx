import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './components/ThemeToggle'; 

// Textura de Ruído (Noise)
const noiseBg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`;

// Novos Ícones (Bell para notificações, Trash para deletar)
const Icons = {
    Bell: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>,
    Trash: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
};

function App() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [boards, setBoards] = useState([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  
  // Novos estados para notificações
  const [invites, setInvites] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Helper de autenticação
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    };
  };

  // Função unificada para buscar dados iniciais
  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    try {
      // 1. Busca Quadros
      const resBoards = await fetch('https://taskflow-api-6l5b.onrender.com/boards', { headers: getAuthHeaders() });
      if (resBoards.status === 401 || resBoards.status === 403) { handleLogout(); return; }
      const dataBoards = await resBoards.json();
      setBoards(dataBoards);

      // 2. Busca Notificações (Convites)
      const resInvites = await fetch('https://taskflow-api-6l5b.onrender.com/notifications', { headers: getAuthHeaders() });
      if (resInvites.ok) {
          const dataInvites = await resInvites.json();
          setInvites(dataInvites);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle) return;

    try {
      const response = await fetch('https://taskflow-api-6l5b.onrender.com/boards', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: newBoardTitle }),
      });

      if (response.ok) {
          setNewBoardTitle(''); 
          fetchData(); // Recarrega a lista
      } else {
          alert("Erro ao criar projeto");
      }
    } catch (error) {
      console.error("Erro ao criar:", error);
    }
  };

  // Nova função: Responder ao convite
  const handleRespondInvite = async (id, accept) => {
      try {
          await fetch(`https://taskflow-api-6l5b.onrender.com/notifications/${id}/respond`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({ accept })
          });
          // Atualiza lista de quadros e limpa notificação
          fetchData(); 
          // Se recusou ou aceitou, a lista de invites vai diminuir, fechando o dropdown se vazio
          if (invites.length <= 1) setShowNotifications(false);
      } catch (error) {
          console.error(error);
      }
  };

  // Nova função: Deletar Quadro
  const handleDeleteBoard = async (e, boardId) => {
      e.preventDefault(); // Impede o Link de navegar para o quadro
      e.stopPropagation();
      
      if(!confirm("Tem certeza que deseja apagar este quadro e todas as suas tarefas?")) return;

      try {
          const response = await fetch(`https://taskflow-api-6l5b.onrender.com/boards/${boardId}`, {
              method: 'DELETE',
              headers: getAuthHeaders()
          });
          
          if(response.ok) {
              fetchData();
          } else {
              alert("Erro ao deletar (talvez você não seja o dono).");
          }
      } catch(error) {
          console.error(error);
      }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans transition-colors duration-500 bg-slate-50 dark:bg-[#0a0e17]">
      
      {/* --- BACKGROUND VIVO --- */}
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
              
              {/* --- ÁREA DE NOTIFICAÇÕES (SINO) --- */}
              <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2.5 rounded-xl relative transition-all border
                        bg-white border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300
                        dark:bg-white/5 dark:border-white/10 dark:text-blue-200 dark:hover:bg-white/10
                    "
                  >
                      <Icons.Bell />
                      {/* Bolinha vermelha se tiver convite */}
                      {invites.length > 0 && (
                          <>
                            <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full animate-ping"></span>
                            <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-[#0a0e17]"></span>
                          </>
                      )}
                  </button>

                  {/* Dropdown de Convites */}
                  {showNotifications && (
                      <div className="absolute right-0 mt-4 w-80 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl z-50 
                          bg-white/95 border-slate-200 
                          dark:bg-[#0f172a]/95 dark:border-white/20 dark:shadow-black/50
                      ">
                          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 dark:border-white/10">
                              <h3 className="font-bold text-slate-700 dark:text-white">Notificações</h3>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
                                  {invites.length}
                              </span>
                          </div>
                          
                          {invites.length === 0 ? (
                              <p className="text-sm text-slate-400 text-center py-4">Tudo limpo por aqui! ✨</p>
                          ) : (
                              <div className="flex flex-col gap-3 max-h-64 overflow-y-auto custom-scrollbar">
                                  {invites.map(invite => (
                                      <div key={invite.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10">
                                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                                              <span className="font-bold text-blue-600 dark:text-blue-400">{invite.sender.name}</span> te convidou para participar do quadro <span className="font-bold text-slate-800 dark:text-white">"{invite.board.title}"</span>.
                                          </p>
                                          <div className="flex gap-2">
                                              <button 
                                                  onClick={() => handleRespondInvite(invite.id, true)} 
                                                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                                              >
                                                  Aceitar
                                              </button>
                                              <button 
                                                  onClick={() => handleRespondInvite(invite.id, false)} 
                                                  className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 dark:hover:bg-red-500/20 dark:hover:text-red-300 rounded-lg text-xs font-bold transition-all active:scale-95"
                                              >
                                                  Recusar
                                              </button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  )}
              </div>

              <ThemeToggle />

              <div className="text-right hidden sm:block mx-2">
                <p className="text-[10px] text-slate-400 dark:text-blue-300/50 uppercase tracking-widest font-bold mb-1">Logado como</p>
                <Link to="/profile" className="font-bold text-xl text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
                  {user.name || 'Visitante'}
                </Link>
              </div>
              <button onClick={handleLogout} className="bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-red-500 dark:bg-red-500/10 dark:text-red-200 dark:border-red-500/30 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium dark:hover:bg-red-500/20">
                Sair
              </button>
          </div>
        </div>

        {/* BARRA DE CRIAÇÃO (Igual) */}
        <form onSubmit={handleCreateBoard} className="relative group max-w-4xl mx-auto mb-16">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-sky-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex gap-4 p-2 rounded-2xl shadow-2xl backdrop-blur-xl border bg-white/80 border-white/50 dark:bg-[#0f172a]/80 dark:border-white/10">
            <input
              type="text"
              placeholder="Nome do seu próximo projeto..."
              className="flex-1 bg-transparent border-none px-6 py-4 font-medium focus:outline-none text-lg text-slate-800 placeholder-slate-400 dark:text-white dark:placeholder-blue-200/30"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
            />
            <button type="submit" className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg transform transition hover:scale-[1.02] active:scale-95 whitespace-nowrap">
              Criar +
            </button>
          </div>
        </form>

        {/* SEÇÃO DE QUADROS */}
        <h3 className="text-slate-400 dark:text-blue-200/50 uppercase tracking-widest text-xs font-bold mb-6 pl-2 transition-colors">Seus Quadros</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boards.map((board) => {
            const isOwner = board.ownerId === user.id;

            return (
              <Link to={`/board/${board.id}`} key={board.id} className="block group h-full relative">
                
                {/* --- CARD ADAPTATIVO --- */}
                <div 
                  className="
                    relative h-full flex flex-col justify-between p-6 rounded-3xl 
                    transition-all duration-300 border
                    bg-white/60 border-white shadow-lg hover:shadow-xl hover:border-blue-200 hover:bg-white/80
                    dark:bg-white/5 dark:bg-gradient-to-b dark:from-white/10 dark:to-transparent dark:border-white/10 
                    dark:hover:border-blue-400/50 dark:hover:to-white/5 dark:hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]
                    hover:translate-y-[-4px]
                  "
                  style={{ backdropFilter: 'blur(12px)' }}
                >
                  <div className="hidden dark:block absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50"></div>

                  {/* BOTÃO DE DELETAR (Aparece no Hover, Só para Dono) */}
                  {isOwner && (
                      <button 
                          onClick={(e) => handleDeleteBoard(e, board.id)}
                          className="absolute top-4 right-4 p-2 rounded-full z-20 transition-all opacity-0 group-hover:opacity-100
                              text-slate-400 hover:text-red-500 hover:bg-red-50 
                              dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-red-500/10
                          "
                          title="Apagar Quadro"
                      >
                          <Icons.Trash />
                      </button>
                  )}

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      
                      {/* ÍCONE DINÂMICO */}
                      <div className={`
                        h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-inner border
                        group-hover:scale-110 group-hover:text-white
                        ${isOwner 
                            ? 'bg-blue-50 border-blue-100 text-blue-500 dark:bg-blue-500/20 dark:border-blue-400/20 dark:text-blue-400 group-hover:bg-blue-500' 
                            : 'bg-purple-50 border-purple-100 text-purple-500 dark:bg-purple-500/20 dark:border-purple-400/20 dark:text-purple-400 group-hover:bg-purple-500'}
                      `}>
                        {isOwner ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                            </svg>
                        )}
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg 
                        ${isOwner 
                            ? 'bg-slate-100 text-slate-500 dark:text-blue-400/40 dark:bg-black/20' 
                            : 'bg-purple-100 text-purple-600 dark:text-purple-300 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-500/30'}
                      `}>
                        {isOwner ? `ID ${board.id}` : 'COMPARTILHADO'}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold mb-2 leading-tight transition-colors text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-100">
                      {board.title}
                    </h2>
                    
                    {!isOwner && (
                        <p className="text-xs font-bold text-purple-500 dark:text-purple-300 mb-1 flex items-center gap-1">
                            <span>👑</span> Dono: {board.owner?.name}
                        </p>
                    )}

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
            );
          })}

          {/* Estado Vazio */}
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