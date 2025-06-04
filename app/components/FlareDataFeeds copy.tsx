'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Search,
  Filter,
  RefreshCw,
  Database,
  Zap,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  Activity,
  BarChart3,
  DollarSign,
  Layers
} from 'lucide-react';

interface DataFeed {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdate: string;
  decimals: number;
  status: 'active' | 'inactive';
  category: 'crypto' | 'forex' | 'commodities' | 'stocks';
  providers: number;
}

interface FlareDataFeedsProps {
  selectedNetwork: 'flare' | 'songbird';
}

const FlareDataFeeds: React.FC<FlareDataFeedsProps> = ({ selectedNetwork }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataFeeds, setDataFeeds] = useState<DataFeed[]>([]);

  // Mock data feeds
  const mockDataFeeds: DataFeed[] = [
    {
      id: '0x01464c522f55534400000000000000000000000000',
      symbol: 'FLR/USD',
      name: 'Flare',
      price: 0.0183,
      change24h: 5.67,
      volume24h: 12500000,
      lastUpdate: new Date().toISOString(),
      decimals: 5,
      status: 'active',
      category: 'crypto',
      providers: 12
    },
    {
      id: '0x01425443555344000000000000000000000000000000',
      symbol: 'BTC/USD',
      name: 'Bitcoin',
      price: 105513,
      change24h: -2.34,
      volume24h: 28500000000,
      lastUpdate: new Date().toISOString(),
      decimals: 5,
      status: 'active',
      category: 'crypto',
      providers: 15
    },
    {
      id: '0x014554485553440000000000000000000000000000',
      symbol: 'ETH/USD',
      name: 'Ethereum',
      price: 2629.38,
      change24h: 3.45,
      volume24h: 15200000000,
      lastUpdate: new Date().toISOString(),
      decimals: 5,
      status: 'active',
      category: 'crypto',
      providers: 14
    },
    {
      id: '0x015852505553440000000000000000000000000000',
      symbol: 'XRP/USD',
      name: 'XRP',
      price: 2.24,
      change24h: 1.23,
      volume24h: 2100000000,
      lastUpdate: new Date().toISOString(),
      decimals: 5,
      status: 'active',
      category: 'crypto',
      providers: 13
    },
    {
      id: '0x014c54435553440000000000000000000000000000',
      symbol: 'LTC/USD',
      name: 'Litecoin',
      price: 90.45,
      change24h: -1.45,
      volume24h: 890000000,
      lastUpdate: new Date().toISOString(),
      decimals: 5,
      status: 'active',
      category: 'crypto',
      providers: 11
    },
    {
      id: '0x014144415553440000000000000000000000000000',
      symbol: 'ADA/USD',
      name: 'Cardano',
      price: 0.6823,
      change24h: 4.56,
      volume24h: 1250000000,
      lastUpdate: new Date().toISOString(),
      decimals: 5,
      status: 'active',
      category: 'crypto',
      providers: 10
    },
    {
      id: '0x01414c474f555344000000000000000000000000',
      symbol: 'ALGO/USD',
      name: 'Algorand',
      price: 0.1876,
      change24h: 2.34,
      volume24h: 156000000,
      lastUpdate: new Date().toISOString(),
      decimals: 5,
      status: 'active',
      category: 'crypto',
      providers: 9
    },
    {
      id: '0x01444f47455553440000000000000000000000000',
      symbol: 'DOGE/USD',
      name: 'Dogecoin',
      price: 0.1923,
      change24h: -0.87,
      volume24h: 845000000,
      lastUpdate: new Date().toISOString(),
      decimals: 5,
      status: 'active',
      category: 'crypto',
      providers: 8
    },
    {
      id: '0x0146494c555344000000000000000000000000000',
      symbol: 'FIL/USD',
      name: 'Filecoin',
      price: 5.67,
      change24h: 6.78,
      volume24h: 234000000,
      lastUpdate: new Date().toISOString(),
      decimals: 5,
      status: 'active',
      category: 'crypto',
      providers: 7
    },
    {
      id: '0x015553445455534400000000000000000000000000',
      symbol: 'USDT/USD',
      name: 'Tether',
      price: 0.9998,
      change24h: 0.01,
      volume24h: 45000000000,
      lastUpdate: new Date().toISOString(),
      decimals: 5,
      status: 'active',
      category: 'crypto',
      providers: 16
    }
  ];

  useEffect(() => {
    setDataFeeds(mockDataFeeds);
  }, [selectedNetwork]);

  const categories = [
    { id: 'all', name: 'All Feeds', icon: Database },
    { id: 'crypto', name: 'Cryptocurrency', icon: DollarSign },
    { id: 'forex', name: 'Forex', icon: Globe },
    { id: 'commodities', name: 'Commodities', icon: BarChart3 },
    { id: 'stocks', name: 'Stocks', icon: TrendingUp }
  ];

  const filteredFeeds = dataFeeds.filter(feed => {
    const matchesSearch = feed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feed.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || feed.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const formatPrice = (price: number, decimals: number = 4) => {
    if (price < 0.01) {
      return price.toFixed(6);
    }
    return price.toFixed(decimals);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `$${(volume / 1000000000).toFixed(2)}B`;
    } else if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(2)}K`;
    }
    return `$${volume.toFixed(2)}`;
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
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
          FTSO Data Feeds
        </h2>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          Real-time, decentralized price feeds powered by Flare Time Series Oracle (FTSO). 
          Access reliable data for DeFi, gaming, and enterprise applications.
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        <div className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-6 text-center shadow-lg hover:shadow-flare transition-all">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-flare-500 to-coral-500 rounded-xl mb-4">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{dataFeeds.length}</div>
          <div className="text-sm text-gray-600">Active Feeds</div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-6 text-center shadow-lg hover:shadow-flare transition-all">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mb-4">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">100%</div>
          <div className="text-sm text-gray-600">Uptime</div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-6 text-center shadow-lg hover:shadow-flare transition-all">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl mb-4">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">3.5s</div>
          <div className="text-sm text-gray-600">Update Frequency</div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-6 text-center shadow-lg hover:shadow-flare transition-all">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mb-4">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">12</div>
          <div className="text-sm text-gray-600">Avg Providers</div>
        </div>
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-6 shadow-lg"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search feeds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/60 border border-flare-200 rounded-xl focus:outline-none focus:border-flare-500 focus:ring-2 focus:ring-flare-200 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-flare-500 to-coral-500 text-white shadow-md'
                      : 'bg-white/60 text-gray-600 hover:text-flare-600 hover:bg-flare-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.name}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-3 bg-gradient-to-r from-flare-500 to-coral-500 text-white rounded-xl shadow-lg hover:shadow-flare transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* Data Feeds Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-4"
      >
        <AnimatePresence>
          {filteredFeeds.map((feed, index) => (
            <motion.div
              key={feed.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              className="bg-white/80 backdrop-blur-lg border border-flare-200 rounded-2xl p-6 shadow-lg hover:shadow-flare transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                {/* Left side - Token info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-flare-500 to-coral-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {feed.symbol.split('/')[0].charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{feed.symbol}</h3>
                      <div className={`w-2 h-2 rounded-full ${
                        feed.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    <p className="text-sm text-gray-600">{feed.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs bg-flare-100 text-flare-700 px-2 py-1 rounded-full">
                        {feed.providers} providers
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(feed.lastUpdate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side - Price and stats */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    ${formatPrice(feed.price)}
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium mb-2 ${
                    feed.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {feed.change24h >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {Math.abs(feed.change24h).toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Vol: {formatVolume(feed.volume24h)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Feed ID: {feed.id.slice(0, 10)}...
                  </div>
                </div>
              </div>

              {/* Price chart placeholder */}
              <div className="mt-4 pt-4 border-t border-flare-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>24h Price Movement</span>
                  <span>{feed.decimals} decimals</span>
                </div>
                <div className="mt-2 h-12 bg-gradient-to-r from-flare-100 to-coral-100 rounded-lg flex items-end overflow-hidden">
                  {/* Mock price chart bars */}
                  {Array.from({ length: 24 }, (_, i) => (
                    <div
                      key={i}
                      className={`flex-1 mx-px rounded-t ${
                        Math.random() > 0.5 ? 'bg-green-400' : 'bg-red-400'
                      }`}
                      style={{
                        height: `${Math.random() * 100}%`,
                        minHeight: '4px'
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredFeeds.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feeds found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </motion.div>

      {/* Integration Guide */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-flare-500 to-coral-500 rounded-2xl p-8 text-white"
      >
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">Integrate FTSO Data Feeds</h3>
          <p className="text-white/90">Add reliable price data to your dApp with just a few lines of code</p>
        </div>

        <div className="bg-black/20 backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-white/60 text-sm ml-2">Solidity Example</span>
          </div>
          <pre className="text-green-300 text-sm overflow-x-auto">
{`import "@flarenetwork/flare-periphery-contracts/flare/ContractRegistry.sol";
import "@flarenetwork/flare-periphery-contracts/flare/FtsoV2Interface.sol";

contract PriceConsumer {
    FtsoV2Interface internal ftsoV2;
    
    function getFlrUsdPrice() external returns 
    (uint256 value, int8 decimals, uint64 timestamp) {
        ftsoV2 = ContractRegistry.getFtsoV2();
        return ftsoV2.getFeedById(0x01464c522f55534400000000000000000000000000);
    }
}`}
          </pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-white/20 backdrop-blur rounded-xl border border-white/30 hover:bg-white/30 transition-all"
          >
            <Info className="w-6 h-6 mb-2 mx-auto" />
            <div className="font-medium">Documentation</div>
            <div className="text-sm text-white/80">Integration guides</div>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-white/20 backdrop-blur rounded-xl border border-white/30 hover:bg-white/30 transition-all"
          >
            <Database className="w-6 h-6 mb-2 mx-auto" />
            <div className="font-medium">API Reference</div>
            <div className="text-sm text-white/80">Technical specs</div>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-white/20 backdrop-blur rounded-xl border border-white/30 hover:bg-white/30 transition-all"
          >
            <Star className="w-6 h-6 mb-2 mx-auto" />
            <div className="font-medium">Examples</div>
            <div className="text-sm text-white/80">Sample projects</div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default FlareDataFeeds;