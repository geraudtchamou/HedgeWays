/**
 * Asset Selection Engine
 * 
 * Provides multi-factor screening, scoring, and ranking of investment assets
 */

import { Injectable } from '@nestjs/common';
import { FactorLibrary, FactorType } from './factor-library';
import { ScreeningCriteria, AssetScore, ScoringModel } from './asset-selection.types';

export interface ScreeningResult {
  assetId: string;
  symbol: string;
  name: string;
  score: number;
  factorScores: Record<string, number>;
  percentileRank: number;
  sectorRank: number;
  metadata: Record<string, any>;
}

@Injectable()
export class AssetSelectionEngine {
  constructor(private readonly factorLibrary: FactorLibrary) {}

  /**
   * Execute asset screening based on criteria
   */
  async screenAssets(criteria: ScreeningCriteria): Promise<ScreeningResult[]> {
    const { universeConstraints, factorFilters, exclusionRules, inclusionRules } = criteria;

    // Step 1: Get investment universe
    let universe = await this.factorLibrary.getInvestmentUniverse(universeConstraints);

    // Step 2: Apply exclusion rules
    universe = this.applyExclusionRules(universe, exclusionRules);

    // Step 3: Apply inclusion rules
    universe = this.applyInclusionRules(universe, inclusionRules);

    // Step 4: Calculate factor values for all assets
    const factorValues = await this.calculateFactorValues(universe, factorFilters);

    // Step 5: Apply factor filters
    const filteredAssets = this.applyFactorFilters(factorValues, factorFilters);

    // Step 6: Score and rank remaining assets
    const scoredAssets = await this.scoreAndRank(filteredAssets, factorFilters);

    return scoredAssets;
  }

