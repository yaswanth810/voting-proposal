# Troubleshooting Guide

## MetaMask Circuit Breaker Error

### Error Message:
```
"Execution prevented because the circuit breaker is open"
```

### Root Causes:
1. **Too many failed transactions** - MetaMask blocks further requests
2. **Voter not registered** - Transaction fails before execution
3. **Already voted** - Attempting to vote twice on same proposal
4. **Proposal ended** - Voting on expired proposal
5. **Network congestion** - Sepolia testnet issues

### Solutions:

#### 1. Reset MetaMask (Most Effective)
```
MetaMask → Settings → Advanced → Reset Account
```
This clears pending transactions and resets the nonce counter.

#### 2. Check Voter Registration
Before voting, ensure you're registered:
1. Go to Admin Dashboard
2. Use `registerVoter(your_address)` function
3. Wait for transaction confirmation

#### 3. Verify Voting Eligibility
- Check if you've already voted on this proposal
- Ensure proposal is still active (not ended)
- Confirm you're on Sepolia testnet

#### 4. Manual Transaction Reset
If reset doesn't work:
1. MetaMask → Settings → Advanced → Customize transaction nonce
2. Enable "Customize transaction nonce"
3. Send a 0 ETH transaction to yourself with higher gas
4. This clears stuck transactions

#### 5. Alternative Solutions
- Switch to different MetaMask account
- Clear browser cache and cookies
- Restart browser completely
- Try different browser or incognito mode

### Prevention:
- Always register as voter before attempting to vote
- Check proposal status before voting
- Don't spam transaction buttons
- Wait for confirmations between transactions

## Common Voting Issues

### "You must be registered as a voter first"
**Solution:** Go to Admin Dashboard → Register Voter → Enter your address

### "You have already voted on this proposal"
**Solution:** Each address can only vote once per proposal

### "This proposal has already ended"
**Solution:** Check proposal end time, create new proposal if needed

### "Please switch to Sepolia testnet"
**Solution:** 
1. MetaMask → Network dropdown
2. Select "Sepolia test network"
3. If not available, add manually:
   - Network Name: Sepolia
   - RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
   - Chain ID: 11155111
   - Currency: ETH

## Gas Issues

### "Insufficient funds for gas"
**Solution:** Get Sepolia ETH from faucets:
- https://sepoliafaucet.com/
- https://faucets.chain.link/sepolia

### "Gas estimation failed"
**Solution:** 
- Increase gas limit manually
- Check if function call is valid
- Ensure contract is deployed correctly

## Contract Issues

### "Contract not found"
**Solution:** Verify contract address in ContractProvider.tsx:
```
CONTRACT_ADDRESS = "0xF6bc8b2B574194a899302047b9c95967514a7611"
```

### "Function not found"
**Solution:** Ensure ABI matches deployed contract

## Network Issues

### "Network error"
**Solution:**
- Check internet connection
- Try different RPC endpoint
- Wait for network congestion to clear

## Testing Workflow

### Recommended Testing Order:
1. **Connect Wallet** → Ensure Sepolia network
2. **Register as Voter** → Admin Dashboard
3. **Create Proposal** → Short duration for testing
4. **Vote on Proposal** → Test both YES/NO votes
5. **Check Results** → Verify vote counting
6. **Test Admin Functions** → Add voters, end proposals

### Debug Steps:
1. Open browser console (F12)
2. Check for JavaScript errors
3. Monitor network requests
4. Verify transaction hashes on Etherscan
