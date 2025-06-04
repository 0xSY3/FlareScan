'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Clock,
  Database,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  DollarSign,
  Zap
} from 'lucide-react';
import { FTSOService, FTSOWebSocketService, PriceFeedData, FTSO_FEED_IDS } from '../lib/flare/ftso';
import { ethers } from 'ethers';

interface FTSOPriceOracleProps {
  chainId: number;
  provider: ethers.JsonRpcProvider;
  selectedFeeds?: string[];
  showChart?: boolean;
  onPriceUpdate?: (feedId: string, price: PriceFeedData) => void;
}

// Add mock price data function
const getMockPriceData = (symbol: string): PriceFeedData => {
  const mockPrices: Record<string, number> = {
    'FLR/USD': 0.0183,
    'BTC/USD': 105513,
    'ETH/USD': 2629.38,
    'XRP/USD': 2.24,
    'LTC/USD': 90.45,
    'ADA/USD': 0.6823,
    'ALGO/USD': 0.1876,
    'DOGE/USD': 0.1923
  };

  const price = mockPrices[symbol] || 0;
  
  return {
    feedId: FTSO_FEED_IDS[symbol as keyof typeof FTSO_FEED_IDS] || '',
    symbol,
    value: price,
    decimals: price < 1 ? 4 : 2,
    timestamp: Math.floor(Date.now() / 1000),
    formattedValue: price.toFixed(price < 1 ? 4 : 2)
  };
};

