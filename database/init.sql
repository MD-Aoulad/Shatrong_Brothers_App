-- Forex Fundamental Data App Database Initialization

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_economic_events_currency ON economic_events(currency);
CREATE INDEX IF NOT EXISTS idx_economic_events_date ON economic_events(event_date);
CREATE INDEX IF NOT EXISTS idx_economic_events_type ON economic_events(event_type);
CREATE INDEX IF NOT EXISTS idx_economic_events_sentiment ON economic_events(sentiment);

CREATE INDEX IF NOT EXISTS idx_currency_sentiments_currency ON currency_sentiments(currency);
CREATE INDEX IF NOT EXISTS idx_currency_sentiments_updated ON currency_sentiments(last_updated);

CREATE INDEX IF NOT EXISTS idx_sentiment_history_currency ON sentiment_history(currency);
CREATE INDEX IF NOT EXISTS idx_sentiment_history_date ON sentiment_history(sentiment_date);

CREATE INDEX IF NOT EXISTS idx_user_alerts_user_id ON user_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_currency ON user_alerts(currency);

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

-- Insert sample data for testing
INSERT INTO currency_sentiments (currency, current_sentiment, confidence_score, trend) VALUES
('EUR', 'BULLISH', 85, 'STRENGTHENING'),
('USD', 'BEARISH', 72, 'WEAKENING'),
('JPY', 'NEUTRAL', 45, 'STABLE'),
('GBP', 'BULLISH', 68, 'STRENGTHENING')
ON CONFLICT DO NOTHING;

-- Insert comprehensive sample economic events for 2024 and 2025
INSERT INTO economic_events (currency, event_type, title, description, event_date, actual_value, expected_value, previous_value, impact, sentiment, confidence_score, price_impact, source) VALUES
-- EUR Events 2024
('EUR', 'CPI', 'Eurozone CPI Data', 'Consumer Price Index for Eurozone', '2024-02-15 10:00:00', 0.3, 0.2, 0.1, 'HIGH', 'BULLISH', 85, 0.8, 'Eurostat'),
('EUR', 'INTEREST_RATE', 'ECB Rate Decision', 'European Central Bank Interest Rate Decision', '2024-03-14 13:45:00', 4.5, 4.5, 4.25, 'HIGH', 'BULLISH', 78, 0.6, 'European Central Bank'),
('EUR', 'GDP', 'Eurozone GDP Growth', 'Eurozone Gross Domestic Product Growth', '2024-04-30 11:00:00', 0.4, 0.3, 0.2, 'HIGH', 'BULLISH', 82, 0.7, 'Eurostat'),
('EUR', 'EMPLOYMENT', 'Eurozone Employment Data', 'Eurozone Employment and Unemployment Data', '2024-05-15 10:00:00', 6.8, 7.0, 7.2, 'MEDIUM', 'BULLISH', 65, 0.3, 'Eurostat'),
('EUR', 'RETAIL_SALES', 'Eurozone Retail Sales', 'Eurozone Retail Sales Data', '2024-06-05 10:00:00', 0.5, 0.3, 0.1, 'MEDIUM', 'BULLISH', 70, 0.4, 'Eurostat'),
('EUR', 'CPI', 'Eurozone CPI Data', 'Consumer Price Index for Eurozone', '2024-07-15 10:00:00', 0.2, 0.3, 0.3, 'HIGH', 'BEARISH', 75, -0.5, 'Eurostat'),
('EUR', 'INTEREST_RATE', 'ECB Rate Decision', 'European Central Bank Interest Rate Decision', '2024-08-14 13:45:00', 4.25, 4.5, 4.5, 'HIGH', 'BEARISH', 80, -0.6, 'European Central Bank'),
('EUR', 'GDP', 'Eurozone GDP Growth', 'Eurozone Gross Domestic Product Growth', '2024-09-30 11:00:00', 0.2, 0.4, 0.4, 'HIGH', 'BEARISH', 78, -0.4, 'Eurostat'),
('EUR', 'EMPLOYMENT', 'Eurozone Employment Data', 'Eurozone Employment and Unemployment Data', '2024-10-15 10:00:00', 7.2, 6.8, 6.8, 'MEDIUM', 'BEARISH', 65, -0.3, 'Eurostat'),
('EUR', 'RETAIL_SALES', 'Eurozone Retail Sales', 'Eurozone Retail Sales Data', '2024-11-05 10:00:00', 0.1, 0.3, 0.5, 'MEDIUM', 'BEARISH', 60, -0.2, 'Eurostat'),
('EUR', 'CPI', 'Eurozone CPI Data', 'Consumer Price Index for Eurozone', '2024-12-15 10:00:00', 0.1, 0.2, 0.2, 'HIGH', 'NEUTRAL', 50, 0.0, 'Eurostat'),

