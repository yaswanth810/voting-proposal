# Decentralized Voting System

A modern, secure, and transparent blockchain-based voting platform built with React, TypeScript, and Ethereum integration.

## 🚀 Features

### Core Functionality
- **Wallet Integration**: MetaMask connection with automatic network switching to Sepolia testnet
- **Proposal Management**: Create, view, and manage voting proposals with rich descriptions
- **Secure Voting**: One vote per registered address with permanent, transparent results
- **Real-time Updates**: Live vote counting and proposal status updates
- **Admin Dashboard**: Comprehensive admin panel for voter registration and system management

### User Interface
- **Modern Design**: Glassmorphism UI with smooth animations and micro-interactions
- **Responsive Layout**: Mobile-first design that works on all devices
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Interactive Charts**: Beautiful data visualization for voting results
- **Loading States**: Skeleton screens and loading indicators for better UX

### Security & Transparency
- **Smart Contract**: Fully auditable Solidity contract with comprehensive access controls
- **Input Validation**: Client-side and contract-level validation for all inputs
- **Error Handling**: Comprehensive error management with user-friendly messages
- **Transaction Tracking**: Real-time transaction status and confirmation tracking

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom components
- **Blockchain**: Ethers.js for Ethereum Sepolia testnet integration
- **State Management**: React Context API with useReducer
- **UI Components**: Custom components with Lucide React icons
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with validation
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voting-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Install MetaMask browser extension
   - Switch to Sepolia testnet
   - Get test ETH from Sepolia faucet

4. **Deploy Smart Contract** (Optional - for development)
   ```bash
   # Deploy the VotingSystem.sol contract to Sepolia testnet
   # Update CONTRACT_ADDRESS in src/contexts/ContractProvider.tsx
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Smart Contract Setup
1. Deploy the `VotingSystem.sol` contract to Sepolia testnet
2. Update the `CONTRACT_ADDRESS` in `src/contexts/ContractProvider.tsx`
3. Ensure the contract ABI matches the deployed contract

### Network Configuration
The application is configured for Sepolia testnet:
- Chain ID: 11155111
- RPC URL: Sepolia Infura endpoint
- Block Explorer: https://sepolia.etherscan.io/

## 📱 Usage

### For Voters
1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Registration**: Admin must register your address before you can vote
3. **Browse Proposals**: View all active and past proposals
4. **Cast Votes**: Vote "Yes" or "No" on active proposals
5. **View Results**: See real-time results and analytics

### For Admins
1. **Access Admin Panel**: Navigate to `/admin` (requires admin privileges)
2. **Register Voters**: Add individual voters or bulk register multiple addresses
3. **Create Proposals**: Create new voting proposals with descriptions and durations
4. **Manage System**: Add/remove admins and end proposals early if needed

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Modal, Toast, etc.)
│   ├── Header.tsx       # Navigation header
│   ├── ProposalCard.tsx # Individual proposal display
│   ├── VotingPanel.tsx  # Voting interface
│   └── ...
├── contexts/            # React Context providers
│   ├── WalletProvider.tsx    # Wallet connection management
│   ├── ContractProvider.tsx  # Smart contract interactions
│   └── ThemeProvider.tsx     # Theme management
├── pages/               # Main application pages
│   ├── Dashboard.tsx    # Home page with overview
│   ├── Proposals.tsx    # All proposals listing
│   └── Results.tsx      # Voting results and analytics
├── types/               # TypeScript type definitions
├── lib/                 # Utility functions
└── contracts/           # Smart contract files
```

## 🔐 Smart Contract Functions

### Voter Functions
- `registerVoter(address)` - Register a new voter (admin only)
- `vote(proposalId, voteChoice)` - Cast a vote on a proposal
- `hasVoted(proposalId, address)` - Check if address has voted
- `isRegisteredVoter(address)` - Check voter registration status

### Proposal Functions
- `createProposal(title, description, duration, category)` - Create new proposal (admin only)
- `getProposal(id)` - Get proposal details
- `getActiveProposals()` - Get all active proposal IDs
- `getProposalResults(id)` - Get voting results for a proposal

### Admin Functions
- `addAdmin(address)` - Add new admin (admin only)
- `removeAdmin(address)` - Remove admin privileges (admin only)
- `endProposal(id)` - End a proposal early (admin only)

## 🚀 Deployment

### Frontend Deployment
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to hosting service** (Vercel, Netlify, etc.)
   ```bash
   # Example for Vercel
   vercel --prod
   ```

### Smart Contract Deployment
1. **Compile contract**
   ```bash
   # Using Hardhat, Truffle, or Remix
   ```

2. **Deploy to Sepolia**
   ```bash
   # Deploy using your preferred tool
   # Save the contract address
   ```

3. **Update frontend configuration**
   - Update `CONTRACT_ADDRESS` in `ContractProvider.tsx`
   - Verify ABI matches deployed contract

## 🧪 Testing

### Manual Testing Checklist
- [ ] Wallet connection and disconnection
- [ ] Network switching to Sepolia
- [ ] Voter registration (admin function)
- [ ] Proposal creation (admin function)
- [ ] Voting on active proposals
- [ ] Results visualization
- [ ] Mobile responsiveness
- [ ] Theme switching

### Test Accounts
Use these test scenarios:
1. **Admin Account**: Deploy contract and test admin functions
2. **Voter Account**: Register and test voting functionality
3. **Unregistered Account**: Test access restrictions

## 🔍 Troubleshooting

### Common Issues

**"Missing revert data" error**
- Ensure contract is deployed and address is correct
- Check if wallet is connected to Sepolia testnet
- Verify contract ABI matches deployed version

**Transaction failures**
- Check gas limits and network congestion
- Ensure sufficient ETH balance for gas fees
- Verify function parameters are correct

**Wallet connection issues**
- Install/update MetaMask extension
- Clear browser cache and cookies
- Check network configuration

### Debug Mode
Enable debug mode by setting:
```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenZeppelin for smart contract security patterns
- Tailwind CSS for the utility-first CSS framework
- Ethers.js for Ethereum integration
- React community for excellent tooling and libraries

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review smart contract documentation

---

**⚠️ Disclaimer**: This is a demonstration application. For production use, conduct thorough security audits and testing.