const FTSOPriceOracle: React.FC<FTSOPriceOracleProps> = ({
  chainId,
  provider,
  selectedFeeds = ['FLR/USD', 'BTC/USD', 'ETH/USD', 'XRP/USD'],
  showChart = true,
  onPriceUpdate
}) => {
  const [prices, setPrices] = useState<Record<string, PriceFeedData>>({});
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [ftsoService, setFtsoService] = useState<FTSOService | null>(null);
  const [wsService, setWsService] = useState<FTSOWebSocketService | null>(null);

  useEffect(() => {
    // Initialize FTSO service
    const service = new FTSOService(provider, chainId);
    setFtsoService(service);

    // Initialize WebSocket service
    const ws = new FTSOWebSocketService();
    setWsService(ws);
    
    // Connect WebSocket
    ws.connect(chainId);

    // Initial price fetch
    fetchPrices(service);

    // Set up polling for price updates (backup for WebSocket)
    const interval = setInterval(() => {
      fetchPrices(service);
    }, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(interval);
      ws.disconnect();
    };
  }, [chainId, provider]);

  useEffect(() => {
    if (!wsService) return;

    // Subscribe to WebSocket updates
    selectedFeeds.forEach(feedSymbol => {
      const feedId = FTSO_FEED_IDS[feedSymbol as keyof typeof FTSO_FEED_IDS];
      if (feedId) {
        wsService.subscribe(feedId, (data: PriceFeedData) => {
          handlePriceUpdate(feedSymbol, data);
        });
      }
    });

    return () => {
      // Unsubscribe when component unmounts or feeds change
      selectedFeeds.forEach(feedSymbol => {
        const feedId = FTSO_FEED_IDS[feedSymbol as keyof typeof FTSO_FEED_IDS];
        if (feedId && wsService) {
          wsService.unsubscribe(feedId, handlePriceUpdate);
        }
      });
    };
  }, [wsService, selectedFeeds]);

  // Update fetchPrices function
  const fetchPrices = async (service: FTSOService) => {
    try {
      setIsLoading(true);
      
      // Use mock data for demo
      const mockPriceData = selectedFeeds.map(symbol => getMockPriceData(symbol));
      
      const newPrices: Record<string, PriceFeedData> = {};
      mockPriceData.forEach(data => {
        newPrices[data.symbol] = data;
        updatePriceHistory(data.symbol, data.value);
      });

      setPrices(newPrices);
      setLastUpdate(new Date());
      setConnectionStatus('connected');
      setIsLoading(false);
      
      // Simulate price updates
      setTimeout(() => {
        const updatedPrices = { ...newPrices };
        Object.keys(updatedPrices).forEach(symbol => {
          const currentPrice = updatedPrices[symbol].value;
          const change = (Math.random() - 0.5) * 0.01; // ±0.5% change
          const newPrice = currentPrice * (1 + change);
          updatedPrices[symbol] = {
            ...updatedPrices[symbol],
            value: newPrice,
            formattedValue: newPrice.toFixed(newPrice < 1 ? 4 : 2),
            timestamp: Math.floor(Date.now() / 1000)
          };
          updatePriceHistory(symbol, newPrice);
        });
        setPrices(updatedPrices);
        setLastUpdate(new Date());
      }, 5000);
      
    } catch (error) {
      console.error('Error in fetchPrices:', error);
      setConnectionStatus('error');
      setIsLoading(false);
    }
  };

  const handlePriceUpdate = (symbol: string, data: PriceFeedData) => {
    setPrices(prev => ({
      ...prev,
      [symbol]: data
    }));
    
    updatePriceHistory(symbol, data.value);
    setLastUpdate(new Date());
    
    if (onPriceUpdate) {
      onPriceUpdate(data.feedId, data);
    }
  };

  const updatePriceHistory = (symbol: string, price: number) => {
    setPriceHistory(prev => {
      const history = prev[symbol] || [];
      const updatedHistory = [...history, price].slice(-20); // Keep last 20 prices
      return { ...prev, [symbol]: updatedHistory };
    });
  };

  const calculatePriceChange = (symbol: string): number => {
    const history = priceHistory[symbol] || [];
    if (history.length < 2) return 0;
    
    const oldPrice = history[0];
    const currentPrice = history[history.length - 1];
    return ((currentPrice - oldPrice) / oldPrice) * 100;
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const refreshPrices = () => {
    if (ftsoService) {
      fetchPrices(ftsoService);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">FTSO Price Oracle</h3>
            <p className="text-sm text-gray-600">Real-time decentralized price feeds</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            } animate-pulse`}></div>
            <span className="text-sm text-gray-600">
              {connectionStatus === 'connected' ? 'Live' : 
               connectionStatus === 'error' ? 'Error' : 'Connecting...'}
            </span>
          </div>
          
          <button
            onClick={refreshPrices}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Price Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {selectedFeeds.map((feedSymbol) => {
            const price = prices[feedSymbol];
            const change = calculatePriceChange(feedSymbol);
            const history = priceHistory[feedSymbol] || [];
            
            return (
              <motion.div
                key={feedSymbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{feedSymbol}</span>
                  {price && (
                    <div className={`flex items-center gap-1 text-sm ${
                      change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(change).toFixed(2)}%
                    </div>
                  )}
                </div>
                
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {price ? `$${price.formattedValue}` : 
                   isLoading ? <div className="h-8 bg-gray-200 rounded animate-pulse"></div> : 
                   '--'}
                </div>
                
                {showChart && history.length > 1 && (
                  <div className="h-12 flex items-end gap-px">
                    {history.map((value, index) => {
                      const height = ((value - Math.min(...history)) / 
                                     (Math.max(...history) - Math.min(...history))) * 100;
                      return (
                        <div
                          key={index}
                          className="flex-1 bg-gradient-to-t from-purple-500 to-indigo-500 rounded-t opacity-60 hover:opacity-100 transition-opacity"
                          style={{ height: `${height}%`, minHeight: '2px' }}
                        />
                      );
                    })}
                  </div>
                )}
                
                {price && (
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(price.timestamp)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      3.5s
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600 mb-1">Update Frequency</div>
            <div className="text-lg font-semibold text-gray-900">3.5s</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Data Providers</div>
            <div className="text-lg font-semibold text-gray-900">100+</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Last Update</div>
            <div className="text-lg font-semibold text-gray-900">
              {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Integration Code Example */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-purple-600 hover:text-purple-700 font-medium">
          Show Integration Code
        </summary>
        <div className="mt-4 bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto">
          <pre className="text-xs">
{`// Fetch price from FTSO
const ftsoV2 = await ethers.getContractAt(
  'IFtsoV2', 
  '0x3d1E88F3b8fc32DB6d71C82F2e9c44DeBe01d796'
);

const flrUsdFeed = '0x01464c522f55534400000000000000000000000000';
const { value, decimals, timestamp } = await ftsoV2.getFeedById(flrUsdFeed);

const price = decimals < 0 
  ? value * 10 ** Math.abs(decimals)
  : value / 10 ** decimals;

console.log('FLR/USD Price:', price);`}
          </pre>
        </div>
      </details>
    </div>
  );
};

export default FTSOPriceOracle;