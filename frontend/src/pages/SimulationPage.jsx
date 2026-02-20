import React, { useState } from 'react';
import { ThreeScene } from '../components/ThreeScene';
import { SidePanel } from '../components/ui/SidePanel';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import useGameStore from '../store/gameStore';
import { WelcomeOverlay } from '../components/WelcomeOverlay';

export const SimulationPage = () => {
  const addAgent = useGameStore((state) => state.addAgent);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleHireAgent = () => {
    addAgent();
  };

  const handleEnterOffice = () => {
    setShowWelcome(false);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <ThreeScene />
      <SidePanel />
      
      {/* Hire Agent Button */}
      <div style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 100 }}>
        <Button 
          onClick={handleHireAgent}
          className="shadow-lg hover:shadow-xl transition-shadow"
          data-testid="hire-agent-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Hire Agent
        </Button>
      </div>
      
      {/* Welcome Overlay */}
      <WelcomeOverlay isVisible={showWelcome} onEnter={handleEnterOffice} />
    </div>
  );
};
