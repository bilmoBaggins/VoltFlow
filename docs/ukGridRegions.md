# UK Grid Regions (Octopus Agile tariff codes)

Use the EV’s `location.gridRegion` letter as the **tariff suffix**.

**Tariff pattern**
```text
E-1R-AGILE-24-10-01-{REGION}
```

Example: London van with `"gridRegion": "C"` →  
`E-1R-AGILE-24-10-01-C`

---

## All regions (GSP group codes)

| Code | Location | Example tariff |
| :--- | :--- | :--- |
| **A** | Eastern England | `E-1R-AGILE-24-10-01-A` |
| **B** | East Midlands | `E-1R-AGILE-24-10-01-B` |
| **C** | London | `E-1R-AGILE-24-10-01-C` |
| **D** | Merseyside & North Wales | `E-1R-AGILE-24-10-01-D` |
| **E** | West Midlands | `E-1R-AGILE-24-10-01-E` |
| **F** | North Eastern England | `E-1R-AGILE-24-10-01-F` |
| **G** | North Western England | `E-1R-AGILE-24-10-01-G` |
| **H** | Southern England | `E-1R-AGILE-24-10-01-H` |
| **J** | South Eastern England | `E-1R-AGILE-24-10-01-J` |
| **K** | South Wales | `E-1R-AGILE-24-10-01-K` |
| **L** | South Western England | `E-1R-AGILE-24-10-01-L` |
| **M** | Yorkshire | `E-1R-AGILE-24-10-01-M` |
| **N** | Southern Scotland | `E-1R-AGILE-24-10-01-N` |
| **P** | Northern Scotland | `E-1R-AGILE-24-10-01-P` |

**Note:** There is **no region `I`** in Octopus GSP codes.

---

## VoltFlow Fake EVs (`gridRegion` is random)

Each `GET /vehicles` (and get-by-id / telemetry) picks a **random** `gridRegion` from the full list above (A–P, no I).

| Vehicle id | Name | Label (seed) | `gridRegion` |
| :--- | :--- | :--- | :--- |
| `ev-01` | Van A | London Depot | random each request |
| `ev-02` | Van B | Driver home | random each request |
| `ev-03` | Van C | Manchester Depot | random each request |
| `ev-04` | Van D | Glasgow route | random each request |
| `ev-05` | Van E | Bristol Depot | random each request |

Seed values in `vehicles.json` are only defaults; the API overwrites `location.gridRegion` on every response.

---

## How to build the price URL

```text
PRODUCT = AGILE-24-10-01
REGION  = vehicle.location.gridRegion   // e.g. C
TARIFF  = E-1R-AGILE-24-10-01-{REGION}

GET https://api.octopus.energy/v1/products/{PRODUCT}/electricity-tariffs/{TARIFF}/standard-unit-rates/?page_size=48
```

**Demo default:** London = **C**.

---

## Optional: region from postcode

If you only have a postcode (not `gridRegion`):

```bash
curl -s "https://api.octopus.energy/v1/industry/grid-supply-points/?postcode=SW1A1AA"
```

Response includes `"group_id": "_C"` → use region **C**.

More detail: `docs/gridApiNotes.md`.
