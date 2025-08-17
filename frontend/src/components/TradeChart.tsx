import React, { useEffect, useRef, useState } from 'react';
import './TradeChart.css';

interface TradeChartProps {
  pair: string;
  trades: any[];
  timeframe?: 'H1' | 'M15' | 'D1';
  height?: number;
  showTradeDetails?: boolean;
}

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradePoint {
  time: string;
  price: number;
  type: 'ENTRY' | 'EXIT' | 'STOP_LOSS' | 'TAKE_PROFIT';
  tradeId: string;
  signal: 'BUY' | 'SELL';
  result: 'WIN' | 'LOSS' | 'BREAKEVEN';
}

const TradeChart: React.FC<TradeChartProps> = ({
  pair,
  trades,
  timeframe = 'H1',
  height = 400,
  showTradeDetails = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [tradePoints, setTradePoints] = useState<TradePoint[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [hoveredPoint, setHoveredPoint] = useState<TradePoint | null>(null);

  useEffect(() => {
    if (trades.length > 0) {
      generateChartData();
      generateTradePoints();
    }
  }, [trades, pair]);

  useEffect(() => {
    if (chartData.length > 0 && tradePoints.length > 0) {
      drawChart();
    }
  }, [chartData, tradePoints]);

  const generateChartData = () => {
    const data: ChartData[] = [];
    const basePrice = getBasePrice(pair);
    let currentPrice = basePrice;
    
    // Generate 100 data points for the chart
    for (let i = 0; i < 100; i++) {
      const time = new Date(Date.now() - (100 - i) * 60 * 60 * 1000); // Last 100 hours
      const volatility = 0.001; // 0.1% volatility
      const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
      
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) + Math.random() * volatility * currentPrice;
      const low = Math.min(open, close) - Math.random() * volatility * currentPrice;
      
      data.push({
        time: time.toISOString(),
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 1000000) + 100000
      });
      
      currentPrice = close;
    }
    
    setChartData(data);
  };

  const generateTradePoints = () => {
    const points: TradePoint[] = [];
    
    trades.forEach(trade => {
      if (trade.pair === pair) {
        // Entry point
        points.push({
          time: trade.date,
          price: trade.entryPrice,
          type: 'ENTRY',
          tradeId: trade.id,
          signal: trade.signal,
          result: trade.result
        });
        
        // Exit points (Stop Loss or Take Profit)
        if (trade.signal === 'BUY') {
          if (trade.result === 'WIN') {
            points.push({
              time: trade.date,
              price: trade.takeProfit || trade.entryPrice + (trade.entryPrice * 0.01),
              type: 'TAKE_PROFIT',
              tradeId: trade.id,
              signal: 'BUY',
              result: 'WIN'
            });
          } else if (trade.result === 'LOSS') {
            points.push({
              time: trade.date,
              price: trade.stopLoss || trade.entryPrice - (trade.entryPrice * 0.005),
              type: 'STOP_LOSS',
              tradeId: trade.id,
              signal: 'BUY',
              result: 'LOSS'
            });
          }
        } else if (trade.signal === 'SELL') {
          if (trade.result === 'WIN') {
            points.push({
              time: trade.date,
              price: trade.takeProfit || trade.entryPrice - (trade.entryPrice * 0.01),
              type: 'TAKE_PROFIT',
              tradeId: trade.id,
              signal: 'SELL',
              result: 'WIN'
            });
          } else if (trade.result === 'LOSS') {
            points.push({
              time: trade.date,
              price: trade.stopLoss || trade.entryPrice + (trade.entryPrice * 0.005),
              type: 'STOP_LOSS',
              tradeId: trade.id,
              signal: 'SELL',
              result: 'LOSS'
            });
          }
        }
      }
    });
    
    setTradePoints(points);
  };

  const getBasePrice = (pair: string): number => {
    const basePrices: { [key: string]: number } = {
      'EUR/JPY': 165.50,
      'USD/JPY': 110.50,
      'CAD/JPY': 80.25,
      'GBP/JPY': 140.75,
      'EUR/USD': 1.0850,
      'GBP/USD': 1.2650,
      'GBP/CAD': 1.7200,
      'EUR/CAD': 1.4800
    };
    
    return basePrices[pair] || 1.0000;
  };

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = height;
    
    const width = canvas.width;
    const height_canvas = canvas.height;
    
    // Calculate price range
    const prices = chartData.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    // Calculate time range
    const timeRange = chartData.length;
    
    // Draw candlesticks
    chartData.forEach((candle, index) => {
      const x = (index / timeRange) * width;
      const candleWidth = Math.max(1, width / timeRange - 2);
      
      // Calculate y positions
      const openY = height_canvas - ((candle.open - minPrice) / priceRange) * height_canvas;
      const closeY = height_canvas - ((candle.close - minPrice) / priceRange) * height_canvas;
      const highY = height_canvas - ((candle.high - minPrice) / priceRange) * height_canvas;
      const lowY = height_canvas - ((candle.low - minPrice) / priceRange) * height_canvas;
      
      // Draw wick
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();
      
      // Draw body
      const isGreen = candle.close > candle.open;
      ctx.fillStyle = isGreen ? '#00d4aa' : '#ef4444';
      ctx.fillRect(x, Math.min(openY, closeY), candleWidth, Math.abs(closeY - openY));
    });
    
    // Draw trade points
    tradePoints.forEach(point => {
      const timeIndex = chartData.findIndex(d => d.time === point.time);
      if (timeIndex === -1) return;
      
      const x = (timeIndex / timeRange) * width;
      const y = height_canvas - ((point.price - minPrice) / priceRange) * height_canvas;
      
      // Draw trade point
      ctx.fillStyle = getTradePointColor(point);
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw label
      if (showTradeDetails) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        let label = '';
        if (point.type === 'ENTRY') {
          label = `${point.signal} ${point.tradeId}`;
        } else if (point.type === 'TAKE_PROFIT') {
          label = `TP ${point.result}`;
        } else if (point.type === 'STOP_LOSS') {
          label = `SL ${point.result}`;
        }
        
        ctx.fillText(label, x, y - 10);
      }
    });
    
    // Draw price levels
    drawPriceLevels(ctx, minPrice, maxPrice, height_canvas);
    
    // Draw time labels
    drawTimeLabels(ctx, width, height_canvas);
  };

  const getTradePointColor = (point: TradePoint): string => {
    if (point.type === 'ENTRY') {
      return point.signal === 'BUY' ? '#00d4aa' : '#ef4444';
    } else if (point.type === 'TAKE_PROFIT') {
      return '#00d4aa';
    } else if (point.type === 'STOP_LOSS') {
      return '#ef4444';
    }
    return '#666';
  };

  const drawPriceLevels = (ctx: CanvasRenderingContext2D, minPrice: number, maxPrice: number, height: number) => {
    const priceRange = maxPrice - minPrice;
    const levels = 5;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= levels; i++) {
      const price = minPrice + (i / levels) * priceRange;
      const y = height - (i / levels) * height;
      
      // Draw horizontal line
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();
      
      // Draw price label
      ctx.fillText(price.toFixed(4), ctx.canvas.width - 5, y - 5);
    }
  };

  const drawTimeLabels = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const timeLabels = 5;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    for (let i = 0; i <= timeLabels; i++) {
      const x = (i / timeLabels) * width;
      const timeIndex = Math.floor((i / timeLabels) * chartData.length);
      
      if (chartData[timeIndex]) {
        const time = new Date(chartData[timeIndex].time);
        const label = time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
        
        ctx.fillText(label, x, height - 5);
      }
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find closest trade point
    let closestPoint: TradePoint | null = null;
    let minDistance = Infinity;
    
    tradePoints.forEach(point => {
      const timeIndex = chartData.findIndex(d => d.time === point.time);
      if (timeIndex === -1) return;
      
      const pointX = (timeIndex / chartData.length) * canvas.width;
      const priceRange = Math.max(...chartData.flatMap(d => [d.high, d.low])) - Math.min(...chartData.flatMap(d => [d.high, d.low]));
      const minPrice = Math.min(...chartData.flatMap(d => [d.high, d.low]));
      const pointY = canvas.height - ((point.price - minPrice) / priceRange) * canvas.height;
      
      const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2);
      if (distance < minDistance && distance < 20) {
        minDistance = distance;
        closestPoint = point;
      }
    });
    
    if (closestPoint) {
      const trade = trades.find(t => t.id === closestPoint!.tradeId);
      setSelectedTrade(trade);
    }
  };

  const getTradeSummary = () => {
    const pairTrades = trades.filter(t => t.pair === pair);
    const totalTrades = pairTrades.length;
    const winningTrades = pairTrades.filter(t => t.result === 'WIN').length;
    const losingTrades = pairTrades.filter(t => t.result === 'LOSS').length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    
    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate: winRate.toFixed(1),
      totalProfit: pairTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0)
    };
  };

  const summary = getTradeSummary();

  return (
    <div className="trade-chart-container">
      <div className="chart-header">
        <h3>📈 {pair} Trade Chart ({timeframe})</h3>
        <div className="chart-summary">
          <span className="summary-item">Total: {summary.totalTrades}</span>
          <span className="summary-item">Wins: {summary.winningTrades}</span>
          <span className="summary-item">Losses: {summary.losingTrades}</span>
          <span className="summary-item">Win Rate: {summary.winRate}%</span>
          <span className="summary-item">P&L: ${summary.totalProfit.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="chart-container">
        <canvas
          ref={canvasRef}
          className="trade-chart-canvas"
          height={height}
          onClick={handleCanvasClick}
          style={{ cursor: 'pointer' }}
        />
      </div>
      
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color entry-buy"></div>
          <span>BUY Entry</span>
        </div>
        <div className="legend-item">
          <div className="legend-color entry-sell"></div>
          <span>SELL Entry</span>
        </div>
        <div className="legend-item">
          <div className="legend-color take-profit"></div>
          <span>Take Profit</span>
        </div>
        <div className="legend-item">
          <div className="legend-color stop-loss"></div>
          <span>Stop Loss</span>
        </div>
      </div>
      
      {selectedTrade && (
        <div className="trade-details">
          <h4>Trade Details</h4>
          <div className="trade-info">
            <div className="info-row">
              <strong>ID:</strong> {selectedTrade.id}
            </div>
            <div className="info-row">
              <strong>Signal:</strong> {selectedTrade.signal}
            </div>
            <div className="info-row">
              <strong>Entry:</strong> {selectedTrade.entryPrice}
            </div>
            <div className="info-row">
              <strong>Stop Loss:</strong> {selectedTrade.stopLoss}
            </div>
            <div className="info-row">
              <strong>Take Profit:</strong> {selectedTrade.takeProfit}
            </div>
            <div className="info-row">
              <strong>Result:</strong> {selectedTrade.result}
            </div>
            <div className="info-row">
              <strong>P&L:</strong> ${selectedTrade.profitLoss?.toFixed(2) || '0.00'}
            </div>
            <div className="info-row">
              <strong>Pips:</strong> {selectedTrade.pips || '0'}
            </div>
          </div>
          <button 
            className="close-details-btn"
            onClick={() => setSelectedTrade(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default TradeChart;
