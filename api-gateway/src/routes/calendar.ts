import express from 'express';

type Currency = 'EUR' | 'USD' | 'JPY' | 'GBP';
type CatalystCategory =
  | 'CENTRAL_BANK'
  | 'INFLATION'
  | 'GROWTH'
  | 'LABOR'
  | 'EXTERNAL'
  | 'FISCAL'
  | 'POLITICS'
  | 'COMMODITIES'
  | 'MARKETS';

interface CatalystEvent {
  id: string;
  currency: Currency;
  date: string;
  title: string;
  category: CatalystCategory;
  expected?: string | number;
  previous?: string | number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  skew: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

const router = express.Router();

const currencies: Currency[] = ['EUR', 'USD', 'JPY', 'GBP'];
const calendars: Record<Currency, CatalystEvent[]> = {
  EUR: [],
  USD: [],
  JPY: [],
  GBP: []
};

// GET /api/v1/calendar/:currency
router.get('/:currency', (req, res) => {
  const c = (req.params.currency || '').toUpperCase() as Currency;
  if (!currencies.includes(c)) return res.status(400).json({ error: 'Unsupported currency' });
  return res.json(calendars[c]);
});

// POST /api/v1/calendar/:currency
router.post('/:currency', (req, res) => {
  const c = (req.params.currency || '').toUpperCase() as Currency;
  if (!currencies.includes(c)) return res.status(400).json({ error: 'Unsupported currency' });
  const payload = req.body as CatalystEvent;
  if (!payload || !payload.id) return res.status(400).json({ error: 'Invalid payload' });
  calendars[c].push({ ...payload, currency: c });
  return res.json({ ok: true });
});

export default router;


