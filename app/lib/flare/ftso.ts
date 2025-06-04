import { ethers } from 'ethers';
import { createPublicClient, http } from 'viem';

// FTSO V2 Interface for price feeds - using ethers ABI format
const FTSO_V2_ABI = [
  {
    inputs: [{ internalType: "bytes21", name: "feedId", type: "bytes21" }],
    name: "getFeedById",
    outputs: [
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "int8", name: "decimals", type: "int8" },
      { internalType: "uint64", name: "timestamp", type: "uint64" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "getFeedByIndex",
    outputs: [
      { internalType: "bytes21", name: "feedId", type: "bytes21" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "int8", name: "decimals", type: "int8" },
      { internalType: "uint64", name: "timestamp", type: "uint64" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes21[]", name: "feedIds", type: "bytes21[]" }],
    name: "getFeedsById",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "value", type: "uint256" },
          { internalType: "int8", name: "decimals", type: "int8" },
          { internalType: "uint64", name: "timestamp", type: "uint64" }
        ],
        internalType: "struct IFtsoV2.Feed[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getSupportedFeedIds",
    outputs: [{ internalType: "bytes21[]", name: "", type: "bytes21[]" }],
    stateMutability: "view",
    type: "function"
  }
];

// FTSO Registry ABI
const FTSO_REGISTRY_ABI = [
  {
    inputs: [],
    name: "getFtsoV2",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getPriceSubmitter",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
];

// Feed IDs for different price pairs - corrected to 21 bytes each
export const FTSO_FEED_IDS = {
  'FLR/USD': '0x01464c522f555344000000000000000000000000',
  'SGB/USD': '0x01534742555344000000000000000000000000',
  'BTC/USD': '0x014254435553440000000000000000000000000',
  'ETH/USD': '0x014554485553440000000000000000000000000',
  'XRP/USD': '0x015852505553440000000000000000000000000',
  'LTC/USD': '0x014c54435553440000000000000000000000000',
  'ADA/USD': '0x014144415553440000000000000000000000000',
  'ALGO/USD': '0x01414c474f5553440000000000000000000000',
  'DOGE/USD': '0x01444f47455553440000000000000000000000',
  'FIL/USD': '0x0146494c5553440000000000000000000000000',
  'ARB/USD': '0x014152425553440000000000000000000000000',
  'AVAX/USD': '0x014156415855534400000000000000000000000',
  'BNB/USD': '0x01424e425553440000000000000000000000000',
  'MATIC/USD': '0x014d4154494355534400000000000000000000',
  'SOL/USD': '0x01534f4c5553440000000000000000000000000',
  'USDC/USD': '0x015553444355534400000000000000000000000',
  'USDT/USD': '0x015553445455534400000000000000000000000',
  'XLM/USD': '0x01584c4d5553440000000000000000000000000'
};

// Contract addresses per network
const FTSO_ADDRESSES = {
  14: { // Flare Mainnet
    registry: '0x6D222bB7C9d8d8b8B3Ef68bF5b7e4F7c1dE0F832',
    ftsoV2: '0x3d1E88F3b8fc32DB6d71C82F2e9c44DeBe01d796'
  },
  19: { // Songbird
    registry: '0x6D222bB7C9d8d8b8B3Ef68bF5b7e4F7c1dE0F832',
    ftsoV2: '0x3d1E88F3b8fc32DB6d71C82F2e9c44DeBe01d796'
  },
  114: { // Coston2
    registry: '0x6D222bB7C9d8d8b8B3Ef68bF5b7e4F7c1dE0F832',
    ftsoV2: '0x3d1E88F3b8fc32DB6d71C82F2e9c44DeBe01d796'
  },
  16: { // Coston
    registry: '0x6D222bB7C9d8d8b8B3Ef68bF5b7e4F7c1dE0F832',
    ftsoV2: '0x3d1E88F3b8fc32DB6d71C82F2e9c44DeBe01d796'
  }
};

export interface PriceFeedData {
  feedId: string;
  symbol: string;
  value: number;
  decimals: number;
  timestamp: number;
  formattedValue: string;
}

export class FTSOService {
  private provider: ethers.JsonRpcProvider;
  private chainId: number;
  private ftsoContract: ethers.Contract;

  constructor(provider: ethers.JsonRpcProvider, chainId: number) {
    this.provider = provider;
    this.chainId = chainId;
    
    const addresses = FTSO_ADDRESSES[chainId as keyof typeof FTSO_ADDRESSES];
    if (!addresses) {
      throw new Error(`FTSO not supported on chain ${chainId}`);
    }
    
    this.ftsoContract = new ethers.Contract(
      addresses.ftsoV2,
      FTSO_V2_ABI,
      provider
    );
  }

  async getPriceByFeedId(feedId: string): Promise<PriceFeedData | null> {
    try {
      const result = await this.ftsoContract.getFeedById(feedId);
      const symbol = Object.entries(FTSO_FEED_IDS).find(([_, id]) => id === feedId)?.[0] || 'Unknown';
      
      const value = Number(result.value);
      const decimals = Number(result.decimals);
      const actualValue = decimals < 0 
        ? value * Math.pow(10, Math.abs(decimals))
        : value / Math.pow(10, decimals);
      
      return {
        feedId,
        symbol,
        value: actualValue,
        decimals,
        timestamp: Number(result.timestamp),
        formattedValue: actualValue.toFixed(Math.max(2, Math.abs(decimals)))
      };
    } catch (error) {
      console.error('Error fetching FTSO price:', error);
      return null;
    }
  }

  async getMultiplePrices(symbols: string[]): Promise<PriceFeedData[]> {
    const feedIds = symbols
      .map(symbol => FTSO_FEED_IDS[symbol as keyof typeof FTSO_FEED_IDS])
      .filter(Boolean);
    
    if (feedIds.length === 0) return [];
    
    try {
      const results = await this.ftsoContract.getFeedsById(feedIds);
      
      return results.map((result: any, index: number) => {
        const feedId = feedIds[index];
        const symbol = symbols[index];
        const value = Number(result.value);
        const decimals = Number(result.decimals);
        const actualValue = decimals < 0 
          ? value * Math.pow(10, Math.abs(decimals))
          : value / Math.pow(10, decimals);
        
        return {
          feedId,
          symbol,
          value: actualValue,
          decimals,
          timestamp: Number(result.timestamp),
          formattedValue: actualValue.toFixed(Math.max(2, Math.abs(decimals)))
        };
      });
    } catch (error) {
      console.error('Error fetching multiple FTSO prices:', error);
      return [];
    }
  }

  async getAllSupportedFeeds(): Promise<string[]> {
    try {
      const feedIds = await this.ftsoContract.getSupportedFeedIds();
      return feedIds;
    } catch (error) {
      console.error('Error fetching supported feeds:', error);
      return [];
    }
  }

  // Calculate USD value for any amount using FTSO price
  async calculateUSDValue(amount: string, symbol: string): Promise<number | null> {
    const priceData = await this.getPriceByFeedId(
      FTSO_FEED_IDS[`${symbol}/USD` as keyof typeof FTSO_FEED_IDS]
    );
    
    if (!priceData) return null;
    
    const amountNum = parseFloat(amount);
    return amountNum * priceData.value;
  }

  // Get historical price at specific timestamp (would need indexer in production)
  async getHistoricalPrice(symbol: string, timestamp: number): Promise<PriceFeedData | null> {
    // For demo, return current price
    // In production, this would query an indexer or historical data service
    return this.getPriceByFeedId(
      FTSO_FEED_IDS[`${symbol}/USD` as keyof typeof FTSO_FEED_IDS]
    );
  }
}

// WebSocket service for real-time price updates
export class FTSOWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private listeners: Map<string, Set<(data: PriceFeedData) => void>> = new Map();

  connect(chainId: number) {
    // WebSocket connection temporarily disabled for stability
    console.log('WebSocket connection disabled - using polling for price updates');
    return;
    
    /* WebSocket implementation commented out for now
    const wsUrl = this.getWebSocketUrl(chainId);
    if (!wsUrl) return;

    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('FTSO WebSocket connected');
        this.subscribeToAllFeeds();
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'price_update') {
            this.notifyListeners(data.feedId, data);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket closed, reconnecting...');
        setTimeout(() => this.connect(chainId), this.reconnectInterval);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
    */
  }

  private getWebSocketUrl(chainId: number): string | null {
    const urls: Record<number, string> = {
      14: 'wss://flare-api.flare.network/ext/bc/C/ws',
      19: 'wss://songbird-api.flare.network/ext/bc/C/ws',
      114: 'wss://coston2-api.flare.network/ext/bc/C/ws',
      16: 'wss://coston-api.flare.network/ext/bc/C/ws'
    };
    return urls[chainId] || null;
  }

  private subscribeToAllFeeds() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    
    this.ws.send(JSON.stringify({
      type: 'subscribe',
      feeds: Object.values(FTSO_FEED_IDS)
    }));
  }

  subscribe(feedId: string, callback: (data: PriceFeedData) => void) {
    if (!this.listeners.has(feedId)) {
      this.listeners.set(feedId, new Set());
    }
    this.listeners.get(feedId)!.add(callback);
  }

  unsubscribe(feedId: string, callback: (data: PriceFeedData) => void) {
    const callbacks = this.listeners.get(feedId);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(feedId);
      }
    }
  }

  private notifyListeners(feedId: string, data: PriceFeedData) {
    const callbacks = this.listeners.get(feedId);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}