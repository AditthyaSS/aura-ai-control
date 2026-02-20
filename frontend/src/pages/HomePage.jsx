import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Smart Agents',
      description: 'Intelligent AI agents with distinct personalities and behaviors',
      icon: '🤖'
    },
    {
      title: 'Real-Time Interaction',
      description: 'Click, hover, and interact with agents in real-time',
      icon: '⚡'
    },
    {
      title: 'State-Based Behavior',
      description: 'Agents adapt their animations based on current state',
      icon: '🎭'
    },
    {
      title: 'Visual Workspace',
      description: 'Beautiful 3D office environment with specialized zones',
      icon: '🏢'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-gray-900 mb-8 tracking-tight leading-none">
            Welcome to <span className="text-[#E53935]">Agentopia</span>
          </h1>
          <p className="text-2xl sm:text-3xl text-gray-600 mb-12 font-light max-w-4xl mx-auto leading-relaxed">
            Where AI Agents Live and Work
          </p>
          <button
            onClick={() => navigate('/app')}
            className="bg-[#E53935] hover:bg-[#FF4D4F] text-white px-10 py-5 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Enter Office
          </button>
        </div>
      </section>

      {/* Feature Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Why Agentopia?
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Experience a new way to visualize and manage AI agents
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Step Into Agentopia
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Experience intelligent agents in a beautiful 3D workspace
          </p>
          <button
            onClick={() => navigate('/app')}
            className="bg-[#E53935] hover:bg-[#FF4D4F] text-white px-10 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Enter Office
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-600">
          <p>Agentopia - Where AI Agents Live and Work © 2025</p>
        </div>
      </footer>
    </div>
  );
};
