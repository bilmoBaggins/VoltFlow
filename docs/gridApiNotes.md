# Notes — Getting Grid Data (Hit the APIs)

Practical cheat sheet for the VoltFlow **Grid module**. Free public APIs. No auth keys needed for these endpoints.

---

## What we need

| Data | Why | API |
| :--- | :--- | :--- |
| Carbon intensity (gCO₂/kWh) | AI “clean vs dirty grid” + carbon chart | NESO Carbon Intensity |
| Electricity unit price (p/kWh) | AI “cheap vs expensive” + price chart | Octopus Energy Agile |

**Demo default region:** London = Octopus region code **`C`**.

---

## 1. Carbon Intensity (free, no key)

### Base URL
```
https://api.carbonintensity.org.uk
```

### Docs
- https://carbon-intensity.github.io/api-definitions/
- Terms: free, CC BY 4.0, do not hammer (cache responses)

### Hit current national intensity
```bash
curl -s https://api.carbonintensity.org.uk/intensity | jq
```

### Example response (shape)
```json
{
  "data": [
    {
      "from": "2026-07-24T13:00Z",
      "to": "2026-07-24T13:30Z",
      "intensity": {
        "forecast": 185,
        "actual": 192,
        "index": "moderate"
      }
    }
  ]
}
```

### Useful fields
| Field | Use in VoltFlow |
| :--- | :--- |
| `intensity.actual` | Prefer this if present |
| `intensity.forecast` | Fallback if actual is null |
| `intensity.index` | `very low` / `low` / `moderate` / `high` / `very high` |

### Other useful calls
```bash
# Today’s half-hours
curl -s https://api.carbonintensity.org.uk/intensity/date

# Generation mix (optional stretch)
curl -s https://api.carbonintensity.org.uk/generation
```

### Normalize for our API (`GET /grid/carbon`)
```json
{
  "gramsPerKwh": 192,
  "index": "moderate",
  "from": "2026-07-24T13:00Z",
  "to": "2026-07-24T13:30Z",
  "source": "neso",
  "fetchedAt": "2026-07-24T13:05:00Z"
}
```

### Beginner thresholds (for AI policy)
| Index / value | Treat as |
| :--- | :--- |
| `very low` / `low` OR &lt; ~100 g | **Clean** |
| `moderate` | OK |
| `high` / `very high` OR &gt; ~200 g | **Dirty** → prefer WAIT if battery OK |

Tune numbers later; keep them in config/env.

---

## 2. Octopus Agile price (free, no key for public tariffs)

### Base URL
```
https://api.octopus.energy/v1
```

### Important
- `GET /products/` = list of **products** (not regions)
- Regions are on the **product detail** + tariff code suffix (`A`–`P`, no `I`)
- Personal meter data needs an API key — **we do not need that**

### Step A — list products
```bash
curl -s https://api.octopus.energy/v1/products/ | jq '.results[] | {code, display_name, direction}'
```

Use product (from current catalogue):
```
AGILE-24-10-01
```
(If Octopus renames products later, pick the latest `AGILE-*` import product.)

### Step B — product detail (find regional tariffs)
```bash
curl -s https://api.octopus.energy/v1/products/AGILE-24-10-01/ | jq
```

Look for keys like `_C` under electricity tariffs. Tariff code pattern:
```
E-1R-AGILE-24-10-01-C
│ │  │                 │
│ │  product           region C = London
│ single register electricity
```

### Step C — optional: region from postcode
```bash
curl -s "https://api.octopus.energy/v1/industry/grid-supply-points/?postcode=SW1A1AA" | jq
```
Returns something like `"group_id": "_C"` → use region **C**.

### UK region codes (GSP)
| Code | Location |
| :--- | :--- |
| A | Eastern England |
| B | East Midlands |
| C | London |
| D | Merseyside & North Wales |
| E | West Midlands |
| F | North Eastern England |
| G | North Western England |
| H | Southern England |
| J | South Eastern England |
| K | South Wales |
| L | South Western England |
| M | Yorkshire |
| N | Southern Scotland |
| P | Northern Scotland |

### Step D — hit half-hourly unit rates
```bash
# London Agile example — adjust PRODUCT + TARIFF if codes change
PRODUCT=AGILE-24-10-01
TARIFF=E-1R-AGILE-24-10-01-C

curl -s "https://api.octopus.energy/v1/products/${PRODUCT}/electricity-tariffs/${TARIFF}/standard-unit-rates/?page_size=48" | jq
```

Optional time window:
```bash
curl -s "https://api.octopus.energy/v1/products/${PRODUCT}/electricity-tariffs/${TARIFF}/standard-unit-rates/?period_from=2026-07-24T00:00Z&period_to=2026-07-25T00:00Z&page_size=100" | jq
```

