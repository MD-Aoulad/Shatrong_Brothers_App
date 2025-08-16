-- Enhanced Database Schema for Forex Fundamental Data App
-- This includes all tables referenced in the application code

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Economic events table
CREATE TABLE IF NOT EXISTS economic_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    currency VARCHAR(3) NOT NULL CHECK (currency IN ('EUR', 'USD', 'JPY', 'GBP', 'CAD')),
    event_type VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    actual_value DECIMAL(15,4),
    expected_value DECIMAL(15,4),
    previous_value DECIMAL(15,4),
    impact VARCHAR(10) NOT NULL CHECK (impact IN ('HIGH', 'MEDIUM', 'LOW')),
    sentiment VARCHAR(10) NOT NULL CHECK (sentiment IN ('BULLISH', 'BEARISH', 'NEUTRAL')),
    confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    price_impact DECIMAL(5,2),
    source VARCHAR(100) NOT NULL,
    url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Currency sentiments table
CREATE TABLE IF NOT EXISTS currency_sentiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    currency VARCHAR(3) NOT NULL CHECK (currency IN ('EUR', 'USD', 'JPY', 'GBP', 'CAD')),
    current_sentiment VARCHAR(10) NOT NULL CHECK (current_sentiment IN ('BULLISH', 'BEARISH', 'NEUTRAL')),
    confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    trend VARCHAR(20) NOT NULL CHECK (trend IN ('STRENGTHENING', 'WEAKENING', 'STABLE')),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sentiment history table
CREATE TABLE IF NOT EXISTS sentiment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    currency VARCHAR(3) NOT NULL CHECK (currency IN ('EUR', 'USD', 'JPY', 'GBP', 'CAD')),
    sentiment_date DATE NOT NULL,
    sentiment VARCHAR(10) NOT NULL CHECK (sentiment IN ('BULLISH', 'BEARISH', 'NEUTRAL')),
    confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    price_change DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User alerts table
CREATE TABLE IF NOT EXISTS user_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(3) NOT NULL CHECK (currency IN ('EUR', 'USD', 'JPY', 'GBP', 'CAD')),
    event_type VARCHAR(50),
    sentiment_threshold INTEGER CHECK (sentiment_threshold >= 0 AND sentiment_threshold <= 100),
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- BIAS FRAMEWORK TABLES
-- =============================================================================

