
# GitHub Pages Deployment Setup

Tento projekt je nakonfigurován pro automatické nasazení na GitHub Pages s využitím GitHub Actions.

## Nastavení

### 1. GitHub Secrets
V nastavení vašeho GitHub repozitáře přidejte tyto secrets:

- `SEPOLIA_PRIVATE_KEY` - Private key vašeho Ethereum účtu pro deploy kontraktů
- `INFURA_API_KEY` - API klíč z Infura pro přístup k Sepolia síti (to samé jako Project ID)
- `ETHERSCAN_API_KEY` - API klíč pro verifikaci kontraktů (volitelné)

### 2. Získání Infura API Key
1. Jděte na [infura.io](https://infura.io) a vytvořte účet
2. Vytvořte nový projekt
3. V Dashboard vašeho projektu najdete "API Key" - to je hodnota, kterou použijete jako `INFURA_API_KEY`

### 3. GitHub Pages
1. Jděte do Settings > Pages
2. Zvolte "GitHub Actions" jako Source
3. Volitelně nastavte custom domain v souboru `.github/workflows/deploy.yml`

## Jak to funguje

### Automatický Deploy Pipeline
1. **Trigger**: Push do `main` branche
2. **Deploy kontraktů**: Nasadí smart kontrakty na Sepolia testnet
3. **Aktualizace konfigurace**: Automaticky aktualizuje adresy kontraktů v aplikaci
4. **Build aplikace**: Sestaví React aplikaci pro produkci
5. **Deploy na GitHub Pages**: Nasadí aplikaci na GitHub Pages

### Struktura Pipeline
```
deploy-contracts (job 1)
├── Compile contracts
├── Deploy to Sepolia
├── Update web3 config
└── Upload artifacts

deploy-app (job 2)
├── Download contract artifacts
├── Build React app
└── Deploy to GitHub Pages
```

## Lokální vývoj

Pro lokální vývoj stále můžete používat Hardhat:

```bash
# Spustit lokální síť
npx hardhat node

# Nasadit kontrakty lokálně
npx hardhat run scripts/deploy.js --network localhost
```

## Soubory konfigurací

- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `scripts/deploy-sepolia.js` - Deploy script pro Sepolia
- `scripts/update-config.js` - Aktualizace web3 konfigurace
- `hardhat.config.js` - Hardhat konfigurace s Sepolia sítí
- `vite.config.ts` - Vite konfigurace pro GitHub Pages

## Budoucí rozšíření

Struktura je připravena pro:
- PostgreSQL migrace v `migrations/` složce
- Supabase integrace pro backend
- Další testovací sítě
- Custom domain setup

## Troubleshooting

1. **Kontrakty se nenasadí**: Zkontrolujte GitHub Secrets
2. **Build failuje**: Zkontrolujte konzoli v GitHub Actions
3. **GitHub Pages nefunguje**: Zkontrolujte Pages nastavení v repozitáři

## Poznámka k Infura
Infura používá termín "API Key", který je stejný jako "Project ID". Váš Infura API Key funguje jako identifikátor projektu v URL endpointech.
