import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CommandPalette from './CommandPalette';
import FloatingAIAssistant from './FloatingAIAssistant';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  // Keyboard shortcut: Ctrl/Cmd+K to open command palette
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close sidebar on large screens by default for initial state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Animated mesh background */}
      <div className="bg-mesh" />

      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main area */}
      <div
        className="transition-all duration-300 relative"
        style={{ marginLeft: sidebarCollapsed ? 0 : '260px' }}
      >
        <Topbar
          onMenuToggle={() => setSidebarCollapsed(c => !c)}
          onCommandOpen={() => setCommandOpen(true)}
        />
        <main className="p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />

      {/* Floating AI Assistant */}
      <FloatingAIAssistant />
    </div>
  );
}
