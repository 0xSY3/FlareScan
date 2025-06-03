'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Zap,
  Shield,
  Database,
  Globe,
  Clock
} from 'lucide-react';

interface NetworkStatsProps {
  selectedNetwork: 'flare' | 'songbird';
  stats: {
    latestBlock: number;
    gasPrice: string;
    pendingTxns: number;
    totalSupply: string;
    validators: number;
    dataFeeds: number;
  };
}

const FlareNetworkStats: React.FC<NetworkStatsProps> = ({ selectedNetwork, stats }) => {
  const networkData = {
    flare: {
      totalSupply: '15,000,000,000',
      marketCap: '$345M',
      stakingRatio: '83.3%',
      avgBlockTime: '1.9s',
      tps: '4,500',
      uptime: '99.98%'
    },
    songbird: {
      totalSupply: '15,000,000,000',
      marketCap: '$180M',
      stakingRatio: '56.7%',
      avgBlockTime: '1.9s',
      tps: '4,500',
      uptime: '99.95%'
    }
  };

  const currentNetwork = networkData[selectedNetwork];

  const statItems = [
    {
      icon: Activity,
      label: 'Latest Block',
      value: stats.latestBlock.toLocaleString(),
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Zap,
      label: 'Gas Price',
      value: `${parseFloat(stats.gasPrice).toFixed(6)} FLR`,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Clock,
      label: 'Avg Block Time',
      value: currentNetwork.avgBlockTime,
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      label: 'TPS',
      value: currentNetwork.tps,
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Database,
      label: 'Data Feeds',
      value: stats.dataFeeds.toString(),
      color: 'from-flare-500 to-coral-500'
    },
    {
      icon: Users,
      label: 'Validators',
      value: stats.validators.toString(),
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Shield,
      label: 'Staking Ratio',
      value: currentNetwork.stakingRatio,
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Globe,
      label: 'Uptime',
      value: currentNetwork.uptime,
      color: 'from-green-500 to-teal-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-4 shadow-lg hover:shadow-flare transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 bg-gradient-to-r ${item.color} rounded-xl shadow-lg`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900 mb-1">
              {item.value}
            </div>
            <div className="text-sm text-gray-600">
              {item.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default FlareNetworkStats;