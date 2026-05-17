/**
 * Performance Measurement Engine
 * 
 * Comprehensive analytics for investment performance, attribution, and risk metrics
 */

import { Injectable } from '@nestjs/common';

export interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  calmarRatio: number;
  var95: number;
  cvar95: number;
  beta: number;
  alpha: number;
  informationRatio: number;
  trackingError: number;
}

export interface ReturnData {
  date: Date;
  portfolioValue: number;
  benchmarkValue: number;
  cashFlows: Array<{ date: Date; amount: number; type: 'DEPOSIT' | 'WITHDRAWAL' }>;
}

@Injectable()
export class PerformanceMeasurementEngine {
  /**
   * Calculate comprehensive performance metrics
   */
  calculatePerformanceMetrics(
    returns: number[],
    benchmarkReturns: number[],
    riskFreeRate: number = 0.02
  ): PerformanceMetrics {
    const totalReturn = this.calculateTotalReturn(returns);
    const annualizedReturn = this.calculateAnnualizedReturn(returns);
    const volatility = this.calculateVolatility(returns);
    const sharpeRatio = this.calculateSharpeRatio(returns, riskFreeRate);
    const sortinoRatio = this.calculateSortinoRatio(returns, riskFreeRate);
    const maxDrawdown = this.calculateMaxDrawdown(returns);
    const calmarRatio = annualizedReturn / Math.abs(maxDrawdown);
    const var95 = this.calculateVaR(returns, 0.95);
    const cvar95 = this.calculateCVaR(returns, 0.95);
    const { beta, alpha } = this.calculateBetaAlpha(returns, benchmarkReturns, riskFreeRate);
    const trackingError = this.calculateTrackingError(returns, benchmarkReturns);
    const informationRatio = this.calculateInformationRatio(returns, benchmarkReturns, trackingError);

    return {
      totalReturn,
      annualizedReturn,
      volatility,
      sharpeRatio,
      sortinoRatio,
      maxDrawdown,
      calmarRatio,
      var95,
      cvar95,
      beta,
      alpha,
      informationRatio,
      trackingError,
    };
  }

  /**
   * Calculate Time-Weighted Return (TWR)
   */
  calculateTimeWeightedReturn(data: ReturnData): number {
    const { portfolioValue, cashFlows } = data;
    
    // Sort cash flows by date
    const sortedFlows = cashFlows.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    let twr = 1;
    let previousValue = portfolioValue[0];
    
    for (const flow of sortedFlows) {
      const currentValue = this.getPortfolioValueAtDate(data, flow.date);
      const subPeriodReturn = (currentValue - previousValue - flow.amount) / previousValue;
      twr *= (1 + subPeriodReturn);
      previousValue = currentValue;
    }
    
    return twr - 1;
  }

  /**
   * Calculate Money-Weighted Return (IRR)
   */
  calculateMoneyWeightedReturn(data: ReturnData): number {
    const { portfolioValue, cashFlows } = data;
    
    // Build cash flow timeline
    const flows = [
      { date: data.date[0], amount: -portfolioValue[0] }, // Initial investment (negative)
      ...cashFlows.map(f => ({ date: f.date, amount: f.type === 'DEPOSIT' ? -f.amount : f.amount })),
      { date: data.date[data.date.length - 1], amount: portfolioValue[portfolioValue.length - 1] }
    ];
    
    // Solve for IRR using Newton-Raphson method
    return this.solveIRR(flows);
  }

  /**
   * Calculate Sharpe Ratio
   */
  calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
    const excessReturns = returns.map(r => r - riskFreeRate / 252); // Daily risk-free rate
    const meanExcessReturn = this.mean(excessReturns);
    const stdDev = this.standardDeviation(returns);
    
    if (stdDev === 0) return 0;
    
