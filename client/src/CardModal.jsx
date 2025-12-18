import { useState, useEffect } from 'react';

// Ícones SVG para substituir emojis
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
    // Overlay Escuro com Blur no fundo (Foco total no modal)
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity p-4" onClick={onClose}>
      
      {/* O Modal (Glassmorphism Sólido) */}
      <div 
        className="bg-white/90 border border-white/60 w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-start p-6 border-b border-indigo-100 bg-white/50">
          <input 
            className="text-2xl font-extrabold text-indigo-900 bg-transparent outline-none w-full border-b-2 border-transparent focus:border-indigo-400 transition placeholder-indigo-300"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da Tarefa"
            autoFocus
          />
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition ml-4"
          >
            <Icons.XMark />
          </button>
        </div>

        {/* Corpo do Modal (Scrollável) */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-8">
          
          {/* Seção de Prioridade */}
          <div>
            <div className="flex items-center gap-2 text-indigo-900 font-bold mb-3">
              <Icons.Tag />
              <span>Prioridade</span>
            </div>
            
            <div className="flex gap-3">
              {[
                { value: 'low', label: 'Baixa', color: 'bg-blue-300', ring: 'focus:ring-blue-300' },
                { value: 'medium', label: 'Média', color: 'bg-yellow-400', ring: 'focus:ring-yellow-400' },
                { value: 'high', label: 'Alta', color: 'bg-red-500', ring: 'focus:ring-red-500' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPriority(option.value)}
                  className={`
                    flex-1 py-2 px-4 rounded-xl border border-slate-200 transition-all font-semibold text-sm flex items-center justify-center gap-2
                    ${priority === option.value 
                      ? `${option.color} text-white shadow-md scale-105 border-transparent` 
                      : 'bg-white text-slate-500 hover:bg-slate-50'}
                  `}
                >
                  {/* Bolinha indicativa */}
                  <div className={`w-2 h-2 rounded-full ${priority === option.value ? 'bg-white' : option.color}`}></div>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Seção de Descrição */}
          <div>
            <div className="flex items-center gap-2 text-indigo-900 font-bold mb-3">
              <Icons.AlignLeft />
              <span>Descrição</span>
            </div>
            <textarea 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl h-40 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition text-slate-700 leading-relaxed"
              placeholder="Adicione detalhes, notas ou contexto para esta tarefa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

        </div>

        {/* Rodapé com Ações */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 hover:scale-105 transition transform"
          >
            Salvar Alterações
          </button>
        </div>

      </div>
    </div>
  );
}

export default CardModal;