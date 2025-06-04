import { ethers } from 'ethers';
import axios from 'axios';

// FDC Attestation Types
export enum AttestationType {
  PAYMENT = 'Payment',
  BALANCE_DECREASING = 'BalanceDecreasing',
  CONFIRMED_BLOCK_HEIGHT_EXISTS = 'ConfirmedBlockHeightExists',
  REFERENCED_PAYMENT_NONEXISTENCE = 'ReferencedPaymentNonexistence',
  ADDRESS_VALIDITY = 'AddressValidity'
}

// Supported external chains
export enum ExternalChain {
  BTC = 'BTC',
  DOGE = 'DOGE',
  XRP = 'XRP',
  ETH = 'ETH',
  FLR = 'FLR'
}

// FDC Contract addresses
const FDC_ADDRESSES = {
  14: { // Flare Mainnet
    stateConnector: '0x1000000000000000000000000000000000000001',
    attestationProvider: '0x0c13aF92fD46B5630d12D7D3Ca509D069F7be969'
  },
  19: { // Songbird
    stateConnector: '0x1000000000000000000000000000000000000001',
    attestationProvider: '0x0c13aF92fD46B5630d12D7D3Ca509D069F7be969'
  },
  114: { // Coston2
    stateConnector: '0x1000000000000000000000000000000000000001',
    attestationProvider: '0x0c13aF92fD46B5630d12D7D3Ca509D069F7be969'
  }
};

// FDC Verifier endpoints
const FDC_VERIFIER_URLS = {
  14: {
    BTC: 'https://fdc-verifiers-mainnet.flare.network/verifier/btc',
    XRP: 'https://fdc-verifiers-mainnet.flare.network/verifier/xrp',
    DOGE: 'https://fdc-verifiers-mainnet.flare.network/verifier/doge',
    ETH: 'https://fdc-verifiers-mainnet.flare.network/verifier/evm'
  },
  114: {
    BTC: 'https://fdc-verifiers-testnet.flare.network/verifier/btc',
    XRP: 'https://fdc-verifiers-testnet.flare.network/verifier/xrp',
    DOGE: 'https://fdc-verifiers-testnet.flare.network/verifier/doge',
    ETH: 'https://fdc-verifiers-testnet.flare.network/verifier/evm'
  }
};

export interface PaymentAttestation {
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: string;
  inUtxo: number;
  utxo: number;
  sourceAddress: string;
  receivingAddress: string;
  spentAmount: string;
  intendedReceivingAddress: string;
  intendedSpentAmount: string;
  paymentReference: string;
  oneToOne: boolean;
  status: string;
}

export interface BalanceAttestation {
  blockNumber: number;
  blockTimestamp: number;
  addressHash: string;
  balance: string;
}

