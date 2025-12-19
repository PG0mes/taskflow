import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './components/ThemeToggle'; // Importando o botão

// Textura de Ruído (Noise)
const noiseBg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`;

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
      const response = await fetch(`https://taskflow-api-6l5b.onrender.com/${endpoint}`, {
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
    // Fundo Geral Adaptativo
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-500 bg-slate-50 dark:bg-[#0a0e17]">
      
      {/* Botão de Tema Flutuante (Canto Superior Direito) */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* --- CAMADA 1: BACKGROUND VIVO ADAPTATIVO --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        {/* Blob 1 */}
        <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full filter blur-[100px] animate-blob 
          bg-purple-300 opacity-40 mix-blend-multiply
          dark:bg-blue-700 dark:opacity-40 dark:mix-blend-screen
        "></div>
        
        {/* Blob 2 */}
        <div className="absolute top-[10%] right-[-10%] w-[400px] h-[400px] rounded-full filter blur-[80px] animate-blob animation-delay-2000
          bg-blue-200 opacity-40 mix-blend-multiply
          dark:bg-sky-600 dark:opacity-40 dark:mix-blend-screen
        "></div>
        
        {/* Blob 3 */}
        <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] rounded-full filter blur-[120px] animate-blob animation-delay-4000
          bg-pink-200 opacity-40 mix-blend-multiply
          dark:bg-indigo-800 dark:opacity-50 dark:mix-blend-screen
        "></div>
        
        {/* Overlay de Ruído Geral */}
        <div className="absolute inset-0 z-0 opacity-20 dark:opacity-30" style={{ backgroundImage: noiseBg }}></div>
      </div>

      {/* --- CAMADA 2: O CARTÃO GLASSMORPHISM --- */}
      <div className="relative z-10 p-[1px] rounded-3xl shadow-2xl mx-4 bg-gradient-to-b from-white/60 via-white/20 to-transparent dark:from-blue-300/20 dark:via-blue-400/5 dark:to-transparent">
        
        <div 
          className="
            relative w-full max-w-xl p-12 sm:p-14 rounded-3xl overflow-hidden flex flex-col justify-center transition-colors duration-500
            
            /* Light Mode Card */
            bg-white/60 
            
            /* Dark Mode Card */
            dark:bg-[#0f172a]/60
          " 
          style={{
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: 'inset 0px 1px 0px rgba(255, 255, 255, 0.4), 0 20px 40px rgba(0,0,0,0.2)', 
          }}
        >
          {/* Ruído Específico do Card */}
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: noiseBg }}></div>

          <div className="relative z-10">
            {/* Cabeçalho */}
            <div className="text-center mb-10">
              <h1 className="text-5xl font-black mb-3 tracking-tight drop-shadow-sm text-slate-800 dark:text-white transition-colors">
                TaskFlow
              </h1>
              <p className="text-lg font-light text-slate-500 dark:text-blue-200/80 transition-colors">
                Gerencie projetos com fluidez.
              </p>
            </div>

            {/* Alternador de Título */}
            <h2 className="text-xl font-semibold mb-8 w-full text-center border-b pb-4 transition-colors text-slate-700 border-slate-200 dark:text-white dark:border-blue-500/30">
               {isRegister ? 'Criar nova conta' : 'Acessar painel'}
            </h2>
            
            {error && (
              <div className="w-full bg-red-100 border border-red-200 text-red-600 dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-100 p-4 rounded-xl mb-6 text-center shadow-sm font-medium transition-colors">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-6">
              {isRegister && (
                <div className="group">
                  <label className="block text-xs font-bold mb-1 ml-1 uppercase tracking-widest text-slate-500 dark:text-blue-300">Nome</label>
                  <input 
                    type="text" 
                    placeholder="Seu nome completo" 
                    className="
                      w-full px-6 py-4 rounded-xl font-medium focus:outline-none focus:ring-2 transition-all border text-lg
                      
                      bg-white/50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-blue-400
                      
                      dark:bg-[#0f172a]/50 dark:border-blue-300/10 dark:text-white dark:placeholder-blue-200/30 dark:focus:ring-blue-500 dark:hover:bg-[#0f172a]/70
                    "
                    required
                    value={name} onChange={e => setName(e.target.value)}
                  />
                </div>
              )}
              
              <div className="group">
                 <label className="block text-xs font-bold mb-1 ml-1 uppercase tracking-widest text-slate-500 dark:text-blue-300">E-mail</label>
                <input 
                  type="email" 
                  placeholder="exemplo@email.com" 
                  className="
                    w-full px-6 py-4 rounded-xl font-medium focus:outline-none focus:ring-2 transition-all border text-lg
                    
                    bg-white/50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-blue-400
                    
                    dark:bg-[#0f172a]/50 dark:border-blue-300/10 dark:text-white dark:placeholder-blue-200/30 dark:focus:ring-blue-500 dark:hover:bg-[#0f172a]/70
                  "
                  required
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="group">
                 <label className="block text-xs font-bold mb-1 ml-1 uppercase tracking-widest text-slate-500 dark:text-blue-300">Senha</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="
                    w-full px-6 py-4 rounded-xl font-medium focus:outline-none focus:ring-2 transition-all border text-lg
                    
                    bg-white/50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-blue-400
                    
                    dark:bg-[#0f172a]/50 dark:border-blue-300/10 dark:text-white dark:placeholder-blue-200/30 dark:focus:ring-blue-500 dark:hover:bg-[#0f172a]/70
                  "
                  required
                  value={password} onChange={e => setPassword(e.target.value)}
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/30 dark:shadow-blue-900/50 transform transition-all hover:scale-[1.01] active:scale-95"
              >
                {isRegister ? 'Cadastrar' : 'Entrar'}
              </button>
            </form>

            <div className="text-center mt-10">
              <p className="text-base text-slate-500 dark:text-blue-200/60">
                {isRegister ? 'Já possui acesso? ' : 'Novo por aqui? '}
                <button 
                  onClick={() => setIsRegister(!isRegister)} 
                  className="font-bold ml-1 transition-colors border-b border-transparent text-blue-600 hover:text-blue-800 hover:border-blue-600 dark:text-white dark:hover:text-blue-300 dark:hover:border-blue-300"
                >
                  {isRegister ? 'Fazer Login' : 'Criar Conta'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;