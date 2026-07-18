"use client";

import React, { useState } from "react";
import { 
  Terminal, 
  Code2, 
  Cpu, 
  Database, 
  Globe, 
  Search, 
  Sparkles, 
  Plus, 
  ExternalLink, 
  Share2,
  Monitor,
  Layout,
  Layers,
  Container,
  Zap,
  CheckCircle2
} from "lucide-react";

const TECH_STACK_DATA = [
  {
    category: "Frontend",
    icon: Layout,
    tools: [
      { name: "React", description: "Modern UI library for component-based architecture", level: 90, color: "text-blue-500" },
      { name: "Next.js", description: "Server-side rendering and static site generation", level: 85, color: "text-slate-900" },
      { name: "Tailwind CSS", description: "Utility-first CSS framework for rapid styling", level: 95, color: "text-cyan-500" },
      { name: "TypeScript", description: "Type-safe JavaScript for scalable applications", level: 80, color: "text-blue-600" }
    ]
  },
  {
    category: "Backend & Infra",
    icon: Database,
    tools: [
      { name: "Node.js", description: "Event-driven JavaScript runtime for scalable backends", level: 85, color: "text-emerald-600" },
      { name: "PostgreSQL", description: "Advanced relational database for structured data", level: 75, color: "text-indigo-600" },
      { name: "Docker", description: "Containerization for consistent deployments", level: 65, color: "text-blue-400" },
      { name: "Go (Golang)", description: "High-performance systems language for microservices", level: 60, color: "text-cyan-600" }
    ]
  },
  {
    category: "AI & Data Science",
    icon: Sparkles,
    tools: [
      { name: "Python", description: "Primary language for ML and data automation", level: 88, color: "text-yellow-600" },
      { name: "PyTorch", description: "Deep learning framework for neural networks", level: 70, color: "text-orange-600" },
      { name: "LangChain", description: "LLM orchestration for AI-powered features", level: 65, color: "text-emerald-500" },
      { name: "NumPy / Pandas", description: "Data manipulation and scientific computing", level: 82, color: "text-indigo-500" }
    ]
  }
];

export function TechStackTab() {
  const [activeCategory, setActiveCategory] = useState(TECH_STACK_DATA[0].category);

  return (
    <div className="space-y-6">
      {/* Dynamic Hero */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl border border-slate-800">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs mb-4">
            <Terminal className="w-4 h-4" /> <span>student@resumate:~/skills $ ls --tech-stack</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Your Technical Blueprint</h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
            Map your technical expertise visually. We use this data to automatically rank your skills in the "Modern Tech" template and prioritize job matches.
          </p>
        </div>

        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Cpu className="w-64 h-64 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {TECH_STACK_DATA.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                activeCategory === cat.category
                  ? "bg-white border-indigo-600 shadow-lg text-indigo-600 ring-4 ring-indigo-50"
                  : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <cat.icon className="w-5 h-5" />
                <span className="text-sm font-bold">{cat.category}</span>
              </div>
              <Zap className={`w-3.5 h-3.5 ${activeCategory === cat.category ? "opacity-100" : "opacity-0"}`} />
            </button>
          ))}
          
          <button className="w-full flex items-center gap-3 p-4 rounded-2xl border border-dashed border-slate-300 text-slate-400 hover:bg-slate-50 transition-all text-sm font-bold mt-4">
            <Plus className="w-5 h-5" /> Add Category
          </button>
        </div>

        {/* Tools Display */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {TECH_STACK_DATA.find(c => c.category === activeCategory)?.tools.map((tool, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className={`text-base font-black ${tool.color}`}>{tool.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{tool.description}</p>
                    </div>
                    <div className="px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-600">
                      {tool.level}%
                    </div>
                  </div>
                  
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-current transition-all duration-1000 ${tool.color}`}
                      style={{ width: `${tool.level}%` }}
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors">Adjust Level</button>
                    <button className="text-[10px] font-bold text-slate-400 hover:text-rose-600 transition-colors">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center gap-3 text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                <p className="text-xs font-medium">
                  This stack is synced with your <span className="font-bold">Software Engineering Intern 2026</span> resume.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
