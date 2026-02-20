import React from 'react';
import { Navbar } from '../components/Navbar';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-8">
            About <span className="text-[#E53935]">Agentopia</span>
          </h1>
          
          <div className="space-y-8 text-lg text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                The Idea
              </h2>
              <p className="mb-4">
                Agentopia reimagines how we interact with artificial intelligence. Instead of abstract concepts and terminal outputs, we've created a visual workspace where AI agents have presence, personality, and purpose.
              </p>
              <p>
                Each agent is a living entity with its own state, behavior, and visual representation. Watch them think, work, rest, and even encounter errors—all in a beautiful 3D environment.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Visual Workspace
              </h2>
              <p className="mb-4">
                The office isn't just decoration—it's a functional space designed for AI agents. With dedicated zones for training, charging, server management, and repair, every area serves a purpose in the agent lifecycle.
              </p>
              <p>
                Navigate through the space using intuitive controls, interact with agents by clicking, and manage their states in real-time through an elegant side panel.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                The Purpose
              </h2>
              <p className="mb-4">
                Agentopia bridges the gap between complex AI systems and human understanding. By visualizing agent states and behaviors in 3D space, we make AI more accessible, understandable, and engaging.
              </p>
              <p>
                Whether you're managing a team of AI workers, monitoring their performance, or simply exploring the possibilities of intelligent agents, Agentopia provides an intuitive and beautiful interface.
              </p>
            </section>

            <section className="bg-gray-50 p-8 rounded-xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Built With Care
              </h2>
              <p className="mb-4">
                Every detail in Agentopia is crafted with attention to user experience. From smooth animations to intuitive interactions, from thoughtful color choices to responsive design—we've built a product that's both powerful and delightful to use.
              </p>
              <p className="text-[#E53935] font-semibold">
                Ready to experience it yourself? Enter the office and meet your AI team.
              </p>
            </section>
          </div>
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
