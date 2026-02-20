import { create } from 'zustand';

const useGameStore = create((set) => ({
  agents: [
    {
      id: '1',
      name: 'Sleepy',
      type: 'sleepy',
      state: 'sleeping',
      expression: 'sleepy',
      position: [-3, 0, 0],
      color: '#60A5FA',
      apiKey: ''
    },
    {
      id: '2',
      name: 'Joy',
      type: 'joy',
      state: 'active',
      expression: 'happy',
      position: [0, 0, -3],
      color: '#4ADE80',
      apiKey: ''
    },
    {
      id: '3',
      name: 'Glitch',
      type: 'glitch',
      state: 'error',
      expression: 'glitch',
      position: [3, 0, 0],
      color: '#F87171',
      apiKey: ''
    }
  ],
  selectedAgent: null,
  
  selectAgent: (agentId) => set({ selectedAgent: agentId }),
  
  deselectAgent: () => set({ selectedAgent: null }),
  
  updateAgent: (agentId, updates) => set((state) => ({
    agents: state.agents.map(agent =>
      agent.id === agentId
        ? { ...agent, ...updates }
        : agent
    )
  })),
  
  updateAgentStatus: (agentId, newStatus) => set((state) => ({
    agents: state.agents.map(agent =>
      agent.id === agentId
        ? { ...agent, state: newStatus }
        : agent
    )
  })),
  
  addAgent: () => set((state) => {
    // Find next available position
    const occupiedPositions = state.agents.map(a => `${a.position[0]},${a.position[2]}`);
    const availablePositions = [
      [6, 0], [-6, 0], [0, 3], [3, 3], [-3, 3],
      [6, 3], [-6, 3], [0, -6], [3, -6], [-3, -6]
    ];
    
    let newPosition = [0, 0, 0];
    for (const pos of availablePositions) {
      if (!occupiedPositions.includes(`${pos[0]},${pos[1]}`)) {
        newPosition = [pos[0], 0, pos[1]];
        break;
      }
    }
    
    const newAgent = {
      id: `agent-${Date.now()}`,
      name: 'New Agent',
      type: 'new',
      state: 'active',
      expression: 'happy',
      position: newPosition,
      color: '#A78BFA',
      apiKey: ''
    };
    
    return { agents: [...state.agents, newAgent] };
  }),
  
  removeAgent: (agentId) => set((state) => ({
    agents: state.agents.filter(agent => agent.id !== agentId),
    selectedAgent: state.selectedAgent === agentId ? null : state.selectedAgent
  }))
}));

export default useGameStore;