export interface CrossChainTransaction {
  chain: ExternalChain;
  txHash: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  confirmations: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export class FDCService {
  private chainId: number;
  private apiKey: string;
  
  constructor(chainId: number, apiKey: string = 'default_api_key') {
    this.chainId = chainId;
    this.apiKey = apiKey;
  }

  // Verify a payment on an external chain
  async verifyPayment(
    chain: ExternalChain,
    txHash: string
  ): Promise<PaymentAttestation | null> {
    try {
      const verifierUrl = this.getVerifierUrl(chain);
      if (!verifierUrl) {
        throw new Error(`Verifier not available for ${chain} on chain ${this.chainId}`);
      }

      const response = await axios.post(
        `${verifierUrl}/Payment/prepareRequest`,
        {
          transactionHash: txHash,
          chainId: chain
        },
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'VALID') {
        return response.data.response as PaymentAttestation;
      }
      
      return null;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return null;
    }
  }

  // Verify balance on external chain
  async verifyBalance(
    chain: ExternalChain,
    address: string,
    blockNumber?: number
  ): Promise<BalanceAttestation | null> {
    try {
      const verifierUrl = this.getVerifierUrl(chain);
      if (!verifierUrl) {
        throw new Error(`Verifier not available for ${chain} on chain ${this.chainId}`);
      }

      const response = await axios.post(
        `${verifierUrl}/BalanceDecreasingTransaction/prepareRequest`,
        {
          addressHash: address,
          blockNumber: blockNumber || 'latest',
          chainId: chain
        },
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'VALID') {
        return response.data.response as BalanceAttestation;
      }
      
      return null;
    } catch (error) {
      console.error('Error verifying balance:', error);
      return null;
    }
  }

  // Get cross-chain transaction details
  async getCrossChainTransaction(
    chain: ExternalChain,
    txHash: string
  ): Promise<CrossChainTransaction | null> {
    try {
      // First verify the payment exists
      const payment = await this.verifyPayment(chain, txHash);
      if (!payment) return null;

      // Get additional transaction details based on chain
      let txDetails: CrossChainTransaction;

      switch (chain) {
        case ExternalChain.BTC:
          txDetails = await this.getBTCTransactionDetails(txHash, payment);
          break;
        case ExternalChain.XRP:
          txDetails = await this.getXRPTransactionDetails(txHash, payment);
          break;
        case ExternalChain.ETH:
          txDetails = await this.getETHTransactionDetails(txHash, payment);
          break;
        default:
          throw new Error(`Unsupported chain: ${chain}`);
      }

      return txDetails;
    } catch (error) {
      console.error('Error getting cross-chain transaction:', error);
      return null;
    }
  }

  private async getBTCTransactionDetails(
    txHash: string,
    payment: PaymentAttestation
  ): Promise<CrossChainTransaction> {
    // In production, would fetch from Bitcoin node/API
    return {
      chain: ExternalChain.BTC,
      txHash,
      from: payment.sourceAddress,
      to: payment.receivingAddress,
      amount: payment.spentAmount,
      timestamp: payment.blockTimestamp,
      confirmations: 6, // Placeholder
      status: 'confirmed'
    };
  }

  private async getXRPTransactionDetails(
    txHash: string,
    payment: PaymentAttestation
  ): Promise<CrossChainTransaction> {
    // In production, would fetch from XRP Ledger
    return {
      chain: ExternalChain.XRP,
      txHash,
      from: payment.sourceAddress,
      to: payment.receivingAddress,
      amount: payment.spentAmount,
      timestamp: payment.blockTimestamp,
      confirmations: 1, // XRP has fast finality
      status: 'confirmed'
    };
  }

  private async getETHTransactionDetails(
    txHash: string,
    payment: PaymentAttestation
  ): Promise<CrossChainTransaction> {
    // In production, would fetch from Ethereum node
    return {
      chain: ExternalChain.ETH,
      txHash,
      from: payment.sourceAddress,
      to: payment.receivingAddress,
      amount: payment.spentAmount,
      timestamp: payment.blockTimestamp,
      confirmations: 12, // Placeholder
      status: 'confirmed'
    };
  }

  private getVerifierUrl(chain: ExternalChain): string | null {
    const urls = FDC_VERIFIER_URLS[this.chainId as keyof typeof FDC_VERIFIER_URLS];
    if (!urls) return null;
    return urls[chain] || null;
  }

  // Get proof for cross-chain data
  async getAttestationProof(
    attestationType: AttestationType,
    chain: ExternalChain,
    requestData: any
  ): Promise<string | null> {
    try {
      const verifierUrl = this.getVerifierUrl(chain);
      if (!verifierUrl) return null;

      const response = await axios.post(
        `${verifierUrl}/${attestationType}/prepareRequest`,
        requestData,
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'VALID') {
        // Get the Merkle proof
        const proofResponse = await axios.get(
          `${verifierUrl}/proof/${response.data.attestationHash}`,
          {
            headers: { 'X-API-KEY': this.apiKey }
          }
        );

        return proofResponse.data.proof;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting attestation proof:', error);
      return null;
    }
  }

  // Monitor cross-chain bridges
  async monitorBridgeTransaction(
    sourceChain: ExternalChain,
    destChain: ExternalChain,
    txHash: string
  ): Promise<{
    sourceVerified: boolean;
    destVerified: boolean;
    bridgeStatus: 'pending' | 'completed' | 'failed';
  }> {
    try {
      // Verify source transaction
      const sourceTx = await this.verifyPayment(sourceChain, txHash);
      const sourceVerified = sourceTx !== null;

      // In production, would check destination chain for corresponding transaction
      // For now, return mock data
      return {
        sourceVerified,
        destVerified: false,
        bridgeStatus: sourceVerified ? 'pending' : 'failed'
      };
    } catch (error) {
      console.error('Error monitoring bridge:', error);
      return {
        sourceVerified: false,
        destVerified: false,
        bridgeStatus: 'failed'
      };
    }
  }

  // Fetch external API data (for Web2 attestations)
  async fetchExternalAPIData(
    apiUrl: string,
    jsonPath: string
  ): Promise<any> {
    try {
      // Use JQ verifier for Web2 data
      const verifierUrl = this.chainId === 14 
        ? 'https://jq-verifier.flare.rocks'
        : 'https://jq-verifier-test.flare.rocks';

      const response = await axios.post(
        `${verifierUrl}/api/prepare`,
        {
          url: apiUrl,
          jqFilter: jsonPath
        },
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.result;
    } catch (error) {
      console.error('Error fetching external API data:', error);
      return null;
    }
  }
}

// Helper functions for common FDC operations
export async function verifyBitcoinTransaction(txHash: string, chainId: number): Promise<PaymentAttestation | null> {
  const fdcService = new FDCService(chainId);
  return fdcService.verifyPayment(ExternalChain.BTC, txHash);
}

export async function verifyXRPTransaction(txHash: string, chainId: number): Promise<PaymentAttestation | null> {
  const fdcService = new FDCService(chainId);
  return fdcService.verifyPayment(ExternalChain.XRP, txHash);
}

export async function getMultiChainBalance(
  address: string,
  chains: ExternalChain[],
  chainId: number
): Promise<Record<ExternalChain, string>> {
  const fdcService = new FDCService(chainId);
  const balances: Record<ExternalChain, string> = {} as any;

  await Promise.all(
    chains.map(async (chain) => {
      const balance = await fdcService.verifyBalance(chain, address);
      balances[chain] = balance?.balance || '0';
    })
  );

  return balances;
}