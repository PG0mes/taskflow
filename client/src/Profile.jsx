import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

    fetch('http://localhost:3001/me', {
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
      const response = await fetch('http://localhost:3001/me', {
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
        // Atualiza o localStorage para o nome mudar no cabeçalho imediatamente
        localStorage.setItem('user', JSON.stringify({ ...localUser, name: updatedData.name }));
        setMessage('Perfil atualizado com sucesso!');
        setPassword(''); // Limpa o campo de senha
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Formata a data (Ex: 18/12/2025)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-400 to-indigo-500 relative flex items-center justify-center font-sans">
      
      {/* Blobs de Fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse pointer-events-none"></div>

      {/* Card de Perfil */}
      <div className="bg-white/40 backdrop-blur-lg border border-white/60 p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10">
        
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="bg-white/50 p-2 rounded-full hover:bg-white text-indigo-900 transition">
            ←
          </Link>
          <h1 className="text-3xl font-extrabold text-indigo-900">Meu Perfil</h1>
        </div>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm text-center font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="flex flex-col gap-5">
          
          {/* Campo Nome */}
          <div>
            <label className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-1 ml-1">
              <Icons.User /> Nome
            </label>
            <input 
              type="text" 
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="w-full p-4 bg-white/60 border border-white/50 rounded-xl text-indigo-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/90 transition"
            />
          </div>

          {/* Campo Email (Somente Leitura) */}
          <div>
            <label className="text-sm font-bold text-indigo-900/60 flex items-center gap-2 mb-1 ml-1">
              <Icons.Mail /> Email (Não editável)
            </label>
            <input 
              type="email" 
              value={user.email}
              disabled
              className="w-full p-4 bg-black/5 border border-white/30 rounded-xl text-indigo-900/60 font-medium cursor-not-allowed"
            />
          </div>

          {/* Campo Membro Desde (Somente Leitura) */}
          <div>
            <label className="text-sm font-bold text-indigo-900/60 flex items-center gap-2 mb-1 ml-1">
              <Icons.Calendar /> Membro desde
            </label>
            <div className="w-full p-4 bg-black/5 border border-white/30 rounded-xl text-indigo-900/60 font-medium">
              {formatDate(user.createdAt)}
            </div>
          </div>

          {/* Campo Nova Senha */}
          <div>
            <label className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-1 ml-1">
              <Icons.Lock /> Nova Senha (Opcional)
            </label>
            <input 
              type="password" 
              placeholder="Deixe em branco para não alterar"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-white/60 border border-white/50 rounded-xl text-indigo-900 font-medium placeholder-indigo-900/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/90 transition"
            />
          </div>

          <button 
            type="submit" 
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            Salvar Alterações
          </button>
        </form>

      </div>
    </div>
  );
}

export default Profile;