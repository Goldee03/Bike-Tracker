CREATE TABLE IF NOT EXISTS app_data (
  id INT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO app_data (id, data)
VALUES (1, '{
  "entries": {
    "2026-08-01": {"morning":13704, "evening":13714},
    "2026-08-02": {"morning":13714, "evening":13774},
    "2026-08-03": {"morning":13774, "evening":13860},
    "2026-08-04": {"morning":13860, "evening":14158, "note":"Native trip"},
    "2026-08-05": {"morning":14158, "evening":14218},
    "2026-08-06": {"morning":14218, "evening":14306},
    "2026-08-07": {"morning":14306, "evening":14390},
    "2026-08-08": {"morning":14390, "evening":14425},
    "2026-08-09": {"morning":14425, "evening":14445},
    "2026-08-10": {"morning":14445, "evening":14532},
    "2026-08-11": {"morning":14532, "evening":14655},
    "2026-08-12": {"morning":14655, "evening":14747},
    "2026-08-13": {"morning":14747, "evening":null}
  },
  "refills": [
    {"id":"f1", "date":"2026-07-30", "odometer":13674, "liters":4.00, "cost":443.72, "note":"Last fuel before tracking", "fullTank":false},
    {"id":"f2", "date":"2026-08-04", "odometer":13860, "liters":5.10, "cost":565.53, "note":"Morning full tank — auto-cut + slight top-up; native trip", "fullTank":true},
    {"id":"f3", "date":"2026-08-04", "odometer":14073, "liters":4.58, "cost":510.00, "note":"Evening full tank — return from native", "fullTank":true},
    {"id":"f4", "date":"2026-08-07", "odometer":14332, "liters":4.00, "cost":443.56, "note":"Regular 4-litre refill", "fullTank":false},
    {"id":"f5", "date":"2026-08-11", "odometer":14557, "liters":4.00, "cost":443.67, "note":"Normal partial refill", "fullTank":false},
    {"id":"f6", "date":"2026-08-13", "odometer":14747, "liters":4.00, "cost":443.56, "note":"Normal partial refill", "fullTank":false}
  ],
  "services": [
    {"id":"s1", "date":"2026-07-31", "odometer":13704, "cost":2931, "note":"Air filter change, O-ring, pad set, rear brake shoe set, ECSTAR SYN 10W-30 engine oil — pre-tracking service"}
  ],
  "expenses": [],
  "settings": {"intervalKm": 2000},
  "schemaVersion": 2
}'::jsonb)
ON CONFLICT (id) DO NOTHING;