-- EUR Events 2025
('EUR', 'INTEREST_RATE', 'ECB Rate Decision', 'European Central Bank Interest Rate Decision', '2025-01-14 13:45:00', 4.0, 4.25, 4.25, 'HIGH', 'BULLISH', 75, 0.5, 'European Central Bank'),
('EUR', 'CPI', 'Eurozone CPI Data', 'Consumer Price Index for Eurozone', '2025-02-15 10:00:00', 0.3, 0.2, 0.1, 'HIGH', 'BULLISH', 80, 0.6, 'Eurostat'),
('EUR', 'GDP', 'Eurozone GDP Growth', 'Eurozone Gross Domestic Product Growth', '2025-03-30 11:00:00', 0.5, 0.3, 0.2, 'HIGH', 'BULLISH', 85, 0.8, 'Eurostat'),
('EUR', 'EMPLOYMENT', 'Eurozone Employment Data', 'Eurozone Employment and Unemployment Data', '2025-04-15 10:00:00', 6.5, 6.8, 7.2, 'MEDIUM', 'BULLISH', 70, 0.4, 'Eurostat'),
('EUR', 'RETAIL_SALES', 'Eurozone Retail Sales', 'Eurozone Retail Sales Data', '2025-05-05 10:00:00', 0.6, 0.3, 0.1, 'MEDIUM', 'BULLISH', 75, 0.5, 'Eurostat'),

-- USD Events 2024
('USD', 'INTEREST_RATE', 'Fed Rate Decision', 'Federal Reserve Interest Rate Decision', '2024-02-14 14:00:00', 5.25, 5.25, 5.25, 'HIGH', 'BEARISH', 72, -0.5, 'Federal Reserve'),
('USD', 'CPI', 'US CPI Data', 'Consumer Price Index for United States', '2024-03-15 08:30:00', 0.4, 0.3, 0.2, 'HIGH', 'BEARISH', 78, -0.6, 'Bureau of Labor Statistics'),
('USD', 'GDP', 'US GDP Growth', 'United States Gross Domestic Product Growth', '2024-04-25 08:30:00', 2.1, 2.5, 2.8, 'HIGH', 'BEARISH', 75, -0.4, 'Bureau of Economic Analysis'),
('USD', 'EMPLOYMENT', 'US NFP Data', 'US Non-Farm Payrolls Data', '2024-05-03 08:30:00', 150000, 180000, 200000, 'HIGH', 'BEARISH', 80, -0.7, 'Bureau of Labor Statistics'),
('USD', 'RETAIL_SALES', 'US Retail Sales', 'US Retail Sales Data', '2024-06-14 08:30:00', 0.2, 0.4, 0.6, 'MEDIUM', 'BEARISH', 65, -0.3, 'Census Bureau'),
('USD', 'INTEREST_RATE', 'Fed Rate Decision', 'Federal Reserve Interest Rate Decision', '2024-07-14 14:00:00', 5.0, 5.25, 5.25, 'HIGH', 'BULLISH', 75, 0.5, 'Federal Reserve'),
('USD', 'CPI', 'US CPI Data', 'Consumer Price Index for United States', '2024-08-15 08:30:00', 0.2, 0.4, 0.4, 'HIGH', 'BULLISH', 70, 0.4, 'Bureau of Labor Statistics'),
('USD', 'GDP', 'US GDP Growth', 'United States Gross Domestic Product Growth', '2024-09-26 08:30:00', 2.8, 2.1, 2.1, 'HIGH', 'BULLISH', 78, 0.6, 'Bureau of Economic Analysis'),
('USD', 'EMPLOYMENT', 'US NFP Data', 'US Non-Farm Payrolls Data', '2024-10-04 08:30:00', 220000, 180000, 150000, 'HIGH', 'BULLISH', 82, 0.8, 'Bureau of Labor Statistics'),
('USD', 'RETAIL_SALES', 'US Retail Sales', 'US Retail Sales Data', '2024-11-15 08:30:00', 0.5, 0.3, 0.2, 'MEDIUM', 'BULLISH', 68, 0.3, 'Census Bureau'),
('USD', 'INTEREST_RATE', 'Fed Rate Decision', 'Federal Reserve Interest Rate Decision', '2024-12-14 14:00:00', 4.75, 5.0, 5.0, 'HIGH', 'BULLISH', 80, 0.7, 'Federal Reserve'),

