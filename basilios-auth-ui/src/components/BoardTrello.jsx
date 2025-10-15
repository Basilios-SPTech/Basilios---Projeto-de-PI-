import React, { useState } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import Data from './Data.jsx';

export default function BoardTrello() {
  const [columns, setColumns] = useState({
    todo: {
      id: 'todo',
      title: 'A Fazer',
      tasks: [
        { id: '1', content: 'Combo 2' },
        { id: '2', content: 'Beirute do Rômulo' }
      ]
    },
    inProgress: {
      id: 'inProgress',
      title: 'Preparando',
      tasks: [
        { id: '3', content: 'X-Salada' }
      ]
    },
    done: {
      id: 'done',
      title: 'Em trânsito',
      tasks: [
        { id: '4', content: 'X-Burger' }
      ]
    }
  });

  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [newTaskColumn, setNewTaskColumn] = useState(null);
  const [newTaskContent, setNewTaskContent] = useState('');

  const handleDragStart = (e, task, columnId) => {
    setDraggedTask(task);
    setDraggedFrom(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();
    
    if (!draggedTask || !draggedFrom) return;

    if (draggedFrom === targetColumnId) {
      setDraggedTask(null);
      setDraggedFrom(null);
      return;
    }

    setColumns(prev => {
      const newColumns = { ...prev };
      
      // Remove da coluna origem
      newColumns[draggedFrom] = {
        ...newColumns[draggedFrom],
        tasks: newColumns[draggedFrom].tasks.filter(t => t.id !== draggedTask.id)
      };
      
      // Adiciona na coluna destino
      newColumns[targetColumnId] = {
        ...newColumns[targetColumnId],
        tasks: [...newColumns[targetColumnId].tasks, draggedTask]
      };
      
      return newColumns;
    });

    setDraggedTask(null);
    setDraggedFrom(null);
  };

  const handleAddTask = (columnId) => {
    if (!newTaskContent.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      content: newTaskContent
    };

    setColumns(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        tasks: [...prev[columnId].tasks, newTask]
      }
    }));

    setNewTaskContent('');
    setNewTaskColumn(null);
  };

  const handleDeleteTask = (columnId, taskId) => {
    setColumns(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        tasks: prev[columnId].tasks.filter(t => t.id !== taskId)
      }
    }));
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-8">
          Basilios Board - <Data />
        </h1>
        
        <div className="flex gap-6 overflow-x-auto pb-4">
          {Object.values(columns).map(column => (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-black flex items-center gap-2">
                  {column.title}
                  <span className="text-xs bg-black text-white px-2 py-1 rounded-full">
                    {column.tasks.length}
                  </span>
                </h2>
                <button
                  onClick={() => setNewTaskColumn(column.id)}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                >
                  <Plus className="w-5 h-5 text-black" />
                </button>
              </div>

              {newTaskColumn === column.id && (
                <div className="mb-4 p-3 bg-white rounded-lg border-2 border-gray-300">
                  <input
                    type="text"
                    value={newTaskContent}
                    onChange={(e) => setNewTaskContent(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask(column.id)}
                    placeholder="Digite a tarefa..."
                    className="w-full bg-gray-50 text-black px-3 py-2 rounded mb-2 border border-gray-300 focus:outline-none focus:border-black"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddTask(column.id)}
                      className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded text-sm transition-colors"
                    >
                      Adicionar
                    </button>
                    <button
                      onClick={() => {
                        setNewTaskColumn(null);
                        setNewTaskContent('');
                      }}
                      className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-black rounded text-sm transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 min-h-[400px]">
                {column.tasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, column.id)}
                    className="bg-white p-3 rounded-lg border-2 border-gray-200 cursor-move hover:border-black hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <GripVertical className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-900 text-sm">{task.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(column.id, task.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}