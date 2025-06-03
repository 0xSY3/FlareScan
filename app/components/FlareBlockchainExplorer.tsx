'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useChat } from 'ai/react';
import { createPublicClient, http, formatEther, formatGwei, Chain, PublicClient, Block, Transaction, defineChain } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Loader2, 
  RefreshCw, 
  AlertTriangle, 
  ArrowRight, 
  Blocks,
  Activity,
  TrendingUp,
  Clock,
  Hash,
  ChevronRight,
  Maximize2,
  Database,
  Zap,
  Shield,
  Globe,
  BarChart3,
  Cpu,
  Network,
  Eye,
  Star,
  Sparkles,
  ArrowUpRight,
  DollarSign,
  Users,
  Layers,
  Target
} from 'lucide-react';
import { formatAssistantMessage } from '../utils/messageFormatter';
import { formatAddress } from '../utils/formatUtils';
import MermaidDiagram from './MermaidDiagram';
import DiagramModal from './DiagramModal';
import FlareNetworkStats from './FlareNetworkStats';
import FlareDashboard from './FlareDashboard';
import FlareDataFeeds from './FlareDataFeeds';

// Configure Flare Networks
const flareMainnet = defineChain({
  id: 14,
  name: 'Flare',
  nativeCurrency: {
    decimals: 18,
    name: 'Flare',
    symbol: 'FLR',
  },
  rpcUrls: {
    default: { http: ['https://flare-api.flare.network/ext/C/rpc'] },
    public: { http: ['https://flare-api.flare.network/ext/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Flare Explorer', url: 'https://flare-explorer.flare.network' },
  },
});

const songbird = defineChain({
  id: 19,
  name: 'Songbird',
  nativeCurrency: {
    decimals: 18,
    name: 'Songbird',
    symbol: 'SGB',
  },
  rpcUrls: {
    default: { http: ['https://songbird-api.flare.network/ext/C/rpc'] },
    public: { http: ['https://songbird-api.flare.network/ext/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Songbird Explorer', url: 'https://songbird-explorer.flare.network' },
  },
});

const coston2 = defineChain({
  id: 114,
  name: 'Coston2',
  nativeCurrency: {
    decimals: 18,
    name: 'Coston2 Flare',
    symbol: 'C2FLR',
  },
  rpcUrls: {
    default: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
    public: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Coston2 Explorer', url: 'https://coston2-explorer.flare.network' },
  },
});

// Create Viem Public Clients
const flareClient = createPublicClient({
  chain: flareMainnet,
  transport: http(),
});

const songbirdClient = createPublicClient({
  chain: songbird,
  transport: http(),
});

const coston2Client = createPublicClient({
  chain: coston2,
  transport: http(),
});

interface BlockWithTransactions extends Block {
  transactions: Transaction[];
}

interface EnhancedTransaction extends Transaction {
  effectiveGasPrice?: bigint;
  gasUsed?: bigint;
}

type NetworkType = 'flare' | 'songbird' | 'coston2';

const FlareBlockchainExplorer = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>('flare');
  const [latestBlocks, setLatestBlocks] = useState<BlockWithTransactions[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<EnhancedTransaction[]>([]);
  const [networkStats, setNetworkStats] = useState({
    latestBlock: 0,
    gasPrice: '0',
    pendingTxns: 0,
    totalSupply: '15000000000',
    validators: 100,
    dataFeeds: 18,
  });
  const [isLoadingChainData, setIsLoadingChainData] = useState(true);
  const [selectedTxHash, setSelectedTxHash] = useState<string | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [mermaidChart, setMermaidChart] = useState<string | null>(null);
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<'explorer' | 'dashboard' | 'data-feeds'>('explorer');

  const networks = {
    flare: { chain: flareMainnet, client: flareClient },
    songbird: { chain: songbird, client: songbirdClient },
    coston2: { chain: coston2, client: coston2Client }
  };

  const currentNetwork = networks[selectedNetwork];
  const currentChain = currentNetwork.chain;
  const currentClient = currentNetwork.client;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, input, handleInputChange, handleSubmit: chatHandleSubmit, isLoading, error, reload, stop, setInput } = useChat({
    api: '/api/chat',
    id: selectedTxHash || undefined,
    body: {
      txHash: selectedTxHash,
      chainId: currentChain.id
    },
    onFinish: (message) => {
      console.log('Raw message content:', message.content);
      
      const mermaidMatch = message.content.match(/```mermaid\n([\s\S]*?)\n```/);
      console.log('Mermaid match:', mermaidMatch);
      
      if (mermaidMatch) {
        const diagram = mermaidMatch[1].trim();
        console.log('Extracted diagram:', diagram);
        setMermaidChart(diagram);
        setCurrentMessage(message.content.replace(/```mermaid\n[\s\S]*?\n```/, '').trim());
      } else {
        console.log('No Mermaid diagram found');
        setCurrentMessage(message.content);
        setMermaidChart(null);
      }

      const analysisSection = document.getElementById('analysis-section');
      if (analysisSection) {
        analysisSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  // Enhanced formatValue function for transaction values
  const formatTransactionValue = (value: bigint | undefined): string => {
    if (!value || value === BigInt(0)) return '0';
    
    try {
      const etherValue = formatEther(value);
      const numValue = parseFloat(etherValue);
      
      if (numValue === 0) return '0';
      if (numValue < 0.0001) return numValue.toExponential(2);
      if (numValue < 1) return numValue.toFixed(6);
      if (numValue < 1000) return numValue.toFixed(4);
      return numValue.toFixed(2);
    } catch (error) {
      console.error('Error formatting transaction value:', error);
      return '0';
    }
  };

  // Enhanced formatGasPrice function using Viem's formatGwei
  const formatGasPrice = (gasPrice: bigint | undefined, maxFeePerGas?: bigint, maxPriorityFeePerGas?: bigint): string => {
    try {
      // For EIP-1559 transactions, use maxFeePerGas
      const priceToFormat = maxFeePerGas || gasPrice;
      
      if (!priceToFormat || priceToFormat === BigInt(0)) {
        return '0';
      }
      
      const gweiValue = formatGwei(priceToFormat);
      const numValue = parseFloat(gweiValue);
      
      if (numValue < 0.001) return numValue.toFixed(6);
      if (numValue < 1) return numValue.toFixed(4);
      if (numValue < 10) return numValue.toFixed(2);
      return numValue.toFixed(1);
    } catch (error) {
      console.error('Error formatting gas price:', error);
      return '0';
    }
  };

  // Function to get transaction receipt for gas info
  const getTransactionWithReceipt = async (tx: Transaction): Promise<EnhancedTransaction> => {
    try {
      const receipt = await currentClient.getTransactionReceipt({ hash: tx.hash as `0x${string}` });
      
      return {
        ...tx,
        effectiveGasPrice: receipt.effectiveGasPrice,
        gasUsed: receipt.gasUsed,
      };
    } catch (error) {
      console.error('Error fetching transaction receipt:', error);
      return tx;
    }
  };

  // Enhanced fetchBlockchainData function
  const fetchBlockchainData = async () => {
    try {
      setIsLoadingChainData(true);
      setIsRefreshing(true);
      
      console.log(`Fetching data for ${currentChain.name}...`);
      
      const blockNumber: bigint = await currentClient.getBlockNumber();
      console.log(`Latest block: ${blockNumber}`);
      
      // Fetch blocks with full transaction objects
      const blocks = await Promise.all(
        Array.from({ length: 8 }, async (_, i) => {
          try {
            const block = await currentClient.getBlock({
              blockNumber: blockNumber - BigInt(i),
              includeTransactions: true,
            });
            return block as BlockWithTransactions;
          } catch (error) {
            console.error(`Error fetching block ${blockNumber - BigInt(i)}:`, error);
            return null;
          }
        })
      );
      
      const validBlocks = blocks.filter(block => block !== null) as BlockWithTransactions[];
      setLatestBlocks(validBlocks);
      
      const gasPrice = await currentClient.getGasPrice();
      console.log(`Current gas price: ${gasPrice}`);
      
      // Network-specific stats
      const networkSpecificStats = {
        flare: { validators: 100, dataFeeds: 18 },
        songbird: { validators: 75, dataFeeds: 18 },
        coston2: { validators: 50, dataFeeds: 12 }
      };
      
      setNetworkStats({
        latestBlock: Number(blockNumber),
        gasPrice: formatGwei(gasPrice), // Now storing in Gwei instead of Ether
        pendingTxns: validBlocks[0]?.transactions?.length ?? 0,
        totalSupply: '15000000000',
        validators: networkSpecificStats[selectedNetwork].validators,
        dataFeeds: networkSpecificStats[selectedNetwork].dataFeeds,
      });
      
      // Get recent transactions with full details including receipts
      const allTransactions: EnhancedTransaction[] = [];
      
      for (const block of validBlocks.slice(0, 5)) {
        if (block?.transactions && Array.isArray(block.transactions)) {
          for (const tx of block.transactions.slice(0, 3)) {
            try {
              let fullTx: Transaction;
              if (typeof tx === 'string') {
                const details = await currentClient.getTransaction({ hash: tx as `0x${string}` });
                fullTx = details;
              } else {
                fullTx = tx;
              }
              
              // Get enhanced transaction with receipt data
              const enhancedTx = await getTransactionWithReceipt(fullTx);
              
              allTransactions.push({
                ...enhancedTx,
                blockNumber: block.number,
                blockTimestamp: block.timestamp
              });
              
              if (allTransactions.length >= 8) break;
            } catch (error) {
              console.error('Error fetching transaction:', error);
            }
          }
          if (allTransactions.length >= 8) break;
        }
      }

      const sortedTxs = allTransactions
        .sort((a, b) => Number(b.blockNumber || 0) - Number(a.blockNumber || 0))
        .slice(0, 8);
      
      console.log(`Found ${sortedTxs.length} transactions`);
      
      setRecentTransactions(sortedTxs);

    } catch (error) {
      console.error('Error fetching blockchain data:', error);
    } finally {
      setIsLoadingChainData(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBlockchainData();
    const interval = setInterval(fetchBlockchainData, 15000);
    return () => clearInterval(interval);
  }, [selectedNetwork]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSearchMode(true);
    setSelectedTxHash(input);
    setCurrentMessage(null);
    setMermaidChart(null);
    chatHandleSubmit(e);
  };

  const formRef = useRef<HTMLFormElement>(null);

  const handleSearch = (hash: string) => {
    setInput(hash);
    setIsSearchMode(true);
    setSelectedTxHash(hash);
    setCurrentMessage(null);
    setMermaidChart(null);

    requestAnimationFrame(() => {
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    });
  };

  const handleBackToExplorer = () => {
    setIsSearchMode(false);
    setSelectedTxHash(null);
    setCurrentMessage(null);
    setMermaidChart(null);
    setActiveView('explorer');
  };

  const handleReload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    reload();
  };

  const handleBlockClick = (block: BlockWithTransactions) => {
    if (block.transactions && block.transactions.length > 0) {
      const firstTx = block.transactions[0];
      const txHash = typeof firstTx === 'string' ? firstTx : firstTx.hash;
      handleSearch(txHash);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-40 left-1/2 w-60 h-60 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-white/95 backdrop-blur-lg border-b border-gray-300 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl blur opacity-75"></div>
                <div className="relative p-3 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl">
                  <img src="/FSlogo.svg" alt="FlareScanAI Logo" className="w-10 h-10" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                  FlareScanAI
                </h1>
                <p className="text-sm text-gray-700 font-medium">AI-Powered Data Blockchain Explorer</p>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-4">
              {/* Network Selector */}
              <div className="flex bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-gray-300">
                <button
                  onClick={() => setSelectedNetwork('flare')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedNetwork === 'flare'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                      : 'text-gray-800 hover:text-pink-600 hover:bg-gray-100'
                  }`}
                >
                  Flare
                </button>
                <button
                  onClick={() => setSelectedNetwork('songbird')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedNetwork === 'songbird'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                      : 'text-gray-800 hover:text-pink-600 hover:bg-gray-100'
                  }`}
                >
                  Songbird
                </button>
                <button
                  onClick={() => setSelectedNetwork('coston2')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedNetwork === 'coston2'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                      : 'text-gray-800 hover:text-pink-600 hover:bg-gray-100'
                  }`}
                >
                  Coston2
                </button>
              </div>
              
              {/* View Selector */}
              <div className="flex bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-gray-300">
                <button
                  onClick={() => setActiveView('explorer')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeView === 'explorer'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                      : 'text-gray-800 hover:text-pink-600 hover:bg-gray-100'
                  }`}
                >
                  Explorer
                </button>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeView === 'dashboard'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                      : 'text-gray-800 hover:text-pink-600 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView('data-feeds')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeView === 'data-feeds'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                      : 'text-gray-800 hover:text-pink-600 hover:bg-gray-100'
                  }`}
                >
                  Data Feeds
                </button>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-800">
                  {currentChain.name} • Chain {currentChain.id}
                </span>
              </div>
              
              {!isSearchMode && (
                <motion.button 
                  onClick={fetchBlockchainData}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 text-pink-600 hover:text-pink-700 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-300 hover:bg-white transition-all"
                >
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search Section */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative bg-white/90 backdrop-blur-lg border-b border-gray-300 shadow-sm"
      >
        <div className="max-w-5xl mx-auto px-4 py-6">
          <form ref={formRef} onSubmit={handleFormSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="w-6 h-6 text-pink-500" />
            </div>
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Search by transaction hash, address, or ask questions about Flare data..."
              disabled={isLoading}
              className="w-full pl-16 pr-2 py-5 bg-white border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-200 shadow-lg text-lg placeholder-gray-600 text-gray-900 transition-all"
              style={{ 
                maskImage: 'linear-gradient(to right, black 0%, black calc(100% - 350px), transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, black 0%, black calc(100% - 350px), transparent 100%)'
              }}
            />
            <div className="absolute inset-y-0 right-2 flex items-center gap-3">
              {isSearchMode && (
                <motion.button
                  type="button"
                  onClick={handleBackToExplorer}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 text-gray-800 hover:text-pink-600 font-medium bg-white rounded-lg border border-gray-300 shadow-sm"
                >
                  Back to Explorer
                </motion.button>
              )}
              <motion.button 
                type="submit" 
                disabled={isLoading || !input}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-medium shadow-lg hover:shadow-xl transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Analyze with AI</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">Analysis failed. Please try again.</span>
              </div>
              <button 
                onClick={handleReload}
                className="px-4 py-2 bg-white text-red-500 rounded-lg hover:bg-red-50 flex items-center gap-2 border border-red-200 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {isSearchMode ? (
            // Analysis Section
            <motion.div 
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              id="analysis-section" 
              className="max-w-5xl mx-auto"
            >
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  {selectedTxHash ? `AI Analysis for ${formatAddress(selectedTxHash)}` : 'AI-Powered Analysis'}
                </h2>
                <div className="space-y-8">
                  {mermaidChart && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="border-2 border-pink-200 rounded-2xl p-6 bg-gradient-to-br from-pink-50 to-white"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <Network className="w-5 h-5 text-pink-600" />
                          Transaction Flow Diagram
                        </h3>
                        <button
                          onClick={() => setIsDiagramModalOpen(true)}
                          className="p-2 hover:bg-pink-100 rounded-full transition-colors"
                          title="View full screen"
                        >
                          <Maximize2 className="w-5 h-5 text-pink-600" />
                        </button>
                      </div>
                      <div className="w-full bg-white rounded-xl p-6 shadow-inner">
                        <MermaidDiagram chart={mermaidChart} />
                      </div>
                    </motion.div>
                  )}
                  <div className="prose max-w-none">
                    {currentMessage && (
                      <div dangerouslySetInnerHTML={{ 
                        __html: formatAssistantMessage(currentMessage)
                      }} />
                    )}
                  </div>
                </div>
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 flex items-center gap-4 p-4 bg-pink-50 rounded-xl border border-pink-200"
                  >
                    <Loader2 className="w-6 h-6 animate-spin text-pink-600" />
                    <span className="text-pink-800 font-medium">AI is analyzing the transaction...</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            // Main Explorer Views
            <motion.div
              key="explorer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {activeView === 'explorer' && (
                <>
                  {/* Hero Stats Section */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-10"
                  >
                    <div className="text-center mb-8">
                      <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
                        The Blockchain for Data
                      </h2>
                      <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                        Explore {currentChain.name} with AI-powered insights. Access real-time data feeds, 
                        cross-chain interoperability, and decentralized oracles all in one place.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <motion.div 
                       whileHover={{ y: -5, scale: 1.02 }}
                       className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all"
                     >
                       <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl mb-4">
                         <Blocks className="w-6 h-6 text-white" />
                       </div>
                       <div className="text-2xl font-bold text-gray-900 mb-1">
                         {networkStats.latestBlock.toLocaleString()}
                       </div>
                       <div className="text-sm text-gray-600 font-medium">Latest Block</div>
                     </motion.div>

                     <motion.div 
                       whileHover={{ y: -5, scale: 1.02 }}
                       className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all"
                     >
                       <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl mb-4">
                         <BarChart3 className="w-6 h-6 text-white" />
                       </div>
                       <div className="text-2xl font-bold text-gray-900 mb-1">
                         {networkStats.dataFeeds}
                       </div>
                       <div className="text-sm text-gray-600 font-medium">FTSO Data Feeds</div>
                     </motion.div>

                     <motion.div 
                       whileHover={{ y: -5, scale: 1.02 }}
                       className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all"
                     >
                       <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl mb-4">
                         <Users className="w-6 h-6 text-white" />
                       </div>
                       <div className="text-2xl font-bold text-gray-900 mb-1">
                         {networkStats.validators}
                       </div>
                       <div className="text-sm text-gray-600 font-medium">Validators</div>
                     </motion.div>

                     <motion.div 
                       whileHover={{ y: -5, scale: 1.02 }}
  className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all"
                     >
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl mb-4">
    <Zap className="w-6 h-6 text-white" />
  </div>
                       <div className="text-2xl font-bold text-gray-900 mb-1">
                         {networkStats.gasPrice}
                       </div>
                       <div className="text-sm text-gray-600 font-medium">Gas Price (Gwei)</div>
                     </motion.div>
                   </div>
                 </motion.div>

                 {/* Features Showcase */}
                 <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 }}
                   className="mb-10"
                 >
                   <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                     Flare Ecosystem Features
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <motion.div 
                       whileHover={{ y: -5 }}
                       className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                     >
                       <div className="flex items-center gap-4 mb-4">
                         <div className="p-3 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl">
                           <Database className="w-6 h-6 text-white" />
                         </div>
                         <h4 className="text-lg font-semibold text-gray-900">FTSO Data Oracles</h4>
                       </div>
                       <p className="text-gray-700 mb-4">
                         Access decentralized time-series data including prices, weather, and custom datasets 
                         directly from the blockchain.
                       </p>
                       <div className="flex items-center text-pink-600 font-medium hover:text-pink-700 transition-colors">
                         <span>Explore Data Feeds</span>
                         <ArrowUpRight className="w-4 h-4 ml-1" />
                       </div>
                     </motion.div>

                     <motion.div 
                       whileHover={{ y: -5 }}
                       className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                     >
                       <div className="flex items-center gap-4 mb-4">
                         <div className="p-3 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl">
                           <Globe className="w-6 h-6 text-white" />
                         </div>
                         <h4 className="text-lg font-semibold text-gray-900">FAssets</h4>
                       </div>
                       <p className="text-gray-700 mb-4">
                         Bring non-smart contract tokens like BTC, LTC, XRP, and DOGE to Flare with 
                         trustless bridging technology.
                       </p>
                       <div className="flex items-center text-pink-600 font-medium hover:text-pink-700 transition-colors">
                         <span>Learn More</span>
                         <ArrowUpRight className="w-4 h-4 ml-1" />
                       </div>
                     </motion.div>

                     <motion.div 
                       whileHover={{ y: -5 }}
                       className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                     >
                       <div className="flex items-center gap-4 mb-4">
                         <div className="p-3 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl">
                           <Shield className="w-6 h-6 text-white" />
                         </div>
                         <h4 className="text-lg font-semibold text-gray-900">FDC Protocol</h4>
                       </div>
                       <p className="text-gray-700 mb-4">
                         Flare Data Connector enables secure acquisition of data from external blockchains 
                         and APIs with cryptographic proofs.
                       </p>
                       <div className="flex items-center text-pink-600 font-medium hover:text-pink-700 transition-colors">
                         <span>View Documentation</span>
                         <ArrowUpRight className="w-4 h-4 ml-1" />
                       </div>
                     </motion.div>
                   </div>
                 </motion.div>

                 {/* Latest Activity Grid */}
                 <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                   {/* Latest Blocks - Takes 3 columns */}
                   <motion.div 
                     initial={{ opacity: 0, x: -30 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.4 }}
                     className="xl:col-span-3 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg"
                   >
                     <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-pink-50 to-rose-50">
                       <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                         <Blocks className="w-5 h-5 text-pink-600" />
                         Latest Blocks
                       </h3>
                       <button
                         onClick={fetchBlockchainData}
                         className={`p-2 rounded-full transition-colors ${
                           isRefreshing ? 'bg-pink-100' : 'hover:bg-pink-100'
                         }`}
                         disabled={isRefreshing}
                       >
                         <RefreshCw className={`w-5 h-5 text-pink-600 ${
                           isRefreshing ? 'animate-spin' : ''
                         }`} />
                       </button>
                     </div>
                     <div className="divide-y divide-gray-100">
                       {isLoadingChainData && latestBlocks.length === 0 ? (
                         <div className="px-6 py-12 text-center">
                           <Loader2 className="w-8 h-8 animate-spin mx-auto text-pink-600 mb-3" />
                           <p className="text-gray-700 font-medium">Loading blocks...</p>
                         </div>
                       ) : latestBlocks.length === 0 ? (
                         <div className="px-6 py-12 text-center">
                           <p className="text-gray-600">No blocks found</p>
                         </div>
                       ) : (
                         latestBlocks.map((block) => (
                           <motion.div 
                             key={Number(block.number)} 
                             whileHover={{ backgroundColor: 'rgba(236, 72, 153, 0.05)' }}
                             className="px-6 py-4 cursor-pointer transition-all hover:bg-gray-50"
                             onClick={() => handleBlockClick(block)}
                           >
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                                   <Blocks className="w-6 h-6 text-white" />
                                 </div>
                                 <div>
                                   <div className="font-semibold text-gray-900">
                                     Block #{Number(block.number).toLocaleString()}
                                   </div>
                                   <div className="text-sm text-gray-600 space-y-1">
                                     <div className="flex items-center gap-4">
                                       <span>{block.transactions.length} transactions</span>
                                       <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-medium">
                                         Gas: {formatEther(block.gasUsed || BigInt(0)).slice(0, 8)} {currentChain.nativeCurrency.symbol}
                                       </span>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                               <div className="flex items-center gap-3">
                                 <div className="text-right text-sm text-gray-600">
                                   <div className="font-medium">{new Date(Number(block.timestamp) * 1000).toLocaleTimeString()}</div>
                                   <div className="text-xs">{new Date(Number(block.timestamp) * 1000).toLocaleDateString()}</div>
                                 </div>
                                 <ChevronRight className="w-5 h-5 text-gray-400" />
                               </div>
                             </div>
                           </motion.div>
                         ))
                       )}
                     </div>
                   </motion.div>

                   {/* Recent Transactions - Takes 2 columns */}
<motion.div 
  initial={{ opacity: 0, x: 30 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.5 }}
  className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg"
>
  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-pink-50 to-rose-50">
    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      <Activity className="w-5 h-5 text-pink-600" />
      Recent Transactions
    </h3>
    <button
      onClick={fetchBlockchainData}
      className={`p-2 rounded-full transition-colors ${
        isRefreshing ? 'bg-pink-100' : 'hover:bg-pink-100'
      }`}
      disabled={isRefreshing}
    >
      <RefreshCw className={`w-5 h-5 text-pink-600 ${
        isRefreshing ? 'animate-spin' : ''
      }`} />
    </button>
  </div>
  <div className="divide-y divide-gray-100">
    {isLoadingChainData && recentTransactions.length === 0 ? (
      <div className="px-6 py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-pink-600 mb-3" />
        <p className="text-gray-700 font-medium">Loading transactions...</p>
      </div>
    ) : recentTransactions.length === 0 ? (
      <div className="px-6 py-12 text-center">
        <p className="text-gray-600">No transactions found</p>
      </div>
    ) : (
      recentTransactions.map((transaction) => (
        <motion.div 
          key={transaction.hash} 
          whileHover={{ backgroundColor: 'rgba(236, 72, 153, 0.05)' }}
          className="px-6 py-4 cursor-pointer transition-all hover:bg-gray-50"
          onClick={() => handleSearch(transaction.hash)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                <Hash className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {formatAddress(transaction.hash)}
                </div>
                <div className="text-sm text-gray-600">
                  From: {formatAddress(transaction.from)}
                </div>
              </div>
            </div>
            <div className="text-right">
  <div className="font-semibold text-gray-900">
                Gas: {formatGasPrice(
                  transaction.effectiveGasPrice || transaction.gasPrice,
                  transaction.maxFeePerGas,
                  transaction.maxPriorityFeePerGas
                )} Gwei
              </div>
            </div>
          </div>
        </motion.div>
      ))
    )}
  </div>
</motion.div>
                 </div>

                 {/* Call to Action */}
                 <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.6 }}
                   className="mt-12 text-center"
                 >
                   <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-3xl p-8 text-white">
                     <h3 className="text-2xl font-bold mb-4">Ready to Build on Flare?</h3>
                     <p className="text-lg mb-6 text-white/95">
                       Start building data-rich dApps with Flare's decentralized oracles and cross-chain capabilities.
                     </p>
                     <div className="flex justify-center gap-4">
                       <motion.button 
                         whileHover={{ scale: 1.05 }}
                         className="px-6 py-3 bg-white text-pink-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                       >
                         Developer Docs
                       </motion.button>
                       <motion.button 
                         whileHover={{ scale: 1.05 }}
                         className="px-6 py-3 bg-white/20 backdrop-blur text-white rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30"
                       >
                         Join Community
                       </motion.button>
                     </div>
                   </div>
                 </motion.div>
               </>
             )}

             {activeView === 'dashboard' && (
               <FlareDashboard selectedNetwork={selectedNetwork} networkStats={networkStats} />
             )}

             {activeView === 'data-feeds' && (
               <FlareDataFeeds selectedNetwork={selectedNetwork} />
             )}
           </motion.div>
         )}
       </AnimatePresence>
     </div>

     {/* Add the modal component */}
     <DiagramModal
       isOpen={isDiagramModalOpen}
       onClose={() => setIsDiagramModalOpen(false)}
       chart={mermaidChart || ''}
     />
   </div>
 );
};

export default FlareBlockchainExplorer;
