'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Coins, 
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { FAssetsService, FAssetInfo, AgentInfo } from '../lib/flare/fassets';
import { ethers } from 'ethers';
import { Doughnut, Bar } from 'react-chartjs-2';

interface FAssetsAnalyticsProps {
  chainId: number;
  provider: ethers.JsonRpcProvider;
}

const FAssetsAnalytics: React.FC<FAssetsAnalyticsProps> = ({ chainId, provider }) => {
  const [fassets, setFassets] = useState<FAssetInfo[]>([]);
  const [tvlData, setTvlData] = useState<{ totalUSD: number; breakdown: Record<string, number> }>({ 
    totalUSD: 0, 
    breakdown: {} 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFAsset, setSelectedFAsset] = useState<string | null>(null);
  const [topAgents, setTopAgents] = useState<AgentInfo[]>([]);

  useEffect(() => {
    loadFAssetsData();
  }, [chainId, provider]);

  const loadFAssetsData = async () => {
    try {
      setIsLoading(true);
      const service = new FAssetsService(provider, chainId);
      
      // Get all FAssets
      const fassetsData = await service.getAllFAssets();
      setFassets(fassetsData);
      
      // Get TVL data
      const tvl = await service.getTotalValueLocked();
      setTvlData(tvl);
      
      // For demo, create some mock agent data
      setTopAgents([
        {
          agentVault: '0x1234...5678',
          collateral: '150000',
          minted: '100000',
          collateralRatio: 150,
          isHealthy: true,
          status: 'active'
        },
        {
          agentVault: '0x2345...6789',
          collateral: '80000',
          minted: '50000',
          collateralRatio: 160,
          isHealthy: true,
          status: 'active'
        },
        {
          agentVault: '0x3456...7890',
          collateral: '45000',
          minted: '35000',
          collateralRatio: 128,
          isHealthy: false,
          status: 'liquidating'
        }
      ]);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading FAssets data:', error);
      setIsLoading(false);
    }
  };

  const getHealthColor = (ratio: number): string => {
    if (ratio >= 200) return 'text-green-600';
    if (ratio >= 150) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (ratio: number) => {
    if (ratio >= 200) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (ratio >= 150) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  // Chart data
  const tvlChartData = {
    labels: Object.keys(tvlData.breakdown),
    datasets: [
      {
        data: Object.values(tvlData.breakdown),
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',  // Bitcoin - gold
          'rgba(156, 163, 175, 0.8)', // XRP - gray
          'rgba(107, 114, 128, 0.8)', // LTC - dark gray
          'rgba(251, 146, 60, 0.8)',  // DOGE - orange
        ],
        borderColor: [
          'rgb(251, 191, 36)',
          'rgb(156, 163, 175)',
          'rgb(107, 114, 128)',
          'rgb(251, 146, 60)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const collateralRatioData = {
    labels: fassets.map(f => f.symbol),
    datasets: [
      {
        label: 'Collateral Ratio %',
        data: fassets.map(f => f.collateralRatio),
        backgroundColor: 'rgba(236, 72, 153, 0.6)',
        borderColor: 'rgb(236, 72, 153)',
        borderWidth: 2,
      },
      {
        label: 'Minimum Required %',
        data: fassets.map(() => 150), // Minimum 150% collateral
        backgroundColor: 'rgba(239, 68, 68, 0.3)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        type: 'line' as const,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ${(tvlData.totalUSD / 1000000).toFixed(2)}M
          </div>
          <div className="text-sm text-gray-600">Total Value Locked</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Coins className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {fassets.length}
          </div>
          <div className="text-sm text-gray-600">Active FAssets</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {topAgents.length}
          </div>
          <div className="text-sm text-gray-600">Active Agents</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {fassets.length > 0 ? 
              (fassets.reduce((sum, f) => sum + f.collateralRatio, 0) / fassets.length).toFixed(0) : 0}%
          </div>
          <div className="text-sm text-gray-600">Avg Collateral Ratio</div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TVL Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-pink-600" />
            TVL Breakdown by FAsset
          </h3>
          <div className="h-64">
            <Doughnut data={tvlChartData} options={{
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

        {/* Collateral Ratios */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-pink-600" />
            Collateral Ratios
          </h3>
          <div className="h-64">
            <Bar data={collateralRatioData} options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 250,
                },
              },
            }} />
          </div>
        </motion.div>
      </div>

      {/* FAssets List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl overflow-hidden shadow-lg"
      >
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Coins className="w-5 h-5 text-pink-600" />
            FAsset Details
          </h3>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              <span className="text-gray-600">Loading FAssets data...</span>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {fassets.map((fasset) => (
              <motion.div
                key={fasset.symbol}
                whileHover={{ backgroundColor: 'rgba(236, 72, 153, 0.05)' }}
                className="px-6 py-4 transition-colors cursor-pointer"
                onClick={() => setSelectedFAsset(fasset.symbol)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">{fasset.symbol.charAt(1)}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{fasset.symbol}</div>
                      <div className="text-sm text-gray-600">
                        Backed by {fasset.nativeAsset}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {parseFloat(fasset.totalSupply).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Supply</div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-semibold flex items-center gap-2 ${
                        getHealthColor(fasset.collateralRatio)
                      }`}>
                        {getHealthIcon(fasset.collateralRatio)}
                        {fasset.collateralRatio}%
                      </div>
                      <div className="text-sm text-gray-600">Collateral</div>
                    </div>
                    
                    <ArrowUpRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Top Agents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl overflow-hidden shadow-lg"
      >
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Top FAsset Agents
          </h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {topAgents.map((agent, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    agent.isHealthy ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {agent.isHealthy ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> :
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    }
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{agent.agentVault}</div>
                    <div className="text-sm text-gray-600">
                      Status: <span className={`font-medium ${
                        agent.status === 'active' ? 'text-green-600' :
                        agent.status === 'liquidating' ? 'text-red-600' : 'text-gray-600'
                      }`}>{agent.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      ${parseFloat(agent.collateral).toLocaleString()}
                    </div>
                    <div className="text-gray-600">Collateral</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      ${parseFloat(agent.minted).toLocaleString()}
                    </div>
                    <div className="text-gray-600">Minted</div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-semibold ${getHealthColor(agent.collateralRatio)}`}>
                      {agent.collateralRatio}%
                    </div>
                    <div className="text-gray-600">Ratio</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* How FAssets Work */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white"
      >
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Info className="w-8 h-8" />
          How FAssets Work
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/20 backdrop-blur rounded-xl p-6">
            <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">1</span>
            </div>
            <h4 className="font-semibold mb-2">Deposit Native Asset</h4>
            <p className="text-sm text-white/90">
              Users deposit BTC, XRP, LTC, or DOGE to agent-controlled addresses on the native chain.
            </p>
          </div>
          
          <div className="bg-white/20 backdrop-blur rounded-xl p-6">
            <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">2</span>
            </div>
            <h4 className="font-semibold mb-2">Mint FAssets</h4>
            <p className="text-sm text-white/90">
              After verification via FDC, equivalent FAssets are minted on Flare, backed by agent collateral.
            </p>
          </div>
          
          <div className="bg-white/20 backdrop-blur rounded-xl p-6">
            <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">3</span>
            </div>
            <h4 className="font-semibold mb-2">Use in DeFi</h4>
            <p className="text-sm text-white/90">
              FAssets can be used in DeFi protocols on Flare, bringing non-smart contract assets to DeFi.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FAssetsAnalytics;