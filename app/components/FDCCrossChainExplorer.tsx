'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Globe,
  Link,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Shield,
  Loader2,
  ChevronRight,
  AlertCircle,
  Bitcoin,
  DollarSign
} from 'lucide-react';
import { FDCService, ExternalChain, CrossChainTransaction } from '../lib/flare/fdc';

interface FDCCrossChainExplorerProps {
  chainId: number;
}

const FDCCrossChainExplorer: React.FC<FDCCrossChainExplorerProps> = ({ chainId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState<ExternalChain>(ExternalChain.BTC);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<CrossChainTransaction | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<{
    isVerified: boolean;
    proof?: string;
    error?: string;
  } | null>(null);
  const [searchHistory, setSearchHistory] = useState<Array<{
    chain: ExternalChain;
    txHash: string;
    timestamp: Date;
  }>>([]);

  const chainConfig = {
    [ExternalChain.BTC]: {
      name: 'Bitcoin',
      icon: Bitcoin,
      color: 'from-orange-500 to-yellow-500',
      explorer: 'https://blockchair.com/bitcoin/transaction/'
    },
    [ExternalChain.ETH]: {
      name: 'Ethereum',
      icon: DollarSign,
      color: 'from-blue-500 to-indigo-500',
      explorer: 'https://etherscan.io/tx/'
    },
    [ExternalChain.XRP]: {
      name: 'XRP Ledger',
      icon: DollarSign,
      color: 'from-gray-600 to-gray-800',
      explorer: 'https://xrpscan.com/tx/'
    },
    [ExternalChain.DOGE]: {
      name: 'Dogecoin',
      icon: DollarSign,
      color: 'from-yellow-400 to-yellow-600',
      explorer: 'https://blockchair.com/dogecoin/transaction/'
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResult(null);
    setVerificationStatus(null);

    try {
      const fdcService = new FDCService(chainId);
      
      // Get cross-chain transaction details
      const txDetails = await fdcService.getCrossChainTransaction(selectedChain, searchQuery);
      
      if (txDetails) {
        setSearchResult(txDetails);
        
        // Verify the transaction
        const payment = await fdcService.verifyPayment(selectedChain, searchQuery);
        
        if (payment) {
          setVerificationStatus({
            isVerified: true,
            proof: 'Verified by Flare Data Connector'
          });
        } else {
          setVerificationStatus({
            isVerified: false,
            error: 'Could not verify transaction'
          });
        }
        
        // Add to search history
        setSearchHistory(prev => [
          { chain: selectedChain, txHash: searchQuery, timestamp: new Date() },
          ...prev.slice(0, 4)
        ]);
      } else {
        setVerificationStatus({
          isVerified: false,
          error: 'Transaction not found'
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setVerificationStatus({
        isVerified: false,
        error: 'Error searching transaction'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const ChainIcon = chainConfig[selectedChain].icon;

  return (
    <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
          <Globe className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Cross-Chain Explorer</h3>
          <p className="text-sm text-gray-600">Search any blockchain transaction with FDC</p>
        </div>
      </div>

      {/* Chain Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(chainConfig).map(([chain, config]) => {
          const Icon = config.icon;
          return (
            <motion.button
              key={chain}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedChain(chain as ExternalChain)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedChain === chain
                  ? `bg-gradient-to-r ${config.color} text-white border-transparent shadow-lg`
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${
                selectedChain === chain ? 'text-white' : 'text-gray-600'
              }`} />
              <div className={`font-medium ${
                selectedChain === chain ? 'text-white' : 'text-gray-900'
              }`}>
                {config.name}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={`Enter ${chainConfig[selectedChain].name} transaction hash...`}
          className="w-full pl-12 pr-32 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              Search
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </div>

      {/* Verification Status */}
      {verificationStatus && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            verificationStatus.isVerified
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {verificationStatus.isVerified ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Transaction Verified</div>
                <div className="text-sm text-green-700">{verificationStatus.proof}</div>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <div className="font-medium text-red-900">Verification Failed</div>
                <div className="text-sm text-red-700">{verificationStatus.error}</div>
              </div>
            </>
          )}
        </motion.div>
      )}


      {searchResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Transaction Details</h4>
            <a
              href={`${chainConfig[searchResult.chain].explorer}${searchResult.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              View on Explorer
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Transaction Hash</div>
              <div className="font-mono text-sm text-gray-900 break-all">
                {searchResult.txHash}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Status</div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  searchResult.status === 'confirmed' ? 'bg-green-500' :
                  searchResult.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium text-gray-900 capitalize">
                  {searchResult.status}
                </span>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">From</div>
              <div className="font-mono text-sm text-gray-900 break-all">
                {searchResult.from}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">To</div>
              <div className="font-mono text-sm text-gray-900 break-all">
                {searchResult.to}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Amount</div>
              <div className="font-semibold text-gray-900">
                {searchResult.amount} {searchResult.chain}
              </div>
            </div>

            <div>
          <div className="text-sm text-gray-600 mb-1">Timestamp</div>
          <div className="font-medium text-gray-900">
            {new Date(searchResult.timestamp * 1000).toLocaleString()}
          </div>
        </div>
      </div>

      {/* FDC Attestation Details */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <h5 className="font-semibold text-gray-900">FDC Attestation</h5>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-900">
            This transaction has been verified by the Flare Data Connector (FDC) protocol. 
            The attestation proves the transaction occurred on {chainConfig[searchResult.chain].name} 
            and can be used in smart contracts on Flare.
          </div>
        </div>
      </div>
    </motion.div>
  )}

  {/* Search History */}
  {searchHistory.length > 0 && (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Searches</h4>
      <div className="space-y-2">
        {searchHistory.map((item, index) => (
          <motion.button
            key={index}
            whileHover={{ x: 5 }}
            onClick={() => {
              setSelectedChain(item.chain);
              setSearchQuery(item.txHash);
              handleSearch();
            }}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-gradient-to-r ${chainConfig[item.chain].color} rounded-lg`}>
                <ChainIcon className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">{chainConfig[item.chain].name}</div>
                <div className="text-xs text-gray-600 font-mono">
                  {item.txHash.slice(0, 16)}...{item.txHash.slice(-8)}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {item.timestamp.toLocaleTimeString()}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )}

  {/* How it Works */}
  <details className="mt-6">
    <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium">
      How Cross-Chain Verification Works
    </summary>
    <div className="mt-4 space-y-4">
      <div className="bg-blue-50 rounded-lg p-4">
        <h5 className="font-semibold text-blue-900 mb-2">1. Query External Chain</h5>
        <p className="text-sm text-blue-800">
          FDC queries the external blockchain (Bitcoin, Ethereum, XRP, etc.) to retrieve transaction data.
        </p>
      </div>
      <div className="bg-blue-50 rounded-lg p-4">
        <h5 className="font-semibold text-blue-900 mb-2">2. Cryptographic Attestation</h5>
        <p className="text-sm text-blue-800">
          Multiple independent attestation providers verify the data and create cryptographic proofs.
        </p>
      </div>
      <div className="bg-blue-50 rounded-lg p-4">
        <h5 className="font-semibold text-blue-900 mb-2">3. On-Chain Verification</h5>
        <p className="text-sm text-blue-800">
          The proofs are submitted to Flare, where smart contracts can trustlessly use the external data.
        </p>
      </div>
    </div>
  </details>
</div>
);
};
export default FDCCrossChainExplorer;