### Example rate item (shape)
```json
{
  "value_exc_vat": 12.5,
  "value_inc_vat": 13.125,
  "valid_from": "2026-07-24T12:00:00Z",
  "valid_to": "2026-07-24T12:30:00Z"
}
```

Use **`value_inc_vat`** (pence per kWh) for demos.

### Normalize for our API (`GET /grid/price`)
```json
{
  "region": "C",
  "regionName": "London",
  "productCode": "AGILE-24-10-01",
  "tariffCode": "E-1R-AGILE-24-10-01-C",
  "unit": "p/kWh",
  "rates": [
    {
      "gbpPerKwh": 0.13125,
      "pencePerKwh": 13.125,
      "periodStart": "2026-07-24T12:00:00Z",
      "periodEnd": "2026-07-24T12:30:00Z"
    }
  ],
  "source": "octopus",
  "fetchedAt": "2026-07-24T13:05:00Z"
}
```

### Beginner thresholds (for AI policy)
| Price (inc VAT) | Treat as |
| :--- | :--- |
| Low (e.g. &lt; 15 p/kWh) | **Cheap** → prefer CHARGE |
| Mid | OK |
| High (e.g. &gt; 30 p/kWh) | **Expensive** → prefer WAIT if battery OK |

Put thresholds in env (`PRICE_LOW_PENCE`, `PRICE_HIGH_PENCE`).

---

## 3. Combined snapshot (what AI + charts should call)

Our backend facade (recommended):

```http
GET /grid/snapshot
```

```json
{
  "carbon": { "gramsPerKwh": 192, "index": "moderate" },
  "price": { "pencePerKwh": 13.125, "periodStart": "...", "periodEnd": "..." },
  "region": "C",
  "fetchedAt": "..."
}
```

Implementation tip: `/grid/snapshot` calls carbon + current Agile half-hour internally (or serves cache).

---

## 4. Coding tips (Grid module)

1. **Cache** carbon + price for 5–30 minutes (don’t call Octopus every UI poll).
2. Always ship **mock JSON fallback** if upstream fails (demo must never die).
3. Set headers politely:
   ```http
   Accept: application/json
   User-Agent: VoltFlow-Intern-Project/1.0
   ```
4. Handle pagination on Octopus (`next` URL) if you request long ranges.
5. Convert pence → £: `gbpPerKwh = pencePerKwh / 100`.
6. Store `GRID_REGION=C` and `OCTOPUS_PRODUCT=AGILE-24-10-01` in `.env`.

### Env example
```env
GRID_REGION=C
OCTOPUS_PRODUCT=AGILE-24-10-01
OCTOPUS_TARIFF=E-1R-AGILE-24-10-01-C
GRID_CACHE_TTL_SECONDS=300
GRID_USE_MOCK=false
PRICE_LOW_PENCE=15
PRICE_HIGH_PENCE=30
```

---

## 5. Quick test checklist (QA / Data role)

- [ ] `curl` carbon returns `intensity`
- [ ] `curl` Agile rates returns `results` array
- [ ] Region `C` tariff code resolves (404 means product/tariff renamed — re-check product detail)
- [ ] Mock mode works with Wi‑Fi off / bad URL
- [ ] Frontend chart gets at least ~24–48 points for a day view
- [ ] `/grid/snapshot` returns both carbon + current price

---

## 6. Common mistakes

| Mistake | Fix |
| :--- | :--- |
| Expecting regions on `/products/` | Regions are on product detail / tariff suffix |
| Using export Agile for charging cost | Use **IMPORT** Agile product |
| No cache → rate limits / slow UI | Cache in Grid module |
| Demo fails when API down | Mock fallback |
| Mixing pence and pounds in AI prompt | State units clearly in prompt + schema |

---

## 7. Minimal Node fetch examples

### Carbon
```js
const res = await fetch("https://api.carbonintensity.org.uk/intensity");
const json = await res.json();
const row = json.data[0];
const grams = row.intensity.actual ?? row.intensity.forecast;
```

### Octopus rates
```js
const product = process.env.OCTOPUS_PRODUCT;
const tariff = process.env.OCTOPUS_TARIFF;
const url = `https://api.octopus.energy/v1/products/${product}/electricity-tariffs/${tariff}/standard-unit-rates/?page_size=48`;
const res = await fetch(url);
const json = await res.json();
const rates = json.results; // newest-first usually — sort by valid_from if needed
```

---

## Owner

| Role | Owns |
| :--- | :--- |
| Data / Realtime | Grid clients, cache, mocks, `/grid/*` |
| QA | Postman collection for carbon + Octopus + our facades |
| AI | Consumes `/grid/snapshot` only (don’t call Octopus from AI module) |
| Automation | Optional: alert if grid fetch fails repeatedly |
