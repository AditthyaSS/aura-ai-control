import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import { StatusBadge } from './StatusBadge';
import { Button } from './button.jsx';
import { Input } from './input.jsx';

export const SidePanel = () => {
  const selectedAgent = useGameStore((state) => state.selectedAgent);
  const agents = useGameStore((state) => state.agents);
  const deselectAgent = useGameStore((state) => state.deselectAgent);
  const updateAgent = useGameStore((state) => state.updateAgent);
  const removeAgent = useGameStore((state) => state.removeAgent);

  const agent = agents.find((a) => a.id === selectedAgent);
  
  const [localName, setLocalName] = useState('');
  const [localApiKey, setLocalApiKey] = useState('');

  React.useEffect(() => {
    if (agent) {
      setLocalName(agent.name);
      setLocalApiKey(agent.apiKey || '');
    }
  }, [agent]);

  if (!agent) return null;

  const handleStatusChange = (newStatus) => {
    updateAgent(agent.id, { state: newStatus });
  };

  const handleNameChange = (e) => {
    setLocalName(e.target.value);
  };

  const handleNameBlur = () => {
    if (localName.trim()) {
      updateAgent(agent.id, { name: localName.trim() });
    } else {
      setLocalName(agent.name);
    }
  };

  const handleApiKeyChange = (e) => {
    setLocalApiKey(e.target.value);
  };

  const handleApiKeyBlur = () => {
    updateAgent(agent.id, { apiKey: localApiKey });
  };

  const handleFireAgent = () => {
    if (window.confirm(`Are you sure you want to fire ${agent.name}?`)) {
      removeAgent(agent.id);
    }
  };

  return (
    <AnimatePresence>
      {agent && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl rounded-l-3xl z-10 flex flex-col"
          data-testid="agent-side-panel"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Agent Details
              </h2>
              <button
                onClick={deselectAgent}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                data-testid="close-panel-button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <StatusBadge status={agent.state} />
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Agent Visual Indicator */}
              <div className="flex items-center justify-center py-4">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: agent.color }}
                >
                  <span className="text-4xl text-white font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {agent.name.charAt(0)}
                  </span>
                </div>
              </div>

              {/* Agent Name (Editable) */}
              <div>
                <label htmlFor="agent-name" className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                  Agent Name
                </label>
                <Input
                  id="agent-name"
                  value={localName}
                  onChange={handleNameChange}
                  onBlur={handleNameBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleNameBlur();
                      e.target.blur();
                    }
                  }}
                  className="w-full"
                  placeholder="Enter agent name"
                />
              </div>

              {/* Agent ID */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Agent ID
                </p>
                <p className="text-sm leading-relaxed font-mono text-gray-600 bg-gray-50 p-2 rounded">{agent.id}</p>
              </div>

              {/* Current State */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Current State
                </p>
                <p className="text-base leading-relaxed capitalize font-medium">{agent.state}</p>
              </div>

              {/* Expression */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Expression
                </p>
                <p className="text-base leading-relaxed capitalize">{agent.expression}</p>
              </div>

              {/* API Key Input */}
              <div>
                <label htmlFor="api-key" className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                  API Key
                </label>
                <Input
                  id="api-key"
                  type="password"
                  value={localApiKey}
                  onChange={handleApiKeyChange}
                  onBlur={handleApiKeyBlur}
                  className="w-full font-mono text-sm"
                  placeholder="Enter API key (optional)"
                />
              </div>

              {/* State Controls */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Change State
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleStatusChange('sleeping')}
                    variant={agent.state === 'sleeping' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    data-testid="status-button-sleeping"
                  >
                    <span className="mr-2">😴</span>
                    Sleeping
                  </Button>
                  <Button
                    onClick={() => handleStatusChange('active')}
                    variant={agent.state === 'active' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    data-testid="status-button-active"
                  >
                    <span className="mr-2">✨</span>
                    Active
                  </Button>
                  <Button
                    onClick={() => handleStatusChange('thinking')}
                    variant={agent.state === 'thinking' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    data-testid="status-button-thinking"
                  >
                    <span className="mr-2">💭</span>
                    Thinking
                  </Button>
                  <Button
                    onClick={() => handleStatusChange('working')}
                    variant={agent.state === 'working' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    data-testid="status-button-working"
                  >
                    <span className="mr-2">⚡</span>
                    Working
                  </Button>
                  <Button
                    onClick={() => handleStatusChange('error')}
                    variant={agent.state === 'error' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    data-testid="status-button-error"
                  >
                    <span className="mr-2">⚠️</span>
                    Error
                  </Button>
                </div>
              </div>

              {/* Fire Agent Button */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={handleFireAgent}
                  variant="destructive"
                  className="w-full justify-center"
                  data-testid="fire-agent-button"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Fire Agent
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
