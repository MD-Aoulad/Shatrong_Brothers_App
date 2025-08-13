import express from 'express';

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

const router = express.Router();

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

const state: Record<Currency, CurrencyBiasScorecard> = Object.fromEntries(
  currencies.map((c) => [
    c,
    {
      currency: c,
      pillars: (Object.keys(weights) as BiasPillar[]).map((p) => ({
        pillar: p,
        score: 0,
        weight: weights[p],
        rationale: 'init'
      })),
      weightedBiasScore: 0,
      bias: 'NEUTRAL',
      updatedAt: new Date().toISOString()
    }
  ])
) as Record<Currency, CurrencyBiasScorecard>;

function classify(score: number): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
  if (score >= 0.6) return 'BULLISH';
  if (score <= -0.6) return 'BEARISH';
  return 'NEUTRAL';
}

function recompute(currency: Currency): void {
  const sc = state[currency];
  const weighted = sc.pillars.reduce((acc, p) => acc + p.score * p.weight, 0);
  sc.weightedBiasScore = Number(weighted.toFixed(2));
  sc.bias = classify(sc.weightedBiasScore);
  sc.updatedAt = new Date().toISOString();
}

// Auto recompute every 5 minutes
setInterval(() => currencies.forEach(recompute), 5 * 60 * 1000);

// GET /api/v1/scorecard/:currency
router.get('/:currency', (req, res) => {
  const c = (req.params.currency || '').toUpperCase() as Currency;
  if (!currencies.includes(c)) return res.status(400).json({ error: 'Unsupported currency' });
  return res.json(state[c]);
});

// POST /api/v1/scorecard/recompute
router.post('/recompute', (req, res) => {
  const body = req.body as Partial<{
    currency: Currency;
    pillars: Partial<Record<BiasPillar, number>>; // -2..+2
  }>;
  const targets = body.currency ? [body.currency] : currencies;
  for (const t of targets) {
    if (!currencies.includes(t)) return res.status(400).json({ error: `Unsupported currency: ${t}` });
  }

  targets.forEach((cur) => {
    if (body.pillars) {
      state[cur].pillars = state[cur].pillars.map((p) => ({
        ...p,
        score: typeof body.pillars?.[p.pillar] === 'number' ? (body.pillars?.[p.pillar] as number) : p.score,
        rationale: typeof body.pillars?.[p.pillar] === 'number' ? 'updated' : p.rationale
      }));
    }
    recompute(cur);
  });

  return res.json({ ok: true, scorecards: targets.map((c) => state[c]) });
});

export default router;


