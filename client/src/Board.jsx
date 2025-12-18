import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CardModal from './CardModal';

// Ícones SVG para substituir os emojis (Visual Profissional)
const Icons = {
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  ),
  XMark: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  ),
  Note: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M5.625 1.5H9a.375.375 0 0 1 .375.375v1.875c0 1.036.84 1.875 1.875 1.875H12.975a.375.375 0 0 1 .375.375v16.5c0 1.035-.84 1.875-1.875 1.875H5.625A1.875 1.875 0 0 1 3.75 22.5V3.375c0-1.036.84-1.875 1.875-1.875ZM12.75 12a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V18a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V12Z" clipRule="evenodd" />
      <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
    </svg>
  )
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

  if (!board) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando...</div>;

  return (
    // Fundo Gradiente (Mesmo da Home)
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-400 to-indigo-500 relative flex flex-col font-sans overflow-hidden">
      
      {/* Blobs de Fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse pointer-events-none"></div>

      {/* CABEÇALHO */}
      <div className="flex items-center gap-6 px-8 py-6 z-10 border-b border-white/20 backdrop-blur-sm">
        <Link 
          to="/" 
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold transition flex items-center gap-2 border border-white/20 shadow-sm"
        >
          <span>←</span> Voltar
        </Link>
        <div>
           <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">{board.title}</h1>
           <p className="text-blue-50 text-sm font-medium opacity-80">Gerenciamento de Tarefas</p>
        </div>
      </div>

      {/* ÁREA DE SCROLL HORIZONTAL */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 z-10">
        
        {/* Container Flex que centraliza se tiver pouco conteúdo, ou expande para a esquerda */}
        <div className="flex h-full items-start gap-6 min-w-fit mx-auto">
          
          <DragDropContext onDragEnd={onDragEnd}>
            {lists.map((list) => (
              // COLUNA (LISTA) - Glassmorphism
              <div key={list.id} className="min-w-[300px] w-[300px] bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-xl flex flex-col gap-4 max-h-full group/list">
                
                {/* Cabeçalho da Lista */}
                <div className="flex justify-between items-center px-1">
                  <h3 className="font-bold text-indigo-900 text-lg">{list.title}</h3>
                  <button 
                    onClick={() => handleDeleteList(list.id)} 
                    className="text-indigo-800/40 hover:text-red-500 opacity-0 group-hover/list:opacity-100 transition-all p-1 rounded-full hover:bg-white/50"
                    title="Excluir Lista"
                  >
                    <Icons.Trash />
                  </button>
                </div>

                {/* Área dos Cartões */}
                <Droppable droppableId={list.id.toString()}>
                  {(provided) => (
                    <div 
                      className="flex flex-col gap-3 min-h-[50px] overflow-y-auto pr-2 custom-scrollbar"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {list.cards.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              // CARTÃO - Ajuste de Contraste e Prioridade
                              className="bg-white/80 hover:bg-white p-4 rounded-xl shadow-sm hover:shadow-md text-indigo-900 text-sm group/card relative transition-all border border-white/60"
                              onClick={() => setActiveCard(card)}
                            >
                              {/* Indicador Visual de Prioridade (Barra lateral colorida) */}
                              <div 
                                className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full ${
                                  card.priority === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 
                                  card.priority === 'medium' ? 'bg-yellow-500' : 
                                  'bg-blue-300' // Low ou Padrão
                                }`} 
                              />

                              <div className="flex justify-between items-start pl-3">
                                <span className="font-semibold leading-snug break-words">{card.title}</span>
                                {card.description && (
                                  <span className="text-indigo-400" title="Possui descrição">
                                    <Icons.Note />
                                  </span>
                                )}
                              </div>
                              
                              {/* Botão de Deletar Cartão (Grande e Oculto) */}
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }} 
                                className="absolute -top-2 -right-2 bg-red-100 text-red-500 p-1.5 rounded-full shadow-md opacity-0 group-hover/card:opacity-100 hover:bg-red-500 hover:text-white transition-all transform scale-75 group-hover/card:scale-100"
                                title="Remover Cartão"
                              >
                                <Icons.XMark />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Input de Novo Cartão */}
                <form onSubmit={(e) => handleAddCard(e, list.id)} className="mt-auto pt-2">
                  <input
                    type="text"
                    placeholder="+ Adicionar cartão..."
                    className="w-full bg-white/50 border border-white/40 p-3 rounded-xl text-sm text-indigo-900 placeholder-indigo-800/40 focus:outline-none focus:bg-white/90 focus:ring-2 focus:ring-indigo-400 transition"
                    value={newCardTitles[list.id] || ''}
                    onChange={(e) => setNewCardTitles({ ...newCardTitles, [list.id]: e.target.value })}
                  />
                </form>
              </div>
            ))}
          </DragDropContext>

          {/* Coluna de Adicionar Nova Lista */}
          <div className="min-w-[300px] w-[300px]">
            <form onSubmit={handleAddList} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 hover:bg-white/30 transition">
              <input 
                type="text" 
                placeholder="+ Adicionar nova lista" 
                className="w-full bg-transparent border-none text-white placeholder-white/80 font-bold focus:outline-none focus:placeholder-white/50"
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