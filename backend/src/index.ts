import express, { Request, Response } from 'express';
import cors from 'cors';

type Currency = 'EUR' | 'USD' | 'JPY' | 'GBP';
type BiasPillar =
  | 'POLICY'
  | 'INFLATION'
  | 'GROWTH'
  | 'LABOR'
  | 'EXTERNAL'
  | 'TERMS_OF_TRADE'
  | 'FISCAL'
  | 'POLITICS'
  | 'FINANCIAL_CONDITIONS'
  | 'VALUATION';

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

interface BiasPillarScore {
  pillar: BiasPillar;
  score: number; // -2..+2
  weight: number; // 0..1
  rationale: string;
}

interface CurrencyBiasScorecard {
  currency: Currency;
  pillars: BiasPillarScore[];
  weightedBiasScore: number; // -2..+2
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  updatedAt: string;
}

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

const app = express();
app.use(cors());
app.use(express.json());

const weights: Record<BiasPillar, number> = {
  POLICY: 0.25,
  INFLATION: 0.15,
  GROWTH: 0.15,
  LABOR: 0.05,
  EXTERNAL: 0.1,
  TERMS_OF_TRADE: 0.1,
  FISCAL: 0.075,
  POLITICS: 0.05,
  FINANCIAL_CONDITIONS: 0.05,
  VALUATION: 0.075
};

const currencies: Currency[] = ['EUR', 'USD', 'JPY', 'GBP'];

let scorecards: Record<Currency, CurrencyBiasScorecard> = Object.fromEntries(
  currencies.map((c) => [
    c,
    {
      currency: c,
      pillars: (
        Object.keys(weights) as BiasPillar[]
      ).map((p) => ({ pillar: p, score: 0, weight: weights[p], rationale: 'init' })),
      weightedBiasScore: 0,
      bias: 'NEUTRAL',
      updatedAt: new Date().toISOString()
    }
  ])
) as Record<Currency, CurrencyBiasScorecard>;

let calendars: Record<Currency, CatalystEvent[]> = {
  EUR: [],
  USD: [],
  JPY: [],
  GBP: []
};

function classify(score: number): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
  if (score >= 0.6) return 'BULLISH';
  if (score <= -0.6) return 'BEARISH';
  return 'NEUTRAL';
}

function recomputeScorecard(currency: Currency): void {
  const sc = scorecards[currency];
  const weighted = sc.pillars.reduce((acc, p) => acc + p.score * p.weight, 0);
  sc.weightedBiasScore = Number(weighted.toFixed(2));
  sc.bias = classify(sc.weightedBiasScore);
  sc.updatedAt = new Date().toISOString();
}

function recomputeAll(): void {
  currencies.forEach(recomputeScorecard);
}

// Demo scheduler: recompute every 5 minutes (placeholder for real data ingestion)
setInterval(recomputeAll, 5 * 60 * 1000);

app.get('/api/v1/scorecard/:currency', (req: Request, res: Response) => {
  const c = req.params.currency?.toUpperCase() as Currency;
  if (!currencies.includes(c)) return res.status(400).json({ error: 'Unsupported currency' });
  return res.json(scorecards[c]);
});

app.post('/api/v1/scorecard/recompute', (req: Request, res: Response) => {
  const body = req.body as Partial<{
    currency: Currency;
    pillars: Partial<Record<BiasPillar, number>>; // raw scores -2..+2
  }>;
  if (body.currency && !currencies.includes(body.currency)) {
    return res.status(400).json({ error: 'Unsupported currency' });
  }

  const targetCurrencies = body.currency ? [body.currency] : currencies;
  targetCurrencies.forEach((cur) => {
    if (body.pillars) {
      scorecards[cur].pillars = scorecards[cur].pillars.map((p) => ({
        ...p,
        score: typeof body.pillars?.[p.pillar] === 'number' ? (body.pillars?.[p.pillar] as number) : p.score,
        rationale: typeof body.pillars?.[p.pillar] === 'number' ? 'updated' : p.rationale
      }));
    }
    recomputeScorecard(cur);
  });

  return res.json({ ok: true, currencies: targetCurrencies.map((c) => scorecards[c]) });
});

app.get('/api/v1/calendar/:currency', (req: Request, res: Response) => {
  const c = req.params.currency?.toUpperCase() as Currency;
  if (!currencies.includes(c)) return res.status(400).json({ error: 'Unsupported currency' });
  return res.json(calendars[c]);
});

app.post('/api/v1/calendar/:currency', (req: Request, res: Response) => {
  const c = req.params.currency?.toUpperCase() as Currency;
  if (!currencies.includes(c)) return res.status(400).json({ error: 'Unsupported currency' });
  const event = req.body as CatalystEvent;
  if (!event || !event.id) return res.status(400).json({ error: 'Invalid event payload' });
  calendars[c].push({ ...event, currency: c });
  return res.json({ ok: true });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`fx-backend listening on port ${port}`);
});


