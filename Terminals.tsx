import React, { useState } from 'react';
import { Terminal } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { cn } from '../../utils/cn';

export const SystemControlTerminal = () => {
  const [cmd, setCmd] = useState('');
  const [history, setHistory] = useState<string[]>(['SSH connection established...', 'Ready for input.']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmd) return;
    setHistory([...history, `> ${cmd}`, `EXEC: Command '${cmd}' processed.`]);
    setCmd('');
  };

  return (
    <Card className="border-white/[0.04] bg-slate-900/60 font-mono">
      <SectionHeader title="14. SYSTEM_KERNEL_CONSOLE" icon={Terminal} colorClass="text-slate-500" />
      <div className="h-[120px] overflow-y-auto mb-2 space-y-1 text-xs scrollbar-hide">
        {history.map((line, i) => (
          <div key={i} className={cn(line.startsWith('>') ? "text-blue-400" : "text-slate-500")}>
            {line}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-white/[0.04] pt-2">
        <span className="text-blue-500 text-xs font-bold">$</span>
        <input 
          type="text" 
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          placeholder="admin@nexus: ~"
          className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-slate-800"
        />
      </form>
    </Card>
  );
};