  /**
   * Calculate comprehensive scores for assets using a scoring model
   */
  async calculateAssetScores(
    assetIds: string[],
    scoringModel: ScoringModel
  ): Promise<AssetScore[]> {
    const scores: AssetScore[] = [];

    for (const assetId of assetIds) {
      const factorScores: Record<string, number> = {};

      // Calculate individual factor scores
      for (const weightedFactor of scoringModel.factors) {
        const factorValue = await this.factorLibrary.getFactorValue(
          assetId,
          weightedFactor.factorId
        );

        // Normalize factor value
        const normalizedScore = this.normalizeFactor(
          factorValue,
          weightedFactor.factorId,
          scoringModel.normalizationMethod
        );

        // Apply direction (positive/negative)
        const directionalScore = weightedFactor.direction === 'NEGATIVE'
          ? 1 - normalizedScore
          : normalizedScore;

        // Apply transformation if specified
        const transformedScore = this.transformScore(
          directionalScore,
          weightedFactor.transformation
        );

        factorScores[weightedFactor.factorId] = transformedScore;
      }

      // Aggregate scores
      const totalScore = this.aggregateScores(
        factorScores,
        scoringModel.factors,
        scoringModel.aggregationMethod
      );

      // Calculate rankings
      const percentileRank = await this.calculatePercentileRank(assetId, totalScore);
      const sectorRank = await this.calculateSectorRank(assetId, totalScore);
      const universeRank = await this.calculateUniverseRank(assetId, totalScore);

      scores.push({
        assetId,
        totalScore,
        factorScores,
        percentileRank,
        sectorRank,
        universeRank,
        calculatedAt: new Date(),
      });
    }

    return scores.sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Apply exclusion rules to filter out unwanted assets
   */
  private applyExclusionRules(
    assets: string[],
    rules: Array<{ type: string; criteria: any }>
  ): string[] {
    return assets.filter(assetId => {
      return !rules.some(rule => {
        switch (rule.type) {
          case 'SECTOR_EXCLUSION':
            return rule.criteria.sectors.includes(this.getAssetSector(assetId));
          case 'REGION_EXCLUSION':
            return rule.criteria.regions.includes(this.getAssetRegion(assetId));
          case 'MARKET_CAP_EXCLUSION':
            const marketCap = this.getAssetMarketCap(assetId);
            return marketCap < rule.criteria.minMarketCap || 
                   marketCap > rule.criteria.maxMarketCap;
          case 'ESG_EXCLUSION':
            const esgScore = this.getAssetESGScore(assetId);
            return esgScore < rule.criteria.minESGScore;
          default:
            return false;
        }
      });
    });
  }

  /**
   * Apply inclusion rules to ensure required assets are included
   */
  private applyInclusionRules(
    assets: string[],
    rules: Array<{ type: string; criteria: any }>
  ): string[] {
    const includedAssets = new Set(assets);

    for (const rule of rules) {
      switch (rule.type) {
        case 'MANDATORY_INCLUSION':
          rule.criteria.assetIds.forEach((id: string) => includedAssets.add(id));
          break;
        case 'SECTOR_MINIMUM':
          // Ensure minimum sector representation
          break;
      }
    }

    return Array.from(includedAssets);
  }

  /**
   * Calculate factor values for all assets in universe
   */
  private async calculateFactorValues(
    assetIds: string[],
    factorFilters: Array<{ factorId: string }>
  ): Promise<Record<string, Record<string, number>>> {
    const factorValues: Record<string, Record<string, number>> = {};

    const factorIds = [...new Set(factorFilters.map(f => f.factorId))];

    for (const assetId of assetIds) {
      factorValues[assetId] = {};

      for (const factorId of factorIds) {
        const value = await this.factorLibrary.getFactorValue(assetId, factorId);
        factorValues[assetId][factorId] = value;
      }
    }

    return factorValues;
  }

  /**
   * Apply factor filters to screen assets
   */
  private applyFactorFilters(
    factorValues: Record<string, Record<string, number>>,
    filters: Array<{
      factorId: string;
      operator: string;
      value?: number;
      minValue?: number;
      maxValue?: number;
      percentile?: number;
    }>
  ): string[] {
    return Object.keys(factorValues).filter(assetId => {
      return filters.every(filter => {
        const value = factorValues[assetId][filter.factorId];

        switch (filter.operator) {
          case 'GT':
            return value > (filter.value || 0);
          case 'LT':
            return value < (filter.value || Infinity);
          case 'EQ':
            return value === filter.value;
          case 'BETWEEN':
            return value >= (filter.minValue || -Infinity) && 
                   value <= (filter.maxValue || Infinity);
          case 'TOP_N':
            const topNThreshold = this.calculatePercentileThreshold(
              filter.factorId,
              100 - (filter.percentile || 0)
            );
            return value >= topNThreshold;
          case 'BOTTOM_N':
            const bottomNThreshold = this.calculatePercentileThreshold(
              filter.factorId,
              filter.percentile || 0
            );
            return value <= bottomNThreshold;
          default:
            return true;
        }
      });
    });
  }

  /**
   * Normalize factor value using specified method
   */
  private normalizeFactor(
    value: number,
    factorId: string,
    method: 'ZSCORE' | 'PERCENTILE' | 'MIN_MAX'
  ): number {
    switch (method) {
      case 'ZSCORE': {
        const { mean, stdDev } = this.factorLibrary.getFactorStatistics(factorId);
        return (value - mean) / stdDev;
      }
      case 'PERCENTILE': {
        return this.factorLibrary.getFactorPercentile(factorId, value);
      }
      case 'MIN_MAX': {
        const { min, max } = this.factorLibrary.getFactorRange(factorId);
        return (value - min) / (max - min);
      }
      default:
        return value;
    }
  }

  /**
   * Transform score using specified function
   */
  private transformScore(score: number, transformation?: 'LINEAR' | 'LOG' | 'SIGMOID'): number {
    switch (transformation) {
      case 'LOG':
        return Math.log(1 + score);
      case 'SIGMOID':
        return 1 / (1 + Math.exp(-score));
      case 'LINEAR':
      default:
        return score;
    }
  }

  /**
   * Aggregate factor scores into total score
   */
  private aggregateScores(
    factorScores: Record<string, number>,
    factors: Array<{ factorId: string; weight: number }>,
    method: 'WEIGHTED_SUM' | 'GEOMETRIC' | 'HARMONIC'
  ): number {
    switch (method) {
      case 'WEIGHTED_SUM': {
        return factors.reduce((sum, factor) => {
          return sum + factorScores[factor.factorId] * factor.weight;
        }, 0);
      }
      case 'GEOMETRIC': {
        const product = factors.reduce((prod, factor) => {
          return prod * Math.pow(factorScores[factor.factorId], factor.weight);
        }, 1);
        return Math.pow(product, 1 / factors.length);
      }
      case 'HARMONIC': {
        const reciprocalSum = factors.reduce((sum, factor) => {
          return sum + factor.weight / factorScores[factor.factorId];
        }, 0);
        return 1 / reciprocalSum;
      }
      default:
        return 0;
    }
  }

  /**
   * Calculate percentile rank for an asset score
   */
  private async calculatePercentileRank(assetId: string, score: number): Promise<number> {
    const allScores = await this.getAllAssetScores();
    const countBelow = allScores.filter(s => s < score).length;
    return (countBelow / allScores.length) * 100;
  }

  /**
   * Calculate sector-relative rank
   */
  private async calculateSectorRank(assetId: string, score: number): Promise<number> {
    const sector = this.getAssetSector(assetId);
    const sectorScores = await this.getSectorAssetScores(sector);
    const countBelow = sectorScores.filter(s => s < score).length;
    return (countBelow / sectorScores.length) * 100;
  }

  /**
   * Calculate universe-wide rank
   */
  private async calculateUniverseRank(assetId: string, score: number): Promise<number> {
    const allScores = await this.getAllAssetScores();
    return allScores.filter(s => s >= score).length + 1;
  }

  // Helper methods (implementation depends on data layer)
  private getAssetSector(assetId: string): string {
    // Implementation retrieves sector from reference data
    return 'TECHNOLOGY';
  }

  private getAssetRegion(assetId: string): string {
    // Implementation retrieves region from reference data
    return 'NORTH_AMERICA';
  }

  private getAssetMarketCap(assetId: string): number {
    // Implementation retrieves market cap from market data
    return 1000000000;
  }

  private getAssetESGScore(assetId: string): number {
    // Implementation retrieves ESG score from ESG data provider
    return 75;
  }

  private calculatePercentileThreshold(factorId: string, percentile: number): number {
    // Implementation calculates threshold for given percentile
    return 0;
  }

  private async getAllAssetScores(): Promise<number[]> {
    // Implementation retrieves all asset scores
    return [];
  }

  private async getSectorAssetScores(sector: string): Promise<number[]> {
    // Implementation retrieves sector-specific scores
    return [];
  }
}
