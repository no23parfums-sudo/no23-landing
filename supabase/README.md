# Supabase — Library Foundation

Migrations are the physical translation of
`docs/library/odd-v1.1/NO23_ODD_v1.1.md`.

## Commands

```bash
# Link to the existing remote project (once)
npx supabase link --project-ref <project-ref>

# Push migrations
npx supabase db push

# Regenerate TypeScript types from the linked project
npm run supabase:types
```

## Seed

Generic seed infrastructure lives under `supabase/seed/`.
Do not place perfume-specific hardcoding in application code.
Pilot datasets are JSON documents loaded by the seed runner.
