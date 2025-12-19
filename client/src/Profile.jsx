import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './components/ThemeToggle'; // Importe o botão

// Textura de Ruído (Noise)
const noiseBg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`;

// Ícones SVG
const Icons = {
  User: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>,
  Mail: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>,
  Lock: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>,
  Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v7.5" /></svg>
};

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', email: '', createdAt: '' });
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Busca dados ao carregar
  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!localUser.id) return navigate('/login');

    fetch('https://taskflow-api-6l5b.onrender.com/me', {
      headers: { 
        'Authorization': localStorage.getItem('token'),
        'user-id': localUser.id 
      }
    })
    .then(res => res.json())
    .then(data => setUser(data));
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const localUser = JSON.parse(localStorage.getItem('user'));
    
    try {
      const response = await fetch('https://taskflow-api-6l5b.onrender.com/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: localUser.id,
          name: user.name,
          password: password // Envia apenas se preencheu
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        localStorage.setItem('user', JSON.stringify({ ...localUser, name: updatedData.name }));
        setMessage('Perfil atualizado com sucesso!');
        setPassword(''); 
        
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    // Fundo Adaptativo: Claro (Slate-50) vs Escuro (#0a0e17)
    <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden py-10 transition-colors duration-500 bg-slate-50 dark:bg-[#0a0e17]">
      
      {/* Background Vivo (Adaptativo) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob opacity-40 dark:opacity-20 bg-purple-300 dark:bg-blue-700"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] animate-blob animation-delay-2000 opacity-40 dark:opacity-20 bg-yellow-200 dark:bg-sky-600"></div>
        <div className="absolute inset-0 z-0 opacity-20 dark:opacity-30" style={{ backgroundImage: noiseBg }}></div>
      </div>

      {/* Card de Perfil - Adaptativo */}
      <div 
        className="
          backdrop-blur-xl border p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 mx-4 transition-colors duration-500
          
          /* Light Mode */
          bg-white/60 border-white shadow-slate-200
          
          /* Dark Mode */
          dark:bg-[#0f172a]/70 dark:border-white/20 dark:shadow-black/50
        "
        style={{
          boxShadow: 'inset 1px 1px 0 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-8 border-b pb-6 border-slate-200 dark:border-white/10 transition-colors">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="
                w-10 h-10 rounded-full flex items-center justify-center transition-all border
                bg-white border-slate-200 text-slate-600 hover:bg-slate-100
                dark:bg-white/10 dark:border-white/10 dark:text-white dark:hover:bg-white/20
              "
            >
              ←
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Meu Perfil</h1>
          </div>
          
          {/* Botão de Tema */}
          <ThemeToggle />
        </div>

        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 px-4 py-3 rounded-xl mb-6 text-sm text-center font-medium animate-pulse">
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="flex flex-col gap-6">
          
          {/* Campo Nome */}
          <div className="group">
            <label className="text-xs font-bold flex items-center gap-2 mb-2 ml-1 uppercase tracking-wider text-blue-600 dark:text-blue-300">
              <Icons.User /> Nome
            </label>
            <input 
              type="text" 
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="
                w-full p-4 rounded-xl font-medium focus:outline-none focus:ring-2 transition-all border
                bg-white/50 border-slate-200 text-slate-800 focus:ring-blue-400 focus:bg-white
                dark:bg-[#0a0e17]/50 dark:border-white/10 dark:text-white dark:focus:ring-blue-500/50 dark:hover:border-white/20
              "
            />
          </div>

          {/* Campo Email (Somente Leitura) */}
          <div>
            <label className="text-xs font-bold flex items-center gap-2 mb-2 ml-1 uppercase tracking-wider text-slate-500 dark:text-slate-500">
              <Icons.Mail /> Email (Não editável)
            </label>
            <input 
              type="email" 
              value={user.email}
              disabled
              className="
                w-full p-4 rounded-xl font-medium cursor-not-allowed select-none border
                bg-slate-100 border-slate-200 text-slate-400
                dark:bg-[#0a0e17]/30 dark:border-white/5 dark:text-slate-500
              "
            />
          </div>

          {/* Campo Membro Desde (Somente Leitura) */}
          <div>
            <label className="text-xs font-bold flex items-center gap-2 mb-2 ml-1 uppercase tracking-wider text-slate-500 dark:text-slate-500">
              <Icons.Calendar /> Membro desde
            </label>
            <div className="
              w-full p-4 rounded-xl font-medium select-none border
              bg-slate-100 border-slate-200 text-slate-400
              dark:bg-[#0a0e17]/30 dark:border-white/5 dark:text-slate-500
            ">
              {formatDate(user.createdAt)}
            </div>
          </div>

          {/* Campo Nova Senha */}
          <div className="group">
            <label className="text-xs font-bold flex items-center gap-2 mb-2 ml-1 uppercase tracking-wider text-blue-600 dark:text-blue-300">
              <Icons.Lock /> Nova Senha (Opcional)
            </label>
            <input 
              type="password" 
              placeholder="Deixe em branco para não alterar"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full p-4 rounded-xl font-medium focus:outline-none focus:ring-2 transition-all border
                bg-white/50 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-blue-400 focus:bg-white
                dark:bg-[#0a0e17]/50 dark:border-white/10 dark:text-white dark:placeholder-slate-600 dark:focus:ring-blue-500/50 dark:hover:border-white/20
              "
            />
          </div>

          <button 
            type="submit" 
            className="
              mt-4 py-4 rounded-xl font-bold text-lg shadow-lg transform transition-all hover:scale-[1.01] active:scale-95 border
              bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-blue-900/20 border-transparent
            "
          >
            Salvar Alterações
          </button>
        </form>

      </div>
    </div>
  );
}

export default Profile;