-- Bias pillars table (10-pillar fundamental model)
CREATE TABLE IF NOT EXISTS bias_pillars (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    weight DECIMAL(3,2) NOT NULL CHECK (weight >= 0 AND weight <= 1),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Currency bias scores table
CREATE TABLE IF NOT EXISTS currency_bias_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    currency VARCHAR(3) NOT NULL CHECK (currency IN ('EUR', 'USD', 'JPY', 'GBP', 'CAD')),
    pillar_id INTEGER REFERENCES bias_pillars(id),
    score DECIMAL(3,2) NOT NULL CHECK (score >= -2 AND score <= 2),
    rationale TEXT,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Currency bias scorecards table
CREATE TABLE IF NOT EXISTS currency_bias_scorecards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    currency VARCHAR(3) NOT NULL CHECK (currency IN ('EUR', 'USD', 'JPY', 'GBP', 'CAD')),
    weighted_bias_score DECIMAL(3,2) NOT NULL CHECK (weighted_bias_score >= -2 AND weighted_bias_score <= 2),
    bias VARCHAR(10) NOT NULL CHECK (bias IN ('BULLISH', 'BEARISH', 'NEUTRAL')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- CATALYST CALENDAR TABLES
-- =============================================================================

-- Catalyst events table
CREATE TABLE IF NOT EXISTS catalyst_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    currency VARCHAR(3) NOT NULL CHECK (currency IN ('EUR', 'USD', 'JPY', 'GBP', 'CAD')),
    event_date TIMESTAMP NOT NULL,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL,
    expected_value TEXT,
    previous_value TEXT,
    impact VARCHAR(10) NOT NULL CHECK (impact IN ('HIGH', 'MEDIUM', 'LOW')),
    skew VARCHAR(10) NOT NULL CHECK (skew IN ('BULLISH', 'BEARISH', 'NEUTRAL')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- ANALYTICS TABLES
-- =============================================================================

-- Trading strategies table
CREATE TABLE IF NOT EXISTS trading_strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    currency_pair VARCHAR(7) NOT NULL,
    strategy_type VARCHAR(50) NOT NULL,
    parameters JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Strategy performance table
CREATE TABLE IF NOT EXISTS strategy_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id UUID REFERENCES trading_strategies(id) ON DELETE CASCADE,
    execution_date TIMESTAMP NOT NULL,
    entry_price DECIMAL(10,5),
    exit_price DECIMAL(10,5),
    position_size DECIMAL(10,2),
    pnl DECIMAL(10,2),
    success BOOLEAN,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Economic events indexes
CREATE INDEX IF NOT EXISTS idx_economic_events_currency ON economic_events(currency);
CREATE INDEX IF NOT EXISTS idx_economic_events_date ON economic_events(event_date);
CREATE INDEX IF NOT EXISTS idx_economic_events_type ON economic_events(event_type);
CREATE INDEX IF NOT EXISTS idx_economic_events_sentiment ON economic_events(sentiment);
CREATE INDEX IF NOT EXISTS idx_economic_events_impact ON economic_events(impact);

-- Currency sentiments indexes
CREATE INDEX IF NOT EXISTS idx_currency_sentiments_currency ON currency_sentiments(currency);
CREATE INDEX IF NOT EXISTS idx_currency_sentiments_updated ON currency_sentiments(last_updated);

-- Sentiment history indexes
CREATE INDEX IF NOT EXISTS idx_sentiment_history_currency ON sentiment_history(currency);
CREATE INDEX IF NOT EXISTS idx_sentiment_history_date ON sentiment_history(sentiment_date);

-- User alerts indexes
CREATE INDEX IF NOT EXISTS idx_user_alerts_user_id ON user_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_currency ON user_alerts(currency);

-- Bias framework indexes
CREATE INDEX IF NOT EXISTS idx_currency_bias_scores_currency ON currency_bias_scores(currency);
CREATE INDEX IF NOT EXISTS idx_currency_bias_scores_pillar ON currency_bias_scores(pillar_id);
CREATE INDEX IF NOT EXISTS idx_currency_bias_scorecards_currency ON currency_bias_scorecards(currency);

-- Catalyst events indexes
CREATE INDEX IF NOT EXISTS idx_catalyst_events_currency ON catalyst_events(currency);
CREATE INDEX IF NOT EXISTS idx_catalyst_events_date ON catalyst_events(event_date);
CREATE INDEX IF NOT EXISTS idx_catalyst_events_category ON catalyst_events(category);

-- Trading strategies indexes
CREATE INDEX IF NOT EXISTS idx_trading_strategies_user_id ON trading_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_strategies_currency_pair ON trading_strategies(currency_pair);

-- Strategy performance indexes
CREATE INDEX IF NOT EXISTS idx_strategy_performance_strategy_id ON strategy_performance(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_performance_date ON strategy_performance(execution_date);

-- =============================================================================
-- TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_economic_events_updated_at BEFORE UPDATE ON economic_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_strategies_updated_at BEFORE UPDATE ON trading_strategies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- INITIAL DATA INSERTION
-- =============================================================================

-- Insert bias pillars with weights from the fundamental framework
INSERT INTO bias_pillars (name, weight, description) VALUES
('Monetary Policy and Rates', 0.25, 'Policy path, real yield differentials, curve shape, balance sheet, guidance credibility'),
('Inflation Dynamics', 0.15, 'Core/headline trends, wages/shelter, expectations, pipeline pressures'),
('Growth Momentum', 0.15, 'GDP/nowcasts, PMIs/ISM, retail/IP, surprise indices'),
('Labor Market', 0.05, 'Unemployment, participation, vacancies, wage growth'),
('External Balance and Flows', 0.10, 'Current/basic balance, NIIP, portfolio/FDI flows, rating outlook'),
('Terms of Trade/Commodities', 0.10, 'Export basket, energy dependency, key commodity shocks'),
('Fiscal Stance', 0.075, 'Deficit/debt path, fiscal impulse, issuance calendar, debt service burden'),
('Politics/Geopolitics', 0.05, 'Elections, sanctions/tariffs, policy uncertainty, conflict proximity'),
('Financial Stability/Conditions', 0.05, 'Credit spreads, bank equity, housing, funding stress, FCI'),
('Valuation and Positioning', 0.075, 'REER gap, BEER/FEER, CFTC positioning, options skew, seasonality')
ON CONFLICT (name) DO NOTHING;

-- Insert sample currency sentiments
INSERT INTO currency_sentiments (currency, current_sentiment, confidence_score, trend) VALUES
('EUR', 'BULLISH', 85, 'STRENGTHENING'),
('USD', 'BEARISH', 72, 'WEAKENING'),
('JPY', 'NEUTRAL', 45, 'STABLE'),
('GBP', 'BULLISH', 68, 'STRENGTHENING')
ON CONFLICT DO NOTHING;

-- Insert sample catalyst events
INSERT INTO catalyst_events (currency, event_date, title, category, expected_value, previous_value, impact, skew) VALUES
('USD', '2024-02-20 14:00:00', 'FOMC Meeting Minutes', 'CENTRAL_BANK', 'Hawkish tone', 'Neutral', 'HIGH', 'BEARISH'),
('EUR', '2024-02-22 13:45:00', 'ECB President Speech', 'CENTRAL_BANK', 'Dovish comments', 'Hawkish', 'MEDIUM', 'BULLISH'),
('JPY', '2024-02-25 03:00:00', 'BOJ Policy Meeting', 'CENTRAL_BANK', 'No change', 'No change', 'HIGH', 'NEUTRAL'),
('GBP', '2024-02-28 12:00:00', 'BOE Rate Decision', 'CENTRAL_BANK', '5.25%', '5.25%', 'HIGH', 'NEUTRAL')
ON CONFLICT DO NOTHING;
