import React, { useState } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import Data from './Data.jsx';

export default function BoardTrello() {
  const [columns, setColumns] = useState({
    todo: {
      id: 'todo',
      title: 'Recebidos',
      color: 'green',
      tasks: [
        { id: '1', content: 'Combo 1', description: '1x X-Salada e 1x Batata Frita' },
        { id: '2', content: 'Combo 2', description: '1x X-Burguer e 1x Batata Frita' }
      ]
    },
    inProgress: {
      id: 'inProgress',
      title: 'Em preparação',
      color: 'blue',
      tasks: [
        { id: '3', content: 'Combo 3', description: '1x X-Tudo e 1x Batata Frita' }
      ]
    },
    done: {
      id: 'done',
      title: 'Concluído',
      color: 'red',
      tasks: [
        { id: '4', content: 'Combo 4', description: '1x X-Bacon e 1x Batata Frita' }
      ]
    }
  });

  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [newTaskColumn, setNewTaskColumn] = useState(null);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const getColorClasses = (color) => {
    const colors = {
      green: {
        border: 'border-green-500',
        bg: 'bg-green-50',
        badge: 'bg-green-500',
        hover: 'hover:border-green-600',
        button: 'bg-green-500 hover:bg-green-600'
      },
      blue: {
        border: 'border-blue-500',
        bg: 'bg-blue-50',
        badge: 'bg-blue-500',
        hover: 'hover:border-blue-600',
        button: 'bg-blue-500 hover:bg-blue-600'
      },
      red: {
        border: 'border-red-500',
        bg: 'bg-red-50',
        badge: 'bg-red-500',
        hover: 'hover:border-red-600',
        button: 'bg-red-500 hover:bg-red-600'
      }
    };
    return colors[color];
  };

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
      
      newColumns[draggedFrom] = {
        ...newColumns[draggedFrom],
        tasks: newColumns[draggedFrom].tasks.filter(t => t.id !== draggedTask.id)
      };
      
      newColumns[targetColumnId] = {
        ...newColumns[targetColumnId],
        tasks: [...newColumns[targetColumnId].tasks, draggedTask]
      };
      
      return newColumns;
    });

    setDraggedTask(null);
    setDraggedFrom(null);
  };
  
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-8">
          Painel de pedidos - Basilios <Data />
        </h1>
        
        <div className="flex gap-6 overflow-x-auto pb-4">
          {Object.values(columns).map(column => {
            const colorClasses = getColorClasses(column.color);
            
            return (
              <div
                key={column.id}
                className={`flex-shrink-0 w-80 ${colorClasses.bg} rounded-lg p-4 border-2 ${colorClasses.border}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-black flex items-center gap-2">
                    {column.title}
                    <span className={`text-xs ${colorClasses.badge} text-white px-2 py-1 rounded-full`}>
                      {column.tasks.length}
                    </span>
                  </h2>
                </div>
                <div className="space-y-3 min-h-[400px]">
                  {column.tasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task, column.id)}
                      className={`bg-white p-3 rounded-lg border-2 border-gray-200 cursor-move ${colorClasses.hover} hover:shadow-md transition-all group`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-start gap-2 flex-1">
                          <GripVertical className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-900 text-sm font-semibold">{task.content}</p>
                        </div>
                      </div>
                      {task.description && (
                        <p className="text-gray-600 text-xs ml-6 leading-relaxed">{task.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}