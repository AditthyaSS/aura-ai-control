import React from 'react';
import { Navbar } from '../components/Navbar';

export const FeaturesPage = () => {
  const agentStates = [
    {
      name: 'Sleeping',
      icon: '😴',
      description: 'Slow, gentle floating. Agents rest and conserve energy.',
      color: 'bg-blue-100'
    },
    {
      name: 'Active',
      icon: '✨',
      description: 'Normal operation. Agents move within their workspace.',
      color: 'bg-green-100'
    },
    {
      name: 'Thinking',
      icon: '💭',
      description: 'Deep processing. Agents show thought clouds and head tilts.',
      color: 'bg-yellow-100'
    },
    {
      name: 'Working',
      icon: '⚡',
      description: 'High activity. Fast movement with glowing energy effects.',
      color: 'bg-orange-100'
    },
    {
      name: 'Error',
      icon: '⚠️',
      description: 'System malfunction. Agents shake and flicker.',
      color: 'bg-red-100'
    }
  ];

  const features = [
    {
      title: 'Interactive 3D Office',
      description: 'Explore a fully realized 3D workspace with multiple functional zones including server rooms, charging stations, training areas, and repair facilities.',
      icon: '🏢'
    },
    {
      title: 'Agent Management',
      description: 'Hire new agents to expand your team or fire underperforming ones. Each agent has a unique identity and can be customized.',
      icon: '👥'
    },
    {
      title: 'Real-Time Animations',
      description: 'Watch agents respond to state changes with smooth animations, visual effects, and expressive behaviors.',
      icon: '🎬'
    },
    {
      title: 'State Control',
      description: 'Manually set agent states or let them operate autonomously. Full control over your AI workforce.',
      icon: '🎮'
    },
    {
      title: 'API Integration',
      description: 'Connect agents to external APIs with custom API keys. Each agent can have its own credentials.',
      icon: '🔑'
    },
    {
      title: 'Visual Feedback',
      description: 'Immediate visual feedback for all interactions. Hover over agents to see messages, click to open detailed panels.',
      icon: '💬'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">
            Features
          </h1>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Discover what makes Agentopia a unique and powerful platform for managing intelligent agents
          </p>

          {/* Agent States Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Agent States
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {agentStates.map((state, index) => (
                <div
                  key={index}
                  className={`${state.color} p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200`}
                >
                  <div className="text-5xl mb-3 text-center">{state.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                    {state.name}
                  </h3>
                  <p className="text-gray-700 text-sm text-center">
                    {state.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Core Features Section */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Core Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white border-2 border-gray-200 p-6 rounded-xl hover:border-[#E53935] transition-colors duration-200"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Specialized Zones */}
          <section className="mt-20 bg-gray-50 p-12 rounded-2xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Specialized Zones
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  🖥️ Server Room
                </h3>
                <p className="text-gray-600">
                  Infrastructure hub with glowing server racks and indicator lights. Monitor system health at a glance.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  🔋 Charging Station
                </h3>
                <p className="text-gray-600">
                  Energy-themed zone with glowing charging pads where agents recharge and rest.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  📚 Training Zone
                </h3>
                <p className="text-gray-600">
                  Educational space with training screens and holographic data visualizations.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  🔧 Repair/Debug Zone
                </h3>
                <p className="text-gray-600">
                  Industrial maintenance area with diagnostic tools and warning lights for agent repairs.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="py-8 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-600">
          <p>Agentopia - Where AI Agents Live and Work © 2025</p>
        </div>
      </footer>
    </div>
  );
};
