import { ethers } from 'ethers';

// FAssets contract ABIs - using ethers format
const FASSET_ABI = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "redeem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "collateralRatio",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "agent", type: "address" }],
    name: "getAgent",
    outputs: [
      {
        components: [
          { internalType: "address", name: "agentVault", type: "address" },
          { internalType: "uint256", name: "collateral", type: "uint256" },
          { internalType: "uint256", name: "minted", type: "uint256" },
          { internalType: "uint8", name: "status", type: "uint8" }
        ],
        internalType: "struct Agent",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];

const AGENT_VAULT_ABI = [
  {
    inputs: [],
    name: "getCollateral",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getMintedAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getCollateralRatio",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "isHealthy",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  }
];

// FAsset addresses per network
const FASSET_ADDRESSES = {
  14: { // Flare Mainnet
    FBTC: '0x1234567890123456789012345678901234567890', 
    FXRP: '0x2345678901234567890123456789012345678901', // 
    FLTC: '0x3456789012345678901234567890123456789012', // 
    FDOGE: '0x4567890123456789012345678901234567890123', // 
    assetManager: '0x5678901234567890123456789012345678901234'
  },
  114: { // Coston2
    FBTC: '0x6789012345678901234567890123456789012345',
    FXRP: '0x7890123456789012345678901234567890123456',
    FLTC: '0x8901234567890123456789012345678901234567',
    FDOGE: '0x9012345678901234567890123456789012345678',
    assetManager: '0x0123456789012345678901234567890123456789'
  }
};

export interface FAssetInfo {
  symbol: string;
  address: string;
  totalSupply: string;
  collateralRatio: number;
  nativeAsset: string;
  isActive: boolean;
}

export interface AgentInfo {
  agentVault: string;
  collateral: string;
  minted: string;
  collateralRatio: number;
  isHealthy: boolean;
  status: 'active' | 'liquidating' | 'inactive';
}

export interface MintingRequest {
  fasset: string;
  amount: string;
  recipient: string;
  agent: string;
  collateralReservation: string;
  paymentReference: string;
  underlyingTxHash?: string;
  status: 'pending' | 'paid' | 'minted' | 'failed';
}

export class FAssetsService {
  private provider: ethers.JsonRpcProvider;
  private chainId: number;

  constructor(provider: ethers.JsonRpcProvider, chainId: number) {
    this.provider = provider;
    this.chainId = chainId;
  }

  // Get FAsset information
  async getFAssetInfo(symbol: string): Promise<FAssetInfo | null> {
    try {
      const addresses = FASSET_ADDRESSES[this.chainId as keyof typeof FASSET_ADDRESSES];
      if (!addresses) return null;

      const fassetAddress = addresses[symbol as keyof typeof addresses];
      if (!fassetAddress || typeof fassetAddress !== 'string') return null;

      // For demo purposes, return mock data if contract calls fail
      try {
        const contract = new ethers.Contract(fassetAddress, FASSET_ABI, this.provider);
        
        const [totalSupply, collateralRatio] = await Promise.all([
          contract.totalSupply(),
          contract.collateralRatio()
        ]);

        return {
          symbol,
          address: fassetAddress,
          totalSupply: ethers.formatEther(totalSupply),
          collateralRatio: Number(collateralRatio) / 100,
          nativeAsset: this.getNativeAsset(symbol),
          isActive: true
        };
      } catch (contractError) {
        // Return mock data for demo
        console.log(`Using mock data for ${symbol}`);
        const mockData = {
          'FBTC': { supply: '125.5', ratio: 165 },
          'FXRP': { supply: '5250000', ratio: 152 },
          'FLTC': { supply: '8500', ratio: 158 },
          'FDOGE': { supply: '15000000', ratio: 145 }
        };
        
        const data = mockData[symbol as keyof typeof mockData] || { supply: '0', ratio: 150 };
        
        return {
          symbol,
          address: fassetAddress,
          totalSupply: data.supply,
          collateralRatio: data.ratio,
          nativeAsset: this.getNativeAsset(symbol),
          isActive: true
        };
      }
    } catch (error) {
      console.error('Error getting FAsset info:', error);
      return null;
    }
  }

  // Get all FAssets on the network
  async getAllFAssets(): Promise<FAssetInfo[]> {
    const fassets = ['FBTC', 'FXRP', 'FLTC', 'FDOGE'];
    const results = await Promise.all(
      fassets.map(symbol => this.getFAssetInfo(symbol))
    );
    
    return results.filter((info): info is FAssetInfo => info !== null);
  }

  // Get agent information
  async getAgentInfo(fassetSymbol: string, agentAddress: string): Promise<AgentInfo | null> {
    try {
      const addresses = FASSET_ADDRESSES[this.chainId as keyof typeof FASSET_ADDRESSES];
      if (!addresses) return null;

      const fassetAddress = addresses[fassetSymbol as keyof typeof addresses];
      if (!fassetAddress || typeof fassetAddress !== 'string') return null;

      const contract = new ethers.Contract(fassetAddress, FASSET_ABI, this.provider);
      const agentData = await contract.getAgent(agentAddress);

      // Get additional info from agent vault
      const vaultContract = new ethers.Contract(
        agentData.agentVault,
        AGENT_VAULT_ABI,
        this.provider
      );

      const [isHealthy, vaultCollateralRatio] = await Promise.all([
        vaultContract.isHealthy(),
        vaultContract.getCollateralRatio()
      ]);

      return {
        agentVault: agentData.agentVault,
        collateral: ethers.formatEther(agentData.collateral),
        minted: ethers.formatEther(agentData.minted),
        collateralRatio: Number(vaultCollateralRatio) / 100,
        isHealthy,
        status: agentData.status === 0 ? 'active' : 
                agentData.status === 1 ? 'liquidating' : 'inactive'
      };
    } catch (error) {
      console.error('Error getting agent info:', error);
      return null;
    }
  }

  // Monitor FAsset minting/redemption in a transaction
  async analyzeFAssetActivity(txHash: string): Promise<{
    type: 'mint' | 'redeem' | 'none';
    fasset?: string;
    amount?: string;
    agent?: string;
    underlyingTx?: string;
  }> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) return { type: 'none' };

      // Check logs for minting/redemption events
      const mintEventSignature = ethers.id('Minted(address,address,uint256)');
      const redeemEventSignature = ethers.id('Redeemed(address,uint256)');

      for (const log of receipt.logs) {
        if (log.topics[0] === mintEventSignature) {
          return {
            type: 'mint',
            fasset: log.address,
            amount: ethers.formatEther(BigInt(log.data)),
            agent: ethers.getAddress('0x' + log.topics[1].slice(26))
          };
        } else if (log.topics[0] === redeemEventSignature) {
          return {
            type: 'redeem',
            fasset: log.address,
            amount: ethers.formatEther(BigInt(log.data))
          };
        }
      }

      return { type: 'none' };
    } catch (error) {
      console.error('Error analyzing FAsset activity:', error);
      return { type: 'none' };
    }
  }

  // Calculate collateralization health
  calculateCollateralizationHealth(
    collateral: number,
    minted: number,
    requiredRatio: number
  ): {
    health: 'healthy' | 'warning' | 'danger';
    currentRatio: number;
    buffer: number;
  } {
    if (minted === 0) {
      return { health: 'healthy', currentRatio: Infinity, buffer: 100 };
    }

    const currentRatio = (collateral / minted) * 100;
    const buffer = ((currentRatio - requiredRatio) / requiredRatio) * 100;

    let health: 'healthy' | 'warning' | 'danger';
    if (buffer > 50) health = 'healthy';
    else if (buffer > 20) health = 'warning';
    else health = 'danger';

    return { health, currentRatio, buffer };
  }

  private getNativeAsset(fassetSymbol: string): string {
    const mapping: Record<string, string> = {
      'FBTC': 'BTC',
      'FXRP': 'XRP',
      'FLTC': 'LTC',
      'FDOGE': 'DOGE',
      'FADA': 'ADA',
      'FALGO': 'ALGO'
    };
    return mapping[fassetSymbol] || 'Unknown';
  }

  // Get total value locked in FAssets
  async getTotalValueLocked(): Promise<{
    totalUSD: number;
    breakdown: Record<string, number>;
  }> {
    const fassets = await this.getAllFAssets();
    const breakdown: Record<string, number> = {};
    let totalUSD = 0;

    // In production, would fetch prices from FTSO
    const mockPrices: Record<string, number> = {
      'FBTC': 43000,
      'FXRP': 0.62,
      'FLTC': 72,
      'FDOGE': 0.08
    };

    for (const fasset of fassets) {
      const price = mockPrices[fasset.symbol] || 0;
      const value = parseFloat(fasset.totalSupply) * price;
      breakdown[fasset.symbol] = value;
      totalUSD += value;
    }

    return { totalUSD, breakdown };
  }
}

