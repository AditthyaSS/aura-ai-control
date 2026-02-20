import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const WelcomeOverlay = ({ isVisible, onEnter }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
          style={{ pointerEvents: 'all' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl mx-4 text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-[#E53935]">Agentopia</span>
            </h1>
            
            <div className="space-y-4 text-lg text-gray-700 mb-8 leading-relaxed">
              <p className="font-semibold text-xl text-gray-900">
                You are now the CEO of this AI office.
              </p>
              <p>
                Your agents are ready to work.
              </p>
              <p>
                Manage them, guide them, and build your intelligent workforce.
              </p>
            </div>
            
            <button
              onClick={onEnter}
              className="bg-[#E53935] hover:bg-[#FF4D4F] text-white px-10 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Enter Office
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
