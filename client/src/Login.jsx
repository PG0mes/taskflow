import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isRegister ? 'register' : 'login';
    const body = isRegister ? { email, password, name } : { email, password };

    try {
      const response = await fetch(`http://localhost:3001/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na requisição');
      }

      if (isRegister) {
        alert("Conta criada! Faça login.");
        setIsRegister(false);
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
        window.location.reload();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    // Fundo Geral (Gradiente Azul Claro)
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-300 via-blue-400 to-indigo-500 relative overflow-hidden">
      
      {/* Elementos Decorativos (Para dar o efeito de profundidade no vidro) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>

      {/* O CARD DE VIDRO (GLASSMORPHISM) */}
      <div className="relative z-10 bg-white/30 backdrop-blur-lg border border-white/40 p-12 rounded-3xl shadow-2xl w-full max-w-lg">
        
        {/* Cabeçalho do Card */}
        <div className="text-center mb-10">
          <h1 className="text-6xl font-extrabold text-white drop-shadow-sm mb-2">
            TaskFlow 🚀
          </h1>
          <p className="text-blue-50 text-lg font-light tracking-wide">
            Gerencie seus projetos com fluidez e estilo.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6 text-center border-b border-white/20 pb-4">
           {isRegister ? 'Crie sua conta' : 'Seja bem-vindo!'}
        </h2>
        
        {error && (
          <div className="bg-red-500/80 backdrop-blur-sm text-white p-3 rounded-lg mb-6 text-sm text-center border border-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {isRegister && (
            <input 
              type="text" 
              placeholder="Seu Nome" 
              className="p-4 bg-white/60 border border-white/50 rounded-xl placeholder-slate-600 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/80 transition"
              required
              value={name} onChange={e => setName(e.target.value)}
            />
          )}
          <input 
            type="email" 
            placeholder="E-mail para acesso" 
            className="p-4 bg-white/60 border border-white/50 rounded-xl placeholder-slate-600 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/80 transition"
            required
            value={email} onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Senha" 
            className="p-4 bg-white/60 border border-white/50 rounded-xl placeholder-slate-600 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/80 transition"
            required
            value={password} onChange={e => setPassword(e.target.value)}
          />
          
          <button 
            type="submit" 
            className="mt-4 bg-indigo-600/90 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            {isRegister ? 'Começar Jornada' : 'Acessar Painel'}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-white/90 text-sm">
            {isRegister ? 'Já faz parte do time? ' : 'Ainda não tem conta? '}
            <button 
              onClick={() => setIsRegister(!isRegister)} 
              className="text-white font-bold hover:underline ml-1 underline-offset-4"
            >
              {isRegister ? 'Fazer Login' : 'Criar Conta'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;