import { ethers } from 'ethers';

export interface FlareChain {
    name: string;
    chainId: number;
    shortName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpc: string[];
    blockExplorer: string;
    testnet: boolean;
    description: string;
    features: string[];
}

// Flare network configurations
export class FlareChainManager {
    private static instance: FlareChainManager;
    private chains: FlareChain[] = [
        {
            name: 'Flare Mainnet',
            chainId: 14,
            shortName: 'flare',
            nativeCurrency: {
                name: 'Flare',
                symbol: 'FLR',
                decimals: 18
            },
            rpc: [
                'https://flare-api.flare.network/ext/C/rpc',
                'https://rpc.ankr.com/flare',
                'https://flare.public-rpc.com'
            ],
            blockExplorer: 'https://flare-explorer.flare.network',
            testnet: false,
            description: 'Flare is the blockchain for data - a full-stack layer 1 solution designed for data intensive use cases.',
            features: ['FTSO', 'FAssets', 'FDC', 'Data Oracles', 'Cross-chain Interoperability']
        },
        {
            name: 'Songbird',
            chainId: 19,
            shortName: 'sgb',
            nativeCurrency: {
                name: 'Songbird',
                symbol: 'SGB',
                decimals: 18
            },
            rpc: [
                'https://songbird-api.flare.network/ext/C/rpc',
                'https://songbird.public-rpc.com'
            ],
            blockExplorer: 'https://songbird-explorer.flare.network',
            testnet: false,
            description: 'Songbird is the canary network for Flare, used for testing and experimentation.',
            features: ['FTSO Testing', 'Experimental Features', 'Community Governance']
        },
        {
            name: 'Flare Testnet Coston2',
            chainId: 114,
            shortName: 'c2flr',
            nativeCurrency: {
                name: 'Coston2 Flare',
                symbol: 'C2FLR',
                decimals: 18
            },
            rpc: [
                'https://coston2-api.flare.network/ext/C/rpc',
                'https://coston2.enosys.global/ext/C/rpc'
            ],
            blockExplorer: 'https://coston2-explorer.flare.network',
            testnet: true,
            description: 'Coston2 is the official testnet for Flare Mainnet development and testing.',
            features: ['FTSO Testing', 'Free Test Tokens', 'Development Environment']
        },
        {
            name: 'Songbird Testnet Coston',
            chainId: 16,
            shortName: 'cflr',
            nativeCurrency: {
                name: 'Coston Flare',
                symbol: 'CFLR',
                decimals: 18
            },
            rpc: [
                'https://coston-api.flare.network/ext/C/rpc'
            ],
            blockExplorer: 'https://coston-explorer.flare.network',
            testnet: true,
            description: 'Coston is the testnet for Songbird canary network.',
            features: ['Canary Testing', 'Free Test Tokens']
        }
    ];

    private constructor() {}

    static getInstance(): FlareChainManager {
        if (!FlareChainManager.instance) {
            FlareChainManager.instance = new FlareChainManager();
        }
        return FlareChainManager.instance;
    }

    getChain(chainId: number): FlareChain | undefined {
        return this.chains.find(chain => chain.chainId === chainId);
    }

    getAllChains(): FlareChain[] {
        return this.chains;
    }

    getMainnets(): FlareChain[] {
        return this.chains.filter(chain => !chain.testnet);
    }

    getTestnets(): FlareChain[] {
        return this.chains.filter(chain => chain.testnet);
    }

    async getProvider(chainId: number): Promise<ethers.JsonRpcProvider> {
        const chain = this.getChain(chainId);
        if (!chain) throw new Error(`Chain ${chainId} not found`);
        if (!chain.rpc || chain.rpc.length === 0) throw new Error(`No RPC endpoints found for chain ${chainId}`);

        const errors: Error[] = [];
        for (const rpc of chain.rpc) {
            try {
                console.log(`Trying RPC: ${rpc}`);
                const provider = new ethers.JsonRpcProvider(rpc);
                // Test the connection
                await provider.getBlockNumber();
                console.log(`Successfully connected to RPC: ${rpc}`);
                return provider;
            } catch (error) {
                console.warn(`RPC ${rpc} failed:`, error);
                errors.push(error as Error);
                continue;
            }
        }
        throw new Error(`All RPCs failed for chain ${chainId}. Errors: ${errors.map(e => e.message).join(', ')}`);
    }

    // Get FTSO data feeds available on this chain
    getFTSOFeeds(chainId: number): string[] {
        const mainnetFeeds = [
            'FLR/USD', 'SGB/USD', 'BTC/USD', 'ETH/USD', 'XRP/USD', 'LTC/USD', 
            'ADA/USD', 'ALGO/USD', 'DOGE/USD', 'FIL/USD', 'ARB/USD', 'AVAX/USD',
            'BNB/USD', 'MATIC/USD', 'SOL/USD', 'USDC/USD', 'USDT/USD', 'XLM/USD'
        ];
        
        if (chainId === 14 || chainId === 19) { // Mainnet or Songbird
            return mainnetFeeds;
        } else { // Testnets
            return mainnetFeeds.slice(0, 8); // Limited feeds on testnet
        }
    }

    // Check if chain supports specific Flare features
    supportsFeature(chainId: number, feature: string): boolean {
        const chain = this.getChain(chainId);
        return chain?.features.includes(feature) || false;
    }
}