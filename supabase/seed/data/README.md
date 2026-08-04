# Library seed data

Place one JSON file per perfume pilot document here (ODD field names).
Register each file in `../manifest.json`.

## Current pilots

| Slot | File | Status |
| --- | --- | --- |
| `PILOT_PERFUME_1` | `pilot_perfume_1.json` | Prepared from ODD `03_Piloto_BDC_EDP` — **do not seed until confirmed** |

## Apply (after confirmation)

```bash
# 1. Apply migrations (Supabase linked project or local)
# 2. Then:
NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:library
```

Only fields explicit on the pilot sheet (plus required ODD system/calculated fields documented in the JSON `_notes`) are populated. Everything else stays null.
