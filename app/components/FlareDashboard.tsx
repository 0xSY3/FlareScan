'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity,
  ArrowUp,
  ArrowDown,
  Zap,
  Shield,
  Globe,
  Database,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Cpu,
  Network,
  Clock,
  Star
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

interface FlareDashboardProps {
  selectedNetwork: 'flare' | 'songbird';
  networkStats: {
    latestBlock: number;
    gasPrice: string;
    pendingTxns: number;
    totalSupply: string;
    validators: number;
    dataFeeds: number;
  };
}

const FlareDashboard: React.FC<FlareDashboardProps> = ({ selectedNetwork, networkStats }) => {
  const [priceData, setPriceData] = useState({
    current: selectedNetwork === 'flare' ? 0.023 : 0.012,
    change24h: selectedNetwork === 'flare' ? 5.67 : -2.34,
    volume24h: selectedNetwork === 'flare' ? 12500000 : 3200000,
    marketCap: selectedNetwork === 'flare' ? 345000000 : 180000000
  });

  const [stakingData, setStakingData] = useState({
    totalStaked: selectedNetwork === 'flare' ? 12500000000 : 8500000000,
    stakingRatio: selectedNetwork === 'flare' ? 83.3 : 56.7,
    validators: networkStats.validators,
    rewards: selectedNetwork === 'flare' ? 4.2 : 5.8
  });

  const [ecosystemData, setEcosystemData] = useState({
    dapps: selectedNetwork === 'flare' ? 127 : 45,
    developers: selectedNetwork === 'flare' ? 1250 : 890,
    transactions24h: selectedNetwork === 'flare' ? 45000 : 23000,
    tvl: selectedNetwork === 'flare' ? 125000000 : 45000000
  });

  // Mock chart data
  const priceChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: `${selectedNetwork === 'flare' ? 'FLR' : 'SGB'} Price`,
        data: selectedNetwork === 'flare' ? [0.018, 0.021, 0.019, 0.025, 0.022, 0.023] : [0.009, 0.011, 0.010, 0.013, 0.012, 0.012],
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const stakingDistributionData = {
    labels: ['Community Stakers', 'Validators', 'Foundation', 'Ecosystem'],
    datasets: [
      {
        data: [65, 20, 10, 5],
        backgroundColor: [
          'rgba(236, 72, 153, 0.8)',
          'rgba(244, 114, 182, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgb(236, 72, 153)',
          'rgb(244, 114, 182)',
          'rgb(251, 191, 36)',
          'rgb(156, 163, 175)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const networkActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Transactions',
        data: [12000, 19000, 15000, 25000, 22000, 18000, 16000],
        backgroundColor: 'rgba(236, 72, 153, 0.6)',
        borderColor: 'rgb(236, 72, 153)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-flare-600 to-coral-600 bg-clip-text text-transparent mb-4">
          {selectedNetwork === 'flare' ? 'Flare' : 'Songbird'} Dashboard
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Real-time analytics and insights for the {selectedNetwork === 'flare' ? 'Flare' : 'Songbird'} network
        </p>
      </motion.div>

      {/* Key Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-6 shadow-lg hover:shadow-flare transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              priceData.change24h >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {priceData.change24h >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {Math.abs(priceData.change24h)}%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ${priceData.current.toFixed(4)}
          </div>
          <div className="text-sm text-gray-600">
            {selectedNetwork === 'flare' ? 'FLR' : 'SGB'} Price
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-6 shadow-lg hover:shadow-flare transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-flare-500 to-coral-500 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ${(priceData.marketCap / 1000000).toFixed(1)}M
          </div>
          <div className="text-sm text-gray-600">Market Cap</div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-6 shadow-lg hover:shadow-flare transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stakingData.stakingRatio}%
          </div>
          <div className="text-sm text-gray-600">Staking Ratio</div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-6 shadow-lg hover:shadow-flare transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {ecosystemData.transactions24h.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">24h Transactions</div>
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Price Chart */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-flare-500 to-coral-500 rounded-xl">
              <LineChart className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Price History</h3>
          </div>
          <div className="h-64">
            <Line data={priceChartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Staking Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-flare-500 to-coral-500 rounded-xl">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Staking Distribution</h3>
          </div>
          <div className="h-64">
            <Doughnut data={stakingDistributionData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom' as const,
                },
              },
            }} />
          </div>
        </motion.div>
      </div>

      {/* Network Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-flare-500 to-coral-500 rounded-xl">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Network Activity (7 Days)</h3>
        </div>
        <div className="h-64">
          <Bar data={networkActivityData} options={chartOptions} />
        </div>
      </motion.div>

      {/* Ecosystem Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-6 shadow-lg hover:shadow-flare transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-flare-500 to-coral-500 rounded-xl">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{ecosystemData.dapps}</div>
              <div className="text-sm text-gray-600">Active dApps</div>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">+12 this month</div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-6 shadow-lg hover:shadow-flare transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-flare-500 to-coral-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{ecosystemData.developers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Developers</div>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">+89 this month</div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-6 shadow-lg hover:shadow-flare transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-flare-500 to-coral-500 rounded-xl">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{networkStats.dataFeeds}</div>
              <div className="text-sm text-gray-600">Data Feeds</div>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">Real-time</div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-6 shadow-lg hover:shadow-flare transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-flare-500 to-coral-500 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">${(ecosystemData.tvl / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-gray-600">Total Value Locked</div>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">+15.2% this week</div>
        </div>
      </motion.div>

      {/* Network Performance Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-flare-500 to-coral-500 rounded-xl">
            <Target className="w-5 h-5 text-white" />
          </div>
          Network Performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
            <div className="text-sm text-gray-600 mb-1">Uptime</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '99.9%'}}></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">1.9s</div>
            <div className="text-sm text-gray-600 mb-1">Avg Block Time</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stakingData.rewards}%</div>
            <div className="text-sm text-gray-600 mb-1">Staking APY</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{width: '70%'}}></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-flare-500 to-coral-500 rounded-2xl p-8 text-white"
      >
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">Explore Flare Ecosystem</h3>
          <p className="text-white/90">Discover the power of data-driven blockchain infrastructure</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-white/20 backdrop-blur rounded-xl border border-white/30 hover:bg-white/30 transition-all"
          >
            <Globe className="w-6 h-6 mb-2 mx-auto" />
            <div className="font-medium">FAssets Bridge</div>
            <div className="text-sm text-white/80">Bring BTC, LTC to Flare</div>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-white/20 backdrop-blur rounded-xl border border-white/30 hover:bg-white/30 transition-all"
          >
            <Database className="w-6 h-6 mb-2 mx-auto" />
            <div className="font-medium">FTSO Data</div>
            <div className="text-sm text-white/80">Access price oracles</div>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-white/20 backdrop-blur rounded-xl border border-white/30 hover:bg-white/30 transition-all"
          >
            <Shield className="w-6 h-6 mb-2 mx-auto" />
            <div className="font-medium">Delegate & Earn</div>
            <div className="text-sm text-white/80">Stake your tokens</div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default FlareDashboard;