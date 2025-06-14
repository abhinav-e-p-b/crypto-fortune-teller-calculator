
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border/50 rounded-full px-3 py-2">
      {/* Light mode indicator dot */}
      <div className={`w-2 h-2 rounded-full transition-colors duration-200 ${
        theme === 'light' ? 'bg-red-500' : 'bg-gray-400'
      }`} />
      
      {/* Custom styled switch */}
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={toggleTheme}
        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 border-0 h-6 w-11"
      />
      
      {/* Dark mode indicator dot */}
      <div className={`w-2 h-2 rounded-full transition-colors duration-200 ${
        theme === 'dark' ? 'bg-green-500' : 'bg-gray-400'
      }`} />
    </div>
  );
};

export default ThemeToggle;
