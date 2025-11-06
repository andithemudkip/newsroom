export interface Article {
  id: string;
  title: string;
  author: string;
  content: string;
  tags: string[];
  timestamp: string;
  walletAddress: string;
  tokenId: string;
  price: number;
}

// Mock data
export const mockArticles: Article[] = [
  {
    id: "1",
    title: "The Future of Decentralized Finance",
    author: "Alice Crypto",
    content: `# DeFi Revolution

DeFi represents a fundamental shift in how we think about financial services. By removing intermediaries and leveraging smart contracts, we can create more accessible and transparent financial systems.

## Key Benefits

- **Permissionless**: Anyone can access DeFi protocols
- **Transparent**: All transactions are on-chain
- **Composable**: Protocols can be combined like Lego blocks

## Deep Dive into DeFi Protocols

### Lending and Borrowing

Decentralized lending platforms have revolutionized how we think about credit. Unlike traditional banks that require extensive documentation and credit checks, DeFi lending protocols operate on over-collateralization principles.

Key platforms include:
- **Compound**: Algorithmic money markets
- **Aave**: Flash loans and variable interest rates
- **MakerDAO**: Decentralized stablecoin creation

### Decentralized Exchanges (DEXs)

DEXs have grown exponentially, offering users the ability to trade without intermediaries:

- **Uniswap**: Automated market maker (AMM) model
- **SushiSwap**: Community-driven DEX with yield farming
- **Curve**: Optimized for stablecoin trading

### Yield Farming and Liquidity Mining

The concept of yield farming has introduced new ways for users to earn returns on their crypto holdings. By providing liquidity to protocols, users can earn:

1. Trading fees from the pool
2. Governance tokens as rewards
3. Additional incentive tokens

## Challenges and Risks

While DeFi offers numerous advantages, it's important to understand the risks:

### Smart Contract Risk

Smart contracts are immutable once deployed, which means bugs can be exploited. Recent examples include:
- Flash loan attacks
- Oracle manipulation
- Reentrancy vulnerabilities

### Regulatory Uncertainty

The regulatory landscape for DeFi is still evolving, with different jurisdictions taking varying approaches.

### Scalability Issues

Most DeFi protocols operate on Ethereum, which faces scalability challenges:
- High gas fees during network congestion
- Limited transaction throughput
- Environmental concerns with Proof of Work

## The Road Ahead

The future looks bright for decentralized finance! We're seeing exciting developments in:

### Layer 2 Solutions

- **Polygon**: Ethereum scaling solution
- **Arbitrum**: Optimistic rollups
- **Optimism**: Another layer 2 approach

### Cross-Chain Interoperability

- **Polkadot**: Parachain architecture
- **Cosmos**: Internet of blockchains
- **Chainlink**: Cross-chain communication

### Institutional Adoption

Traditional financial institutions are beginning to explore DeFi:
- JPMorgan's JPM Coin
- Goldman Sachs crypto trading desk
- BlackRock's Bitcoin ETF

The convergence of traditional finance and DeFi (often called "TradFi meets DeFi") represents a massive opportunity for innovation and growth.

DeFi is not just a technological advancement; it's a paradigm shift towards financial sovereignty and inclusion.`,
    tags: ["defi", "blockchain", "cryptocurrency"],
    timestamp: "2024-11-06T10:30:00Z",
    walletAddress: "0x1234...5678",
    tokenId:
      "83679576525596327355512974138992486392092804660232857216239892862083372083126",
    price: 234,
  },
  {
    id: "2",
    title: "NFT Market Trends in 2024",
    author: "Bob Digital",
    content: `# NFT Market Analysis

The NFT market has evolved significantly this year. Let's look at the key trends:

## Major Developments

1. **Utility-focused NFTs** are gaining traction
2. **Gaming integration** is becoming mainstream
3. **Environmental concerns** are being addressed

## Market Statistics

The NFT market has shown remarkable resilience despite market volatility:

### Volume Trends
- Q1 2024: $2.3B in trading volume
- Q2 2024: $1.8B in trading volume  
- Q3 2024: $2.1B in trading volume

### Top Performing Categories
1. **Gaming NFTs**: 45% of total volume
2. **Profile Pictures**: 25% of total volume
3. **Digital Art**: 20% of total volume
4. **Utility NFTs**: 10% of total volume

## Utility-Focused Revolution

The market has matured beyond speculative trading. Projects now focus on real utility:

### Gaming Integration
- **Axie Infinity**: Play-to-earn mechanics
- **The Sandbox**: Virtual real estate and experiences
- **Gods Unchained**: Trading card game with true ownership

### Membership and Access
- **BAYC**: Exclusive club benefits
- **VeeFriends**: Conference access and networking
- **Proof**: Media and entertainment ecosystem

### Identity and Credentials
- **ENS Domains**: Decentralized identity
- **POAP**: Proof of attendance protocols
- **Soulbound Tokens**: Non-transferable credentials

## Environmental Progress

The shift to more sustainable blockchains has been significant:

### Ethereum's Transition
The merge to Proof of Stake reduced energy consumption by 99.95%

### Alternative Chains
- **Solana**: High throughput, low energy
- **Tezos**: Energy-efficient by design
- **Flow**: Built for NFTs and gaming

## What's Next?

The focus is shifting from speculation to real-world utility and sustainable practices.

### Emerging Trends
1. **AI-Generated Content**: Dynamic NFTs that evolve
2. **Fractionalization**: Shared ownership of high-value NFTs
3. **Cross-Chain Interoperability**: NFTs that work across blockchains
4. **Real-World Assets**: Tokenization of physical items

### Challenges Ahead
- **Regulatory Clarity**: Clearer guidelines needed
- **User Experience**: Simplifying wallet interactions
- **Scalability**: Handling mainstream adoption

The NFT space continues to innovate, with utility and sustainability at the forefront of development.`,
    tags: ["nft", "gaming", "trends"],
    timestamp: "2024-11-05T15:45:00Z",
    walletAddress: "0xabcd...efgh",
    tokenId:
      "83679576525596327355512974138992486392092804660232857216239892862083372083126",
    price: 512,
  },
  {
    id: "3",
    title: "Web3 Social Networks: A New Paradigm",
    author: "Charlie Web3",
    content: `# The Rise of Decentralized Social Media

Traditional social media platforms have centralized control over data and content. Web3 social networks offer an alternative.

## Key Features

- **Data ownership**: Users control their own data
- **Censorship resistance**: No single point of control
- **Token incentives**: Users earn for participation

## The Problems with Web2 Social Media

### Centralized Control
Traditional platforms have complete control over:
- User data and privacy
- Content moderation policies
- Algorithm transparency
- Revenue distribution

### Data Monetization Without User Benefit
- Platforms profit from user data
- Users receive no compensation
- Limited data portability
- Vendor lock-in effects

### Censorship and Content Moderation Issues
- Inconsistent policy enforcement
- Lack of transparency in decisions
- Cultural and political biases
- Limited appeals processes

## Web3 Social Network Solutions

### Decentralized Architecture

#### Protocol-Based Platforms
- **Mastodon**: Federated social networking
- **Lens Protocol**: On-chain social graph
- **Farcaster**: Decentralized social protocol

#### Benefits of Decentralization
1. **No single point of failure**
2. **Transparent governance**
3. **Composable social experiences**
4. **User-controlled algorithms**

### Data Ownership and Portability

#### User-Controlled Data
- Private keys control social identity
- Data stored on IPFS or similar
- Portable social graphs
- Self-sovereign identity

#### Benefits for Users
- Control over personal information
- Ability to monetize own content
- Freedom to switch platforms
- Reduced platform dependency

### Token Economics and Incentives

#### Creator Monetization
- **Direct fan funding**: No platform fees
- **NFT integration**: Sell content as NFTs
- **Token rewards**: Earn for quality content
- **Governance participation**: Vote on platform direction

#### Community Rewards
- **Curation rewards**: Earn for discovering content
- **Moderation incentives**: Token rewards for community moderation
- **Network effects**: Early adopter advantages

## Current Web3 Social Platforms

### Lens Protocol Ecosystem
- **Lenster**: Twitter-like interface
- **Orb**: Mobile-first experience
- **Hey**: Feature-rich social platform

### Other Notable Platforms
- **Mirror**: Long-form content publishing
- **Minds**: Free speech focused platform
- **DeSo**: Blockchain built for social media

## Challenges and Limitations

### Technical Hurdles
- **Scalability**: Blockchain limitations
- **User Experience**: Complex wallet interactions
- **Performance**: Slower than centralized alternatives
- **Storage Costs**: On-chain data is expensive

### Adoption Barriers
- **Learning Curve**: Understanding Web3 concepts
- **Network Effects**: Existing platform lock-in
- **Content Discovery**: Harder without algorithms
- **Mobile Experience**: Limited mobile apps

### Economic Challenges
- **Token Volatility**: Unstable reward systems
- **Gas Fees**: Transaction costs on Ethereum
- **Sustainable Economics**: Long-term viability questions

## The Path Forward

### Improving User Experience
1. **Simplified Onboarding**: Abstract away complexity
2. **Mobile-First Design**: Native mobile experiences
3. **Better Discovery**: Improved content algorithms
4. **Seamless Payments**: Integrated payment systems

### Building Network Effects
- **Creator Migration**: Incentivize influencer adoption
- **Cross-Platform Integration**: Bridge Web2 and Web3
- **Community Building**: Foster niche communities
- **Developer Ecosystem**: Build on open protocols

### Sustainable Economics
- **Diverse Revenue Streams**: Beyond token speculation
- **Layer 2 Solutions**: Reduce transaction costs
- **Value-Added Services**: Premium features and tools
- **Real-World Integration**: Connect to traditional media

## Conclusion

This represents a paradigm shift towards user empowerment. While challenges remain, the potential for truly user-owned social networks is compelling.

The future of social media may be decentralized, putting power back in the hands of users and creators.`,
    tags: ["web3", "social", "decentralization"],
    timestamp: "2024-11-04T09:15:00Z",
    walletAddress: "0x9876...5432",
    tokenId:
      "83679576525596327355512974138992486392092804660232857216239892862083372083126",
    price: 234,
  },
];

// Utility functions
export const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatPrice = (price: number) => {
  return price.toLocaleString();
};

export const truncateContent = (content: string, maxLength: number = 200) => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
};
