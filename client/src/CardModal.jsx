import { useState, useEffect } from 'react';

// Textura de Ruído (Noise)
const noiseBg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`;

// Ícones SVG
const Icons = {
  XMark: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  ),
  AlignLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
  ),
  Tag: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.593l6.25-2.083a2.25 2.25 0 0 0 .618-.466l-.001.001a2.248 2.248 0 0 0 .508-.663.75.75 0 0 0 .15-.494l-2.083-6.25a2.25 2.25 0 0 0-.593-2.607L10.957 3.518A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
  )
};

function CardModal({ card, onClose, onSave }) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [priority, setPriority] = useState(card.priority || 'low');

  // Fecha ao apertar ESC
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSave = () => {
    onSave({ ...card, title, description, priority });
    onClose();
  };

  return (
    // Overlay Adaptativo (Escuro no Light Mode para foco, Mais escuro no Dark Mode)
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-[#05080f]/80 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity p-4" onClick={onClose}>
      
      {/* O Modal Adaptativo */}
      <div 
        className="
          w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300
          
          /* Light Mode */
          bg-white/90 border border-white/60
          
          /* Dark Mode */
          dark:bg-[#0f172a]/90 dark:backdrop-blur-2xl dark:border-white/20 dark:shadow-black/50
        "
        style={{
          // Sombra interna sutil para efeito de vidro
          boxShadow: 'inset 1px 1px 0 0 rgba(255, 255, 255, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ruído de fundo sutil */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: noiseBg }}></div>
        
        {/* Cabeçalho do Modal */}
        <div className="relative z-10 flex justify-between items-start p-6 border-b transition-colors bg-slate-50/50 border-slate-200 dark:border-white/10 dark:bg-white/5">
          <div className="flex-1 mr-4">
             <label className="text-[10px] uppercase tracking-widest font-bold mb-1 block text-slate-500 dark:text-blue-400">
               Título da Tarefa
             </label>
             <input 
              className="
                text-2xl font-bold bg-transparent outline-none w-full border-b border-transparent transition
                text-slate-800 placeholder-slate-400 focus:border-blue-500
                dark:text-white dark:placeholder-slate-600
              "
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título..."
              autoFocus
            />
          </div>
          <button 
            onClick={onClose} 
            className="
              p-2 rounded-full transition
              text-slate-400 hover:text-slate-700 hover:bg-slate-200
              dark:hover:text-white dark:hover:bg-white/10
            "
          >
            <Icons.XMark />
          </button>
        </div>

        {/* Corpo do Modal (Scrollável) */}
        <div className="relative z-10 p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-8">
          
          {/* Seção de Prioridade */}
          <div>
            <div className="flex items-center gap-2 font-bold mb-3 text-sm uppercase tracking-wide text-slate-500 dark:text-blue-200">
              <Icons.Tag />
              <span>Prioridade</span>
            </div>
            
            <div className="flex gap-3">
              {[
                { 
                  value: 'low', 
                  label: 'Baixa', 
                  // Light Mode: Verde Claro / Dark Mode: Verde Neon
                  activeClass: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500 dark:text-white dark:shadow-[0_0_15px_rgba(16,185,129,0.5)] dark:border-emerald-400', 
                  inactiveClass: 'bg-white border-slate-200 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 dark:bg-[#0a0e17]/50 dark:text-emerald-500/70 dark:border-emerald-500/20 dark:hover:border-emerald-500/50 dark:hover:text-emerald-400' 
                },
                { 
                  value: 'medium', 
                  label: 'Média', 
                  // Light Mode: Amarelo Claro / Dark Mode: Amarelo Neon
                  activeClass: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500 dark:text-white dark:shadow-[0_0_15px_rgba(245,158,11,0.5)] dark:border-amber-400', 
                  inactiveClass: 'bg-white border-slate-200 text-slate-500 hover:border-amber-400 hover:text-amber-600 dark:bg-[#0a0e17]/50 dark:text-amber-500/70 dark:border-amber-500/20 dark:hover:border-amber-500/50 dark:hover:text-amber-400' 
                },
                { 
                  value: 'high', 
                  label: 'Alta', 
                  // Light Mode: Vermelho Claro / Dark Mode: Vermelho Neon
                  activeClass: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500 dark:text-white dark:shadow-[0_0_15px_rgba(239,68,68,0.5)] dark:border-red-400', 
                  inactiveClass: 'bg-white border-slate-200 text-slate-500 hover:border-red-400 hover:text-red-600 dark:bg-[#0a0e17]/50 dark:text-red-500/70 dark:border-red-500/20 dark:hover:border-red-500/50 dark:hover:text-red-400' 
                }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPriority(option.value)}
                  className={`
                    flex-1 py-3 px-4 rounded-xl border transition-all duration-200 font-bold text-sm flex items-center justify-center gap-2
                    ${priority === option.value ? option.activeClass : option.inactiveClass}
                  `}
                >
                  <div className={`w-2 h-2 rounded-full ${priority === option.value ? 'bg-current' : 'bg-slate-300 dark:bg-current dark:opacity-50'}`}></div>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Seção de Descrição */}
          <div>
            <div className="flex items-center gap-2 font-bold mb-3 text-sm uppercase tracking-wide text-slate-500 dark:text-blue-200">
              <Icons.AlignLeft />
              <span>Descrição</span>
            </div>
            <textarea 
              className="
                w-full p-4 rounded-xl h-48 resize-none transition-all border outline-none
                
                bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400 
                focus:bg-white focus:ring-2 focus:ring-blue-400/50 focus:border-transparent
                
                dark:bg-[#0a0e17]/50 dark:border-white/10 dark:text-slate-200 dark:placeholder-slate-600
                dark:focus:bg-[#0a0e17]/80 dark:focus:ring-blue-500/50
              "
              placeholder="Adicione detalhes, notas ou contexto para esta tarefa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

        </div>

        {/* Rodapé com Ações */}
        <div className="relative z-10 p-6 border-t flex justify-end gap-3 transition-colors bg-slate-50 border-slate-200 dark:bg-[#0a0e17]/30 dark:border-white/10">
          <button 
            onClick={onClose} 
            className="
              px-6 py-3 font-bold rounded-xl transition border border-transparent
              text-slate-500 hover:bg-slate-200 
              dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 dark:hover:border-white/10
            "
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            className="
              px-8 py-3 font-bold rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-95 text-white
              bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 
              dark:shadow-blue-500/25
            "
          >
            Salvar Alterações
          </button>
        </div>

      </div>
    </div>
  );
}

export default CardModal;