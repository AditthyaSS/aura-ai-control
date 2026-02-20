import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AGENT_MESSAGES = {
  Sleepy: [
    "Just 5 more minutes...",
    "I'm still waking up...",
    "Dreaming of code...",
    "Zzz... coffee please...",
    "So sleepy..."
  ],
  Joy: [
    "Let's build something!",
    "I'm ready!",
    "This is fun!",
    "Yay! New project!",
    "I love coding!"
  ],
  Glitch: [
    "Something feels off...",
    "Wait... what?",
    "Error... maybe?",
    "Did I do that?",
    "Oops! Bug detected..."
  ],
  default: [
    "Hello there!",
    "Ready to work!",
    "Nice office, right?",
    "Let's get started!",
    "What's the task?"
  ]
};

export const AgentHoverMessage = ({ agentName, position, isHovered }) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isHovered) {
      const messages = AGENT_MESSAGES[agentName] || AGENT_MESSAGES.default;
      setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);

      intervalRef.current = setInterval(() => {
        setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
      }, 3000);
    } else {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isHovered, agentName]);

  if (!isHovered || !currentMessage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y - 80}px`,
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 1000
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '500',
            color: '#333',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            whiteSpace: 'nowrap',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          {currentMessage}
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid rgba(255, 255, 255, 0.95)'
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
