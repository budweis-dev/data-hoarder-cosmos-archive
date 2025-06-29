
# Hardhat Local Development Setup

## Rychlý start

1. **Spusť Hardhat node v jednom terminálu:**
```bash
npx hardhat node
```

2. **V druhém terminálu nasaď contracts:**
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. **Aktualizuj adresy contractů:**
Po nasazení se vytvoří soubor `contract-addresses.json`. Zkopíruj adresy do `src/config/web3.ts`:
```typescript
export const CONTRACTS = {
  DATA_HOARDER_ARENA: 'ADRESA_Z_contract-addresses.json',
  FORUM_VOTING: 'ADRESA_Z_contract-addresses.json',
};
```

4. **Nastav MetaMask:**
- Přidej Custom RPC network
- Network Name: "Hardhat Local"
- RPC URL: http://127.0.0.1:8545
- Chain ID: 1337
- Currency Symbol: ETH

5. **Importuj test účet do MetaMask:**
Hardhat vytvoří účty s těmito private keys (obsahují testovací ETH):
```
Account #0: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Account #1: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

## Užitečné příkazy

```bash
# Spustit Hardhat node
npx hardhat node

# Nasadit contracts
npx hardhat run scripts/deploy.js --network localhost

# Zkompilovat contracts
npx hardhat compile

# Vyčistit cache
npx hardhat clean
```

## Změny v konfiguraci

Pro přepnutí na lokální síť aktualizuj `src/config/web3.ts`:
- Změň `SEPOLIA_CHAIN_ID` na `1337`
- Změň RPC URL na `http://127.0.0.1:8545`
- Aktualizuj adresy contractů z `contract-addresses.json`

## Testování

Po nasazení můžeš:
1. Připojit MetaMask k lokální síti
2. Registrovat hráče
3. Nahrávat soubory
4. Vytvářet návrhy ve fóru
5. Hlasovat

Všechny transakce budou rychlé a zdarma na lokální síti!
