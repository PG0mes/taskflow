import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CardModal from './CardModal';
import ThemeToggle from './components/ThemeToggle';

// --- ÍCONES ---
const Icons = {
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  ),
  Note: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path fillRule="evenodd" d="M5.625 1.5H9a.375.375 0 0 1 .375.375v1.875c0 1.036.84 1.875 1.875 1.875H12.975a.375.375 0 0 1 .375.375v16.5c0 1.035-.84 1.875-1.875 1.875H5.625A1.875 1.875 0 0 1 3.75 22.5V3.375c0-1.036.84-1.875 1.875-1.875ZM12.75 12a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V18a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V12Z" clipRule="evenodd" />
    </svg>
  )
};

// --- HELPER: Cores das Etiquetas (Adaptado Dark/Light) ---
const getPriorityBadge = (priority) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
    case 'medium': return 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    case 'low': return 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    default: return 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
  }
};

const getPriorityLabel = (priority) => {
  switch (priority) {
    case 'high': return 'Alta';
    case 'medium': return 'Média';
    case 'low': return 'Baixa';
    default: return 'Normal';
  }
};

function Board() {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState('');
  const [newCardTitles, setNewCardTitles] = useState({});
  const [activeCard, setActiveCard] = useState(null);

  const fetchBoard = async () => {
    try {
      const response = await fetch(`http://localhost:3001/boards/${id}`);
      const data = await response.json();
      setBoard(data);
      const sortedLists = data.lists.map(list => ({
        ...list,
        cards: list.cards.sort((a, b) => (a.order || 0) - (b.order || 0))
      })).sort((a, b) => a.id - b.id);
      setLists(sortedLists);
    } catch (error) {
      console.error("Erro ao carregar:", error);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [id]);

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceListIndex = lists.findIndex(l => l.id.toString() === source.droppableId);
    const destListIndex = lists.findIndex(l => l.id.toString() === destination.droppableId);
    const newLists = [...lists];
    const sourceList = newLists[sourceListIndex];
    const destList = newLists[destListIndex];
    const [movedCard] = sourceList.cards.splice(source.index, 1);
    destList.cards.splice(destination.index, 0, movedCard);
    setLists(newLists);

    const destListId = destList.id;
    const destCardIds = destList.cards.map(card => card.id);

    try {
      await fetch('http://localhost:3001/cards/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId: destListId, cardIds: destCardIds }),
      });
      
      if (sourceListIndex !== destListIndex) {
         const sourceListId = sourceList.id;
         const sourceCardIds = sourceList.cards.map(card => card.id);
         await fetch('http://localhost:3001/cards/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listId: sourceListId, cardIds: sourceCardIds }),
        });
      }
    } catch (error) { console.error(error); }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle) return;
    await fetch('http://localhost:3001/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newListTitle, boardId: id }),
    });
    setNewListTitle('');
    fetchBoard();
  };

  const handleAddCard = async (e, listId) => {
    e.preventDefault();
    const title = newCardTitles[listId];
    if (!title) return;
    await fetch('http://localhost:3001/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, listId }),
    });
    setNewCardTitles({ ...newCardTitles, [listId]: '' });
    fetchBoard();
  };

  const handleDeleteCard = async (cardId) => {
    if (!confirm("Excluir cartão?")) return;
    await fetch(`http://localhost:3001/cards/${cardId}`, { method: 'DELETE' });
    fetchBoard();
  };

  const handleDeleteList = async (listId) => {
    if (!confirm("Excluir lista?")) return;
    await fetch(`http://localhost:3001/lists/${listId}`, { method: 'DELETE' });
    fetchBoard();
  };

  const handleUpdateCard = async (updatedCard) => {
    await fetch(`http://localhost:3001/cards/${updatedCard.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCard),
    });
    fetchBoard();
  };

  if (!board) return <div className="min-h-screen bg-slate-50 dark:bg-[#0a0e17] flex items-center justify-center text-slate-500 dark:text-white transition-colors duration-500">Carregando...</div>;

  return (
    <div className="min-h-screen relative flex flex-col font-sans overflow-hidden transition-colors duration-500 bg-slate-50 dark:bg-[#0a0e17]">
      
      {/* Background Vivo (Adaptativo) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob opacity-40 dark:opacity-20 bg-purple-300 dark:bg-blue-700"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] animate-blob animation-delay-2000 opacity-40 dark:opacity-20 bg-yellow-200 dark:bg-sky-600"></div>
      </div>

      {/* CABEÇALHO */}
      <div className="flex items-center justify-between px-8 py-6 z-10 border-b border-slate-200 dark:border-white/10 backdrop-blur-sm bg-white/50 dark:bg-[#0a0e17]/30 transition-colors duration-500">
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className="group flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-blue-200 dark:hover:text-white transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white dark:group-hover:bg-blue-600 transition-all">
              <span>←</span>
            </div>
            <span className="font-semibold text-sm">Voltar</span>
          </Link>
          <div className="h-8 w-px bg-slate-300 dark:bg-white/10 mx-2"></div>
          <div>
             <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{board.title}</h1>
          </div>
        </div>
        
        {/* Toggle de Tema no Header */}
        <ThemeToggle />
      </div>

      {/* ÁREA DE SCROLL HORIZONTAL */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 z-10">
        <div className="flex h-full items-start gap-6 min-w-fit">
          
          <DragDropContext onDragEnd={onDragEnd}>
            {lists.map((list) => (
              
              // --- COLUNA (LISTA) ADAPTATIVA ---
              <div 
                key={list.id} 
                className="
                  min-w-[320px] w-[320px] 
                  backdrop-blur-xl border rounded-2xl flex flex-col max-h-full shadow-2xl transition-colors duration-500
                  
                  /* Light Mode */
                  bg-white/60 border-white shadow-slate-200/50
                  
                  /* Dark Mode */
                  dark:bg-[#0f172a]/75 dark:border-white/20 dark:shadow-black/50
                "
                style={{
                  boxShadow: 'inset 1px 1px 0 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                
                {/* Cabeçalho da Lista */}
                <div className="flex justify-between items-center p-4 border-b rounded-t-2xl bg-white/40 border-white/50 dark:bg-white/5 dark:border-white/10 transition-colors">
                  <h3 className="font-bold text-slate-700 dark:text-blue-100 text-sm uppercase tracking-wide px-2">{list.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-1 rounded-md border 
                      bg-slate-100 text-slate-500 border-slate-200
                      dark:text-blue-300 dark:bg-black/40 dark:border-white/5
                    ">
                      {list.cards.length}
                    </span>
                    <button 
                      onClick={() => handleDeleteList(list.id)} 
                      className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>

                {/* Área dos Cartões */}
                <Droppable droppableId={list.id.toString()}>
                  {(provided, snapshot) => (
                    <div 
                      className={`
                        flex flex-col gap-3 p-3 overflow-y-auto flex-1 transition-colors
                        ${snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-500/10' : ''}
                      `}
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {list.cards.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                          {(provided, snapshot) => {
                            const style = {
                              ...provided.draggableProps.style,
                              transform: snapshot.isDragging 
                                ? `${provided.draggableProps.style.transform} rotate(3deg) scale(1.05)` 
                                : provided.draggableProps.style.transform,
                            };

                            // A CORREÇÃO ESTÁ AQUI: Classes explícitas
                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={style}
                                className={`
                                  group relative p-4 rounded-xl border transition-all duration-200 flex flex-col gap-3
                                  
                                  ${snapshot.isDragging 
                                    ? 'bg-blue-600 border-blue-400 shadow-xl z-50 text-white' 
                                    : 'shadow-sm hover:shadow-lg bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 dark:bg-[#1e293b] dark:border-white/10 dark:hover:border-blue-400/50 dark:hover:bg-[#253045]'
                                  }
                                `}
                                onClick={() => setActiveCard(card)}
                              >
                                {/* HEADER DO CARD */}
                                <div className="flex justify-between items-start gap-2">
                                  <span className={`
                                    text-sm font-medium leading-relaxed break-words 
                                    ${snapshot.isDragging 
                                      ? 'text-white' 
                                      : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                                    }
                                  `}>
                                    {card.title}
                                  </span>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }} 
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 rounded hover:bg-black/5 dark:hover:bg-black/20 transition-all"
                                  >
                                    <Icons.Trash />
                                  </button>
                                </div>

                                {/* FOOTER DO CARD */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 mt-1">
                                  
                                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(card.priority)}`}>
                                    {getPriorityLabel(card.priority)}
                                  </div>

                                  <div className="flex gap-3 text-slate-400 dark:text-slate-500">
                                    {card.description && (
                                      <span className="flex items-center gap-1 text-xs" title="Tem descrição">
                                        <Icons.Note />
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Input de Novo Cartão */}
                <div className="p-3 pt-0 pb-4">
                  <form onSubmit={(e) => handleAddCard(e, list.id)} className="relative group">
                    <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <input
                      type="text"
                      placeholder="+ Nova tarefa"
                      className="
                        relative w-full p-3 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 border
                        
                        bg-white/50 border-slate-200 text-slate-700 placeholder-slate-400 
                        hover:bg-white hover:border-blue-300 focus:ring-blue-400
                        
                        dark:bg-[#0a0e17]/60 dark:border-white/10 dark:text-white dark:placeholder-slate-500
                        dark:hover:bg-[#0a0e17]/80 dark:hover:border-blue-500/50 dark:focus:ring-blue-500/50
                      "
                      value={newCardTitles[list.id] || ''}
                      onChange={(e) => setNewCardTitles({ ...newCardTitles, [list.id]: e.target.value })}
                    />
                  </form>
                </div>

              </div>
            ))}
          </DragDropContext>

          {/* Coluna de Adicionar Lista */}
          <div className="min-w-[320px] w-[320px]">
            <form onSubmit={handleAddList} className="
              backdrop-blur-sm border border-dashed rounded-2xl p-4 transition-all cursor-pointer group shadow-lg
              
              bg-white/40 border-slate-300 hover:bg-white/60 hover:border-blue-400
              dark:bg-[#1e293b]/60 dark:border-white/20 dark:hover:bg-[#1e293b]/80 dark:hover:border-blue-500/50
            ">
              <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <span className="text-lg font-bold">+</span>
                <span className="text-sm font-medium">Adicionar outra lista</span>
              </div>
              <input 
                type="text" 
                placeholder="Título da lista..." 
                className="w-full bg-transparent border-none focus:outline-none text-sm font-medium
                  text-slate-700 placeholder-slate-400
                  dark:text-white dark:placeholder-slate-600
                "
                value={newListTitle} 
                onChange={(e) => setNewListTitle(e.target.value)} 
              />
            </form>
          </div>

        </div>
      </div>

      {activeCard && (
        <CardModal 
          card={activeCard} 
          onClose={() => setActiveCard(null)} 
          onSave={handleUpdateCard} 
        />
      )}
    </div>
  );
}

export default Board;