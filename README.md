# 🔥 FlareScanAI - AI-Powered Cross-Chain Explorer for Flare

<div align="center">
  <img src="/public/FSlogo.svg" alt="FlareScanAI Logo" width="120" />
  <h3>The Most Comprehensive Cross-Chain Explorer Powered by Flare's Data Protocols</h3>
  <p>Built for the Flare Hackathon 2024</p>
</div>

## 🚀 Project Overview

FlareScanAI is an AI-powered blockchain explorer that leverages all three of Flare's core protocols (FTSO, FDC, FAssets) to create the most comprehensive cross-chain analytics platform. It's not just another block explorer - it's a data aggregation powerhouse that brings external blockchain data on-chain and provides intelligent insights.

### 🎯 Key Features

- **Universal Cross-Chain Search**: Paste ANY transaction hash from Bitcoin, Ethereum, XRP, or Dogecoin - our AI automatically detects the chain and analyzes it
- **Real-Time FTSO Integration**: Live price feeds with historical data for 18+ trading pairs
- **FDC-Powered Verification**: Verify transactions on external blockchains with cryptographic proofs
- **FAssets Analytics**: Monitor synthetic asset minting, redemption, and collateralization
- **AI-Powered Insights**: Get intelligent transaction analysis with visual flow diagrams
- **Multi-Chain Portfolio Tracking**: Aggregate holdings across all supported chains

## 🛠️ Technical Architecture

### Core Technologies
- **Frontend**: Next.js 15, React 18, TypeScript, TailwindCSS
- **Blockchain**: Ethers.js, Viem for multi-chain support
- **AI**: OpenAI GPT-4 for intelligent analysis
- **Data Visualization**: Chart.js, Mermaid diagrams, Framer Motion
- **Flare Protocols**: FTSO V2, FDC attestations, FAssets bridge


## 🌟 Unique Value Propositions

### For Users
- **One Search, Any Chain**: No need to know which blockchain - just paste and analyze
- **Real-Time Insights**: Live data from FTSO oracles integrated into every transaction
- **Risk Assessment**: AI evaluates transaction complexity and security risks
- **Cross-Chain Verification**: Verify external blockchain transactions without leaving Flare

### For Developers
- **Ready-to-Use Components**: Reusable React components for FTSO, FDC, and FAssets
- **API Integration Examples**: Complete code samples for all Flare protocols
- **TypeScript Support**: Fully typed interfaces for all Flare interactions
- **Open Source**: Fork and build your own data-driven dApps

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- OpenAI API key for AI features

### Installation
```bash
# Clone the repository
git clone https://github.com/0xsy3/flarescan.git
cd flarescan

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your OpenAI API key

# Run the development server
npm run dev

# Open http://localhost:3001
```

### Environment Variables
```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_FDC_API_KEY=default_api_key  # Optional: For FDC verifier access
```

## 📊 Live Demo Features

### 1. Explorer View
- Real-time block and transaction monitoring
- AI-powered transaction analysis with flow diagrams
- Automatic Flare ecosystem feature detection

### 2. FTSO Oracle Dashboard
- Live price feeds for 18+ trading pairs
- Historical price charts
- Integration code examples

### 3. Cross-Chain Explorer
- Search Bitcoin, Ethereum, XRP, Dogecoin transactions
- FDC-powered verification
- Attestation proof visualization

### 4. FAssets Analytics
- Total Value Locked (TVL) tracking
- Collateralization health monitoring
- Agent performance metrics

## 💡 Our Experience Building on Flare

### The Good Stuff 🎉
Building on Flare has been an eye-opening experience. Coming from traditional blockchain development, the ability to natively access external data without relying on third-party oracles is a game-changer. The FTSO system is incredibly elegant...getting price feeds with 3.5second updates directly from the blockchain feels like magic compared to dealing with Chainlink nodes or API rate limits.

The FDC completely changed how we think about cross chain interactions. Instead of building complex bridge infrastructure, we can simply verify external transactions with cryptographic proofs. This opened up possibilities we didn't even consider initially.. like our universal search feature that works across any blockchain.

### The Challenges 😅
Let's be honest - the documentation could use some love. We spent a good chunk of time digging through GitHub repos and Discord channels to understand how to properly format FTSO feed IDs (those bytes21 parameters were tricky!). The testnet faucets were sometimes temperamental, and we had to get creative with our testing approach.

WebSocket connections for realtime FTSO updates weren't as straightforward as expected, so we implemented a hybrid approach with polling as a fallback. Also, FAssets are still relatively new, so finding comprehensive examples was challenging... ended up reverse-engineering some contracts to understand the flow better.

### The "Aha!" Moments 💡

1. **Realizing FDC could verify ANY external data**: We started thinking just about blockchain transactions, but then realized we could attestate API data, weather information, sports scores, anything! This led to some crazy brainstorming sessions about prediction markets and parametric insurance.

2. **FTSO + AI = Magic**: Combining realtime price feeds with AI analysis created insights we didn't expect. The AI can now understand market context and provide warnings about potential sandwich attacks or unusual price movements.

3. **FAssets are DeFi's missing piece**: The ability to bring BTC and XRP into DeFi without centralized bridges is huge. We're already planning v2 features around yield optimization strategies using FAssets.


### Future Plans
This hackathon project is just the beginning. We're planning to:
- Add more chains to our universal search 
- Build automated trading strategies using FTSO feeds
- Create a FAssets yield aggregator
- Implement cross-chain NFT verification
- Launch a developer SDK for easier Flare integration

### Final Thoughts
Flare is solving real problems that we've struggled with for years. The ability to trustlessly access external data opens up use cases that were previously impossible or required complex, centralized infrastructure. Yes, it's still early, and yes, there are rough edges, but the potential is enormous.

We came for the hackathon bounty (let's be real 😄), but we're staying for the technology. Flare isn't just another L1 it's it's a fundamental piece of infrastructure that the multichain future needs.

## 🤝 Contributing

We welcome contributions! Please feel free to submit pull requests or open issues. Areas we'd love help with:
- Additional chain support for FDC
- More FTSO data feed integrations
- UI/UX improvements
- Documentation and examples

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Flare Network team for creating this incredible infrastructure
- Flare developer community for their support and guidance
- OpenAI for powering our intelligent analysis