    // Annualize
    return (meanExcessReturn * 252) / (stdDev * Math.sqrt(252));
  }

  /**
   * Calculate Sortino Ratio (downside deviation)
   */
  calculateSortinoRatio(returns: number[], targetReturn: number = 0): number {
    const excessReturns = returns.map(r => r - targetReturn / 252);
    const meanExcessReturn = this.mean(excessReturns);
    
    // Calculate downside deviation (only negative deviations)
    const negativeReturns = excessReturns.filter(r => r < 0);
    const downsideVariance = negativeReturns.reduce((sum, r) => sum + r * r, 0) / negativeReturns.length;
    const downsideDeviation = Math.sqrt(downsideVariance);
    
    if (downsideDeviation === 0) return 0;
    
    // Annualize
    return (meanExcessReturn * 252) / (downsideDeviation * Math.sqrt(252));
  }

  /**
   * Calculate Maximum Drawdown
   */
  calculateMaxDrawdown(returns: number[]): number {
    let peak = 1;
    let maxDrawdown = 0;
    let cumulative = 1;
    
    for (const ret of returns) {
      cumulative *= (1 + ret);
      if (cumulative > peak) {
        peak = cumulative;
      }
      const drawdown = (peak - cumulative) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return -maxDrawdown; // Return as negative value
  }

  /**
   * Calculate Value at Risk (VaR)
   */
  calculateVaR(returns: number[], confidenceLevel: number = 0.95): number {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
    return sortedReturns[index];
  }

  /**
   * Calculate Conditional VaR (Expected Shortfall)
   */
  calculateCVaR(returns: number[], confidenceLevel: number = 0.95): number {
    const varValue = this.calculateVaR(returns, confidenceLevel);
    const tailReturns = returns.filter(r => r <= varValue);
    
    if (tailReturns.length === 0) return varValue;
    
    return this.mean(tailReturns);
  }

  /**
   * Calculate Beta and Alpha
   */
  calculateBetaAlpha(
    portfolioReturns: number[],
    benchmarkReturns: number[],
    riskFreeRate: number = 0.02
  ): { beta: number; alpha: number } {
    const n = portfolioReturns.length;
    
    // Calculate means
    const meanPortfolio = this.mean(portfolioReturns);
    const meanBenchmark = this.mean(benchmarkReturns);
    
    // Calculate covariance and variance
    let covariance = 0;
    let benchmarkVariance = 0;
    
    for (let i = 0; i < n; i++) {
      const portfolioDev = portfolioReturns[i] - meanPortfolio;
      const benchmarkDev = benchmarkReturns[i] - meanBenchmark;
      covariance += portfolioDev * benchmarkDev;
      benchmarkVariance += benchmarkDev * benchmarkDev;
    }
    
    covariance /= (n - 1);
    benchmarkVariance /= (n - 1);
    
    // Calculate Beta
    const beta = benchmarkVariance !== 0 ? covariance / benchmarkVariance : 0;
    
    // Calculate Alpha (Jensen's Alpha)
    const dailyRiskFree = riskFreeRate / 252;
    const alpha = meanPortfolio - (dailyRiskFree + beta * (meanBenchmark - dailyRiskFree));
    
    // Annualize alpha
    const annualizedAlpha = alpha * 252;
    
    return { beta, alpha: annualizedAlpha };
  }

  /**
   * Calculate Tracking Error
   */
  calculateTrackingError(portfolioReturns: number[], benchmarkReturns: number[]): number {
    const activeReturns = portfolioReturns.map((p, i) => p - benchmarkReturns[i]);
    const stdDev = this.standardDeviation(activeReturns);
    
    // Annualize
    return stdDev * Math.sqrt(252);
  }

  /**
   * Calculate Information Ratio
   */
  calculateInformationRatio(
    portfolioReturns: number[],
    benchmarkReturns: number[],
    trackingError?: number
  ): number {
    const activeReturn = this.mean(portfolioReturns.map((p, i) => p - benchmarkReturns[i]));
    const te = trackingError || this.calculateTrackingError(portfolioReturns, benchmarkReturns);
    
    if (te === 0) return 0;
    
    // Annualize
    return (activeReturn * 252) / te;
  }

  /**
   * Calculate Brinson Attribution (Allocation, Selection, Interaction)
   */
  calculateBrinsonAttribution(
    portfolioWeights: Record<string, number>,
    benchmarkWeights: Record<string, number>,
    portfolioReturns: Record<string, number>,
    benchmarkReturns: Record<string, number>
  ): {
    allocationEffect: number;
    selectionEffect: number;
    interactionEffect: number;
    totalActiveReturn: number;
    bySector: Array<{
      sector: string;
      allocationEffect: number;
      selectionEffect: number;
      interactionEffect: number;
    }>;
  } {
    const sectors = Object.keys(portfolioWeights);
    
    let allocationEffect = 0;
    let selectionEffect = 0;
    let interactionEffect = 0;
    const bySector = [];
    
    for (const sector of sectors) {
      const wp = portfolioWeights[sector] || 0;
      const wb = benchmarkWeights[sector] || 0;
      const rp = portfolioReturns[sector] || 0;
      const rb = benchmarkReturns[sector] || 0;
      
      const allocEffect = (wp - wb) * rb;
      const selEffect = wb * (rp - rb);
      const intEffect = (wp - wb) * (rp - rb);
      
      allocationEffect += allocEffect;
      selectionEffect += selEffect;
      interactionEffect += intEffect;
      
      bySector.push({
        sector,
        allocationEffect: allocEffect,
        selectionEffect: selEffect,
        interactionEffect: intEffect,
      });
    }
    
    const totalActiveReturn = allocationEffect + selectionEffect + interactionEffect;
    
    return {
      allocationEffect,
      selectionEffect,
      interactionEffect,
      totalActiveReturn,
      bySector,
    };
  }

  /**
   * Calculate Factor Attribution
   */
  calculateFactorAttribution(
    portfolioReturn: number,
    factorExposures: Record<string, number>,
    factorReturns: Record<string, number>
  ): {
    totalReturn: number;
    factorContributions: Array<{ factor: string; exposure: number; contribution: number }>;
    specificReturn: number;
    rSquared: number;
  } {
    const factorContributions = [];
    let explainedReturn = 0;
    
    for (const [factor, exposure] of Object.entries(factorExposures)) {
      const factorRet = factorReturns[factor] || 0;
      const contribution = exposure * factorRet;
      explainedReturn += contribution;
      
      factorContributions.push({
        factor,
        exposure,
        contribution,
      });
    }
    
    const specificReturn = portfolioReturn - explainedReturn;
    
    // Simplified R-squared calculation
    const rSquared = explainedReturn !== 0 ? Math.pow(explainedReturn / portfolioReturn, 2) : 0;
    
    return {
      totalReturn: portfolioReturn,
      factorContributions,
      specificReturn,
      rSquared,
    };
  }

  /**
   * Calculate Rolling Returns
   */
  calculateRollingReturns(returns: number[], windowDays: number = 252): number[] {
    const rollingReturns: number[] = [];
    
    for (let i = windowDays - 1; i < returns.length; i++) {
      const windowReturns = returns.slice(i - windowDays + 1, i + 1);
      const cumulativeReturn = windowReturns.reduce((acc, r) => acc * (1 + r), 1) - 1;
      rollingReturns.push(cumulativeReturn);
    }
    
    return rollingReturns;
  }

  /**
   * Calculate Up/Down Capture Ratios
   */
  calculateCaptureRatios(
    portfolioReturns: number[],
    benchmarkReturns: number[]
  ): { upCapture: number; downCapture: number } {
    const upPeriods: { portfolio: number[]; benchmark: number[] } = { portfolio: [], benchmark: [] };
    const downPeriods: { portfolio: number[]; benchmark: number[] } = { portfolio: [], benchmark: [] };
    
    for (let i = 0; i < portfolioReturns.length; i++) {
      if (benchmarkReturns[i] > 0) {
        upPeriods.portfolio.push(portfolioReturns[i]);
        upPeriods.benchmark.push(benchmarkReturns[i]);
      } else {
        downPeriods.portfolio.push(portfolioReturns[i]);
        downPeriods.benchmark.push(benchmarkReturns[i]);
      }
    }
    
    const upCapture = upPeriods.benchmark.reduce((a, b) => a + b, 0) !== 0
      ? upPeriods.portfolio.reduce((a, b) => a + b, 0) / upPeriods.benchmark.reduce((a, b) => a + b, 0)
      : 0;
    
    const downCapture = downPeriods.benchmark.reduce((a, b) => a + b, 0) !== 0
      ? downPeriods.portfolio.reduce((a, b) => a + b, 0) / downPeriods.benchmark.reduce((a, b) => a + b, 0)
      : 0;
    
    return { upCapture, downCapture };
  }

  // Helper methods

  private calculateTotalReturn(returns: number[]): number {
    return returns.reduce((acc, r) => acc * (1 + r), 1) - 1;
  }

  private calculateAnnualizedReturn(returns: number[]): number {
    const totalReturn = this.calculateTotalReturn(returns);
    const years = returns.length / 252;
    return Math.pow(1 + totalReturn, 1 / years) - 1;
  }

  private calculateVolatility(returns: number[]): number {
    const stdDev = this.standardDeviation(returns);
    return stdDev * Math.sqrt(252); // Annualize
  }

  private mean(values: number[]): number {
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private standardDeviation(values: number[]): number {
    const avg = this.mean(values);
    const squareDiffs = values.map(v => Math.pow(v - avg, 2));
    return Math.sqrt(this.mean(squareDiffs));
  }

  private solveIRR(flows: Array<{ date: Date; amount: number }>): number {
    // Newton-Raphson method to solve for IRR
    let irr = 0.1; // Initial guess
    const maxIterations = 100;
    const tolerance = 1e-6;
    
    for (let i = 0; i < maxIterations; i++) {
      const npv = this.calculateNPV(flows, irr);
      const derivative = this.calculateNPVDerivative(flows, irr);
      
      if (Math.abs(derivative) < 1e-10) break;
      
      const newIrr = irr - npv / derivative;
      
      if (Math.abs(newIrr - irr) < tolerance) {
        return newIrr;
      }
      
      irr = newIrr;
    }
    
    return irr;
  }

  private calculateNPV(flows: Array<{ date: Date; amount: number }>, rate: number): number {
    const baseDate = flows[0].date;
    
    return flows.reduce((npv, flow) => {
      const years = (flow.date.getTime() - baseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return npv + flow.amount / Math.pow(1 + rate, years);
    }, 0);
  }

  private calculateNPVDerivative(flows: Array<{ date: Date; amount: number }>, rate: number): number {
    const baseDate = flows[0].date;
    
    return flows.reduce((deriv, flow) => {
      const years = (flow.date.getTime() - baseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return deriv - years * flow.amount / Math.pow(1 + rate, years + 1);
    }, 0);
  }

  private getPortfolioValueAtDate(data: ReturnData, date: Date): number {
    // Find the portfolio value at the given date
    const index = data.date.findIndex(d => d >= date);
    return index >= 0 ? data.portfolioValue[index] : data.portfolioValue[data.portfolioValue.length - 1];
  }
}