-- USD Events 2025
('USD', 'CPI', 'US CPI Data', 'Consumer Price Index for United States', '2025-01-15 08:30:00', 0.3, 0.4, 0.2, 'HIGH', 'NEUTRAL', 55, 0.1, 'Bureau of Labor Statistics'),
('USD', 'GDP', 'US GDP Growth', 'United States Gross Domestic Product Growth', '2025-02-27 08:30:00', 2.5, 2.8, 2.8, 'HIGH', 'NEUTRAL', 50, 0.0, 'Bureau of Economic Analysis'),
('USD', 'EMPLOYMENT', 'US NFP Data', 'US Non-Farm Payrolls Data', '2025-03-07 08:30:00', 180000, 180000, 220000, 'HIGH', 'NEUTRAL', 52, 0.0, 'Bureau of Labor Statistics'),
('USD', 'RETAIL_SALES', 'US Retail Sales', 'US Retail Sales Data', '2025-04-15 08:30:00', 0.3, 0.3, 0.5, 'MEDIUM', 'NEUTRAL', 48, 0.0, 'Census Bureau'),
('USD', 'INTEREST_RATE', 'Fed Rate Decision', 'Federal Reserve Interest Rate Decision', '2025-05-14 14:00:00', 4.5, 4.75, 4.75, 'HIGH', 'BULLISH', 75, 0.5, 'Federal Reserve'),

-- JPY Events 2024
('JPY', 'GDP', 'Japan GDP Growth', 'Japan Gross Domestic Product Growth', '2024-02-13 09:00:00', 1.2, 1.0, 0.8, 'MEDIUM', 'NEUTRAL', 45, 0.2, 'Bank of Japan'),
('JPY', 'INTEREST_RATE', 'BOJ Rate Decision', 'Bank of Japan Interest Rate Decision', '2024-03-19 03:00:00', -0.1, -0.1, -0.1, 'HIGH', 'NEUTRAL', 50, 0.0, 'Bank of Japan'),
('JPY', 'CPI', 'Japan CPI Data', 'Consumer Price Index for Japan', '2024-04-19 08:30:00', 0.8, 0.9, 0.7, 'MEDIUM', 'NEUTRAL', 48, 0.1, 'Statistics Bureau'),
('JPY', 'EMPLOYMENT', 'Japan Employment Data', 'Japan Employment and Unemployment Data', '2024-05-31 08:30:00', 2.5, 2.6, 2.4, 'MEDIUM', 'NEUTRAL', 52, 0.0, 'Statistics Bureau'),
('JPY', 'RETAIL_SALES', 'Japan Retail Sales', 'Japan Retail Sales Data', '2024-06-28 08:30:00', 0.3, 0.4, 0.2, 'MEDIUM', 'NEUTRAL', 45, 0.0, 'Ministry of Economy'),
('JPY', 'GDP', 'Japan GDP Growth', 'Japan Gross Domestic Product Growth', '2024-08-15 09:00:00', 0.8, 1.2, 1.2, 'MEDIUM', 'BEARISH', 60, -0.3, 'Bank of Japan'),
('JPY', 'INTEREST_RATE', 'BOJ Rate Decision', 'Bank of Japan Interest Rate Decision', '2024-09-19 03:00:00', -0.1, -0.1, -0.1, 'HIGH', 'NEUTRAL', 50, 0.0, 'Bank of Japan'),
('JPY', 'CPI', 'Japan CPI Data', 'Consumer Price Index for Japan', '2024-10-18 08:30:00', 0.6, 0.8, 0.8, 'MEDIUM', 'BEARISH', 55, -0.2, 'Statistics Bureau'),
('JPY', 'EMPLOYMENT', 'Japan Employment Data', 'Japan Employment and Unemployment Data', '2024-11-29 08:30:00', 2.7, 2.5, 2.5, 'MEDIUM', 'BEARISH', 58, -0.1, 'Statistics Bureau'),
('JPY', 'RETAIL_SALES', 'Japan Retail Sales', 'Japan Retail Sales Data', '2024-12-27 08:30:00', 0.1, 0.3, 0.3, 'MEDIUM', 'BEARISH', 62, -0.2, 'Ministry of Economy'),

-- JPY Events 2025
('JPY', 'GDP', 'Japan GDP Growth', 'Japan Gross Domestic Product Growth', '2025-01-15 09:00:00', 1.5, 0.8, 0.8, 'MEDIUM', 'BULLISH', 70, 0.4, 'Bank of Japan'),
('JPY', 'INTEREST_RATE', 'BOJ Rate Decision', 'Bank of Japan Interest Rate Decision', '2025-02-19 03:00:00', 0.0, -0.1, -0.1, 'HIGH', 'BULLISH', 75, 0.5, 'Bank of Japan'),
('JPY', 'CPI', 'Japan CPI Data', 'Consumer Price Index for Japan', '2025-03-18 08:30:00', 1.2, 0.6, 0.6, 'MEDIUM', 'BULLISH', 72, 0.3, 'Statistics Bureau'),
('JPY', 'EMPLOYMENT', 'Japan Employment Data', 'Japan Employment and Unemployment Data', '2025-04-30 08:30:00', 2.3, 2.7, 2.7, 'MEDIUM', 'BULLISH', 68, 0.2, 'Statistics Bureau'),
('JPY', 'RETAIL_SALES', 'Japan Retail Sales', 'Japan Retail Sales Data', '2025-05-29 08:30:00', 0.5, 0.1, 0.1, 'MEDIUM', 'BULLISH', 65, 0.3, 'Ministry of Economy'),

