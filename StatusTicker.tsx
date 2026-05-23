import React from 'react';
import { motion } from 'motion/react';

export const StatusTicker = () => (
  <div className="bg-blue-600 h-6 flex items-center overflow-hidden whitespace-nowrap border-b border-blue-400 relative z-50">
    <motion.div 
      animate={{ x: [0, -1000] }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className="flex items-center gap-12"
    >
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <span className="text-xs font-semibold text-white uppercase tracking-tighter">NEXUS_LINK_v4_ACTIVE</span>
          <span className="text-xs text-blue-200 font-mono">LATENCY: 12ms</span>
          <span className="text-xs text-blue-200 font-mono">THROUGHPUT: 1.2GB/S</span>
          <span className="text-xs text-blue-200 font-mono">CLUSTER: ALPHA_EAST_1</span>
        </div>
      ))}
    </motion.div>
  </div>
);
