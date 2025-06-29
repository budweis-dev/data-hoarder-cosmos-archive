
# Database Migrations

Tato složka je připravena pro budoucí PostgreSQL migrace.

## Struktura

```
migrations/
├── 001_initial_schema.sql
├── 002_add_user_tables.sql
├── 003_add_contract_references.sql
└── README.md
```

## Plánované migrace

1. **Initial Schema** - Základní tabulky pro uživatele a kontrakty
2. **User Tables** - Rozšířené informace o uživatelích
3. **Contract References** - Vazby na blockchain data
4. **File Metadata** - Metadata nahraných souborů
5. **Analytics** - Tabulky pro statistiky a analytics

## Integrace s Supabase

Migrace budou kompatibilní s Supabase PostgreSQL:
- Row Level Security (RLS) policies
- Real-time subscriptions
- Edge functions integrace
- API generování

## Příklad migrace

```sql
-- 001_initial_schema.sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_address TEXT UNIQUE NOT NULL,
  contract_type TEXT NOT NULL,
  network TEXT NOT NULL,
  deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
