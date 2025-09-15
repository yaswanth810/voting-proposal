# Smart Contract Deployment Guide

## Prerequisites

1. **MetaMask Wallet** with Sepolia ETH
   - Get free Sepolia ETH from: https://sepoliafaucet.com/
   - Or: https://faucets.chain.link/sepolia

2. **Infura Account** (Free)
   - Sign up at: https://infura.io/
   - Create new project → Get Project ID

3. **Etherscan API Key** (Optional, for verification)
   - Sign up at: https://etherscan.io/apis

## Setup Steps

### 1. Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env
```

### 2. Edit .env file with your credentials:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_metamask_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**⚠️ SECURITY WARNING:**
- Never commit .env file to version control
- Use a dedicated wallet for development
- Keep private keys secure

### 3. Get Your Private Key from MetaMask:
1. Open MetaMask → Click account menu
2. Account Details → Export Private Key
3. Enter password → Copy private key
4. Paste in .env file (without 0x prefix)

### 4. Deploy Contract
```bash
# Deploy to Sepolia testnet
npm run deploy

# Or with explicit config
npx hardhat run scripts/deploy.js --network sepolia --config hardhat.config.cjs
```

### 5. Update Frontend Configuration
After successful deployment, copy the contract address and update:
- File: `src/contexts/ContractProvider.tsx`
- Line: `const CONTRACT_ADDRESS = "0x..."`

## Expected Output
```
Deploying VotingSystem contract to Sepolia testnet...
Deploying contracts with the account: 0x1234...5678
Account balance: 1000000000000000000
VotingSystem deployed to: 0xABCD...EFGH
Waiting for block confirmations...
Contract verified on Etherscan!

=== DEPLOYMENT COMPLETE ===
Contract Address: 0xABCD...EFGH
Deployer Address: 0x1234...5678
Network: Sepolia Testnet
Block Explorer: https://sepolia.etherscan.io/address/0xABCD...EFGH
```

## Troubleshooting

### Common Issues:

**"Insufficient funds"**
- Get more Sepolia ETH from faucets
- Check wallet balance

**"Invalid project ID"**
- Verify Infura project ID in .env
- Ensure RPC URL is correct

**"Private key error"**
- Remove 0x prefix from private key
- Ensure no extra spaces in .env file

**"Network error"**
- Check internet connection
- Try different RPC endpoint

## Next Steps After Deployment

1. ✅ Update CONTRACT_ADDRESS in ContractProvider.tsx
2. ✅ Test wallet connection
3. ✅ Register yourself as first voter
4. ✅ Create test proposal
5. ✅ Test voting functionality

## Contract Functions Available

### Admin Functions (Contract Deployer):
- `registerVoter(address)` - Register new voters
- `createProposal(title, description, duration, category)` - Create proposals
- `addAdmin(address)` - Add more admins
- `endProposal(id)` - End proposals early

### Voter Functions:
- `vote(proposalId, true/false)` - Cast votes
- `hasVoted(proposalId, address)` - Check voting status
- `getProposal(id)` - View proposal details

### View Functions:
- `getActiveProposals()` - List active proposals
- `getProposalResults(id)` - Get voting results
- `isRegisteredVoter(address)` - Check registration
- `isAdmin(address)` - Check admin status