// Helper function to check if transaction involves FAssets
export async function detectFAssetTransaction(
  provider: ethers.JsonRpcProvider,
  txHash: string,
  chainId: number
): Promise<{
  isFAssetTx: boolean;
  fassetType?: string;
  action?: 'mint' | 'redeem' | 'transfer';
  amount?: string;
}> {
  try {
    const tx = await provider.getTransaction(txHash);
    if (!tx || !tx.to) return { isFAssetTx: false };

    const addresses = FASSET_ADDRESSES[chainId as keyof typeof FASSET_ADDRESSES];
    if (!addresses) return { isFAssetTx: false };

    // Check if the transaction is to a known FAsset contract
    const fassetSymbol = Object.entries(addresses).find(
      ([key, addr]) => addr === tx.to && key !== 'assetManager'
    )?.[0];

    if (!fassetSymbol) return { isFAssetTx: false };

    // Analyze the transaction to determine the action
    const service = new FAssetsService(provider, chainId);
    const activity = await service.analyzeFAssetActivity(txHash);

    return {
      isFAssetTx: true,
      fassetType: fassetSymbol,
      action: activity.type === 'none' ? 'transfer' : activity.type,
      amount: activity.amount
    };
  } catch (error) {
    console.error('Error detecting FAsset transaction:', error);
    return { isFAssetTx: false };
  }
}