-- GBP Events 2024
('GBP', 'EMPLOYMENT', 'UK Employment Data', 'UK Employment and Unemployment Data', '2024-02-12 11:00:00', 0.2, 0.1, 0.0, 'MEDIUM', 'BULLISH', 68, 0.4, 'Office for National Statistics'),
('GBP', 'CPI', 'UK CPI Data', 'Consumer Price Index for United Kingdom', '2024-03-20 09:30:00', 0.3, 0.4, 0.2, 'HIGH', 'NEUTRAL', 55, 0.0, 'Office for National Statistics'),
('GBP', 'INTEREST_RATE', 'BOE Rate Decision', 'Bank of England Interest Rate Decision', '2024-04-11 12:00:00', 5.25, 5.25, 5.25, 'HIGH', 'NEUTRAL', 50, 0.0, 'Bank of England'),
('GBP', 'GDP', 'UK GDP Growth', 'United Kingdom Gross Domestic Product Growth', '2024-05-10 09:30:00', 0.3, 0.4, 0.2, 'HIGH', 'NEUTRAL', 52, 0.0, 'Office for National Statistics'),
('GBP', 'RETAIL_SALES', 'UK Retail Sales', 'UK Retail Sales Data', '2024-06-21 09:30:00', 0.4, 0.2, 0.1, 'MEDIUM', 'BULLISH', 65, 0.3, 'Office for National Statistics'),
('GBP', 'EMPLOYMENT', 'UK Employment Data', 'UK Employment and Unemployment Data', '2024-07-16 11:00:00', 0.1, 0.2, 0.2, 'MEDIUM', 'BEARISH', 58, -0.2, 'Office for National Statistics'),
('GBP', 'CPI', 'UK CPI Data', 'Consumer Price Index for United Kingdom', '2024-08-21 09:30:00', 0.1, 0.3, 0.3, 'HIGH', 'BEARISH', 70, -0.4, 'Office for National Statistics'),
('GBP', 'INTEREST_RATE', 'BOE Rate Decision', 'Bank of England Interest Rate Decision', '2024-09-12 12:00:00', 5.0, 5.25, 5.25, 'HIGH', 'BULLISH', 75, 0.5, 'Bank of England'),
('GBP', 'GDP', 'UK GDP Growth', 'United Kingdom Gross Domestic Product Growth', '2024-10-11 09:30:00', 0.5, 0.3, 0.3, 'HIGH', 'BULLISH', 78, 0.6, 'Office for National Statistics'),
('GBP', 'RETAIL_SALES', 'UK Retail Sales', 'UK Retail Sales Data', '2024-11-22 09:30:00', 0.6, 0.3, 0.4, 'MEDIUM', 'BULLISH', 72, 0.4, 'Office for National Statistics'),
('GBP', 'EMPLOYMENT', 'UK Employment Data', 'UK Employment and Unemployment Data', '2024-12-17 11:00:00', 0.3, 0.1, 0.1, 'MEDIUM', 'BULLISH', 68, 0.3, 'Office for National Statistics'),

-- GBP Events 2025
('GBP', 'CPI', 'UK CPI Data', 'Consumer Price Index for United Kingdom', '2025-01-22 09:30:00', 0.4, 0.1, 0.1, 'HIGH', 'BULLISH', 80, 0.7, 'Office for National Statistics'),
('GBP', 'INTEREST_RATE', 'BOE Rate Decision', 'Bank of England Interest Rate Decision', '2025-02-13 12:00:00', 4.75, 5.0, 5.0, 'HIGH', 'BULLISH', 82, 0.8, 'Bank of England'),
('GBP', 'GDP', 'UK GDP Growth', 'United Kingdom Gross Domestic Product Growth', '2025-03-12 09:30:00', 0.6, 0.3, 0.5, 'HIGH', 'BULLISH', 85, 0.9, 'Office for National Statistics'),
('GBP', 'RETAIL_SALES', 'UK Retail Sales', 'UK Retail Sales Data', '2025-04-18 09:30:00', 0.7, 0.3, 0.6, 'MEDIUM', 'BULLISH', 78, 0.5, 'Office for National Statistics'),
('GBP', 'EMPLOYMENT', 'UK Employment Data', 'UK Employment and Unemployment Data', '2025-05-20 11:00:00', 0.4, 0.1, 0.3, 'MEDIUM', 'BULLISH', 75, 0.4, 'Office for National Statistics')
ON CONFLICT DO NOTHING;
