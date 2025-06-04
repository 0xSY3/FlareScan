'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Globe,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2,
  Link,
  ArrowRight,
  Bitcoin,
  DollarSign,
  Info
} from 'lucide-react';
import { FDCService, ExternalChain } from '../lib/flare/fdc';
import { useChat } from 'ai/react';

interface UniversalCrossChainSearchProps {
  onSearchComplete?: (txHash: string, chain: string) => void;
}

const UniversalCrossChainSearch: React.FC<UniversalCrossChainSearchProps> = ({ 
  onSearchComplete 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [detectedChain, setDetectedChain] = useState<ExternalChain | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  // Chain detection patterns
  const chainPatterns = {
    [ExternalChain.BTC]: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
    [ExternalChain.ETH]: /^0x[a-fA-F0-9]{64}$/,
    [ExternalChain.XRP]: /^[0-9A-F]{64}$/,
    [ExternalChain.DOGE]: /^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/
  };

  const detectChain = (input: string): ExternalChain | null => {
    // Try to detect by transaction hash pattern
    for (const [chain, pattern] of Object.entries(chainPatterns)) {
      if (pattern.test(input)) {
        return chain as ExternalChain;
      }
    }
    
    // If no pattern matches, check if it looks like a Bitcoin tx (64 hex chars)
    if (/^[a-fA-F0-9]{64}$/.test(input) && !input.startsWith('0x')) {
      return ExternalChain.BTC;
    }
    
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length > 20) {
      const detected = detectChain(value);
      setDetectedChain(detected);
    } else {
      setDetectedChain(null);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !detectedChain) return;
    
    setIsDetecting(true);
    setSearchResult(null);
    
    try {
      // Here you would integrate with your AI analysis
      // For now, we'll show the detected chain
      const result = {
        chain: detectedChain,
        txHash: searchQuery,
        message: `Detected ${detectedChain} transaction. Click analyze to get AI-powered insights.`
      };
      
      setSearchResult(result);
      
      if (onSearchComplete) {
        onSearchComplete(searchQuery, detectedChain);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResult({
        error: 'Failed to analyze transaction'
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const chainInfo = {
    [ExternalChain.BTC]: { name: 'Bitcoin', icon: Bitcoin, color: 'from-orange-500 to-yellow-500' },
    [ExternalChain.ETH]: { name: 'Ethereum', icon: DollarSign, color: 'from-blue-500 to-indigo-500' },
    [ExternalChain.XRP]: { name: 'XRP Ledger', icon: DollarSign, color: 'from-gray-600 to-gray-800' },
    [ExternalChain.DOGE]: { name: 'Dogecoin', icon: DollarSign, color: 'from-yellow-400 to-yellow-600' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-3xl p-8 shadow-lg"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl mb-4">
          <Globe className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Universal Cross-Chain Search</h2>
        <p className="text-lg text-gray-600">
          Paste any blockchain transaction hash - we'll detect the chain and analyze it with AI
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Search Input */}
        <div className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Paste any transaction hash from Bitcoin, Ethereum, XRP, or Dogecoin..."
            className="w-full pl-14 pr-40 py-5 bg-white border-2 border-purple-200 rounde xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all text-lg"
/>
<Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-purple-400" />
{detectedChain && (
        <div className="absolute right-36 top-1/2 transform -translate-y-1/2">
          <div className={`flex items-center gap-2 px-3 py-1 bg-gradient-to-r ${
            chainInfo[detectedChain].color
          } text-white rounded-lg text-sm font-medium`}>
            <CheckCircle className="w-4 h-4" />
            {chainInfo[detectedChain].name}
          </div>
        </div>
      )}
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSearch}
        disabled={isDetecting || !searchQuery.trim() || !detectedChain}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isDetecting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Analyze
          </>
        )}
      </motion.button>
    </div>

    {/* Chain Detection Helper */}
    {!detectedChain && searchQuery.length > 10 && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3"
      >
        <AlertCircle className="w-5 h-5 text-yellow-600" />
        <p className="text-sm text-yellow-800">
          Unable to detect blockchain. Make sure you're pasting a valid transaction hash.
        </p>
      </motion.div>
    )}

    {/* Search Result */}
    {searchResult && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-purple-100"
      >
        {searchResult.error ? (
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <p>{searchResult.error}</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Transaction Detected</h3>
              <div className={`flex items-center gap-2 px-3 py-1 bg-gradient-to-r ${
                chainInfo[searchResult.chain].color
              } text-white rounded-lg`}>
                <Link className="w-4 h-4" />
                {chainInfo[searchResult.chain].name}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Transaction Hash</p>
              <p className="font-mono text-sm text-gray-900 break-all">{searchResult.txHash}</p>
            </div>
            
            <p className="text-gray-700 mb-4">{searchResult.message}</p>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              Get AI Analysis
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </motion.div>
    )}

    {/* Supported Chains */}
    <div className="mt-8 text-center">
      <p className="text-sm text-gray-600 mb-4">Supported Blockchains</p>
      <div className="flex justify-center gap-4">
        {Object.entries(chainInfo).map(([chain, info]) => {
          const Icon = info.icon;
          return (
            <div
              key={chain}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg"
            >
              <div className={`p-1.5 bg-gradient-to-r ${info.color} rounded`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{info.name}</span>
            </div>
          );
        })}
      </div>
    </div>

    {/* How it Works */}
    <details className="mt-8">
      <summary className="cursor-pointer text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2">
        <Info className="w-4 h-4" />
        How Universal Search Works
      </summary>
      <div className="mt-4 bg-purple-50 rounded-lg p-4 space-y-3">
        <div>
          <h4 className="font-medium text-purple-900 mb-1">1. Automatic Chain Detection</h4>
          <p className="text-sm text-purple-700">
            Our AI analyzes the transaction hash format to automatically detect which blockchain it belongs to.
          </p>
        </div>
        <div>
          <h4 className="font-medium text-purple-900 mb-1">2. Cross-Chain Data Retrieval</h4>
          <p className="text-sm text-purple-700">
            Using Flare's Data Connector (FDC), we fetch verified transaction data from the detected blockchain.
          </p>
        </div>
        <div>
          <h4 className="font-medium text-purple-900 mb-1">3. AI-Powered Analysis</h4>
          <p className="text-sm text-purple-700">
            Our AI analyzes the transaction, identifies patterns, and provides insights about transfers, contracts, and risks.
          </p>
        </div>
      </div>
    </details>
  </div>
</motion.div>
);
};
export default UniversalCrossChainSearch;