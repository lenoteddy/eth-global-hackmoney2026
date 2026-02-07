# OmniDeposit

Enable users to seamlessly deposit assets across multiple chains.

---

## 🚀 Overview

OmniDeposit allows users to deposit assets from a source chain to a destination chain in a single streamlined flow.

The project leverages Li.Fi Composer technology to bundle multiple actions into one transaction. Assets are bridged cross-chain and automatically deposited into a DeFi protocol — in this implementation, the Aave protocol.

To improve usability, ENS is integrated to simplify Ethereum address recognition and eliminate the need to manually handle long hexadecimal addresses.

---

## 💡 Problem

Cross-chain DeFi interactions are complex:

- Users must manually bridge assets
- Then separately deposit into DeFi protocols
- Transactions require multiple steps
- Ethereum addresses are difficult to read and verify

This complexity increases friction and risk for users.

---

## ✅ Solution

OmniDeposit streamlines the entire process into one unified flow:

- Bridge assets across chains
- Automatically deposit into Aave
- Return vault tokens directly to the user
- Support ENS names for simplified address input

Users only initiate one transaction — Li.Fi Composer handles the orchestration behind the scenes.

---

## 🛠 How It’s Built

### Frontend

- Vite + React template

### Cross-Chain Infrastructure

- Li.Fi Composer for cross-chain transaction bundling

### DeFi Integration

- Aave Protocol for asset deposits

### Identity Layer

- ENS (Ethereum Name Service) for human-readable address mapping

---

## ⚙️ How It Works

1. User selects source network and token
2. User selects destination network and token
3. User enters send amount or receive amount
4. (optional) User enters recipient address (supports ENS names like `vitalik.eth`)
5. User reads confirmation text
6. User clicks the 'Submit Transaction' button
7. (optional) User can check the transaction history
8. Li.Fi:
    - Bridges the asset
    - Deposits into Aave vault on destination chain
    - Returns vault token to the user

---

## 🔗 Technologies Used

- React
- Vite
- Li.Fi Composer
- ENS
- Aave Protocol

---

## 🧠 Why Li.Fi?

Li.Fi enables bundling multiple cross-chain and on-chain actions into a single transaction:

- Bridge asset
- Deposit into DeFi protocol
- Return vault token

Without forcing users to manually execute each step.

---

## 🏷 Why ENS?

ENS maps human-readable names (e.g., `vitalik.eth`) to Ethereum addresses (`0x...`).

This reduces:

- Input errors
- Address confusion
- UX friction

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/lenoteddy/eth-global-hackmoney2026.git
cd eth-global-hackmoney2026
```

### Install dependencies

```bash
npm install --legacy-peer-deps
```

### Run locally

```bash
npm run dev
```

---

## 🔮 Future Improvements

- Support additional DeFi protocols
- Support more networks
- Gas efficiency improvements

---

## 👤 Author

Built during "ETH Global HackMoney 2026" hackathon by:

Teddy Leno
