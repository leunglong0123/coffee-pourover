import { TasteProfile, BrewingRecommendation } from '../models';

export class RecommendationEngine {
  private static readonly THRESHOLD = 0.33;

  static generateRecommendations(tasteProfile: TasteProfile): BrewingRecommendation[] {
    const recommendations: BrewingRecommendation[] = [];
    const { x, y } = tasteProfile;

    if (x > this.THRESHOLD) {
      recommendations.push(
        { type: 'grind', message: 'Grind coarser', priority: 'primary' },
        { type: 'temperature', message: 'Lower water temp by 1-2°C', priority: 'secondary' },
        { type: 'time', message: 'Reduce contact time', priority: 'tertiary' }
      );
    } else if (x < -this.THRESHOLD) {
      recommendations.push(
        { type: 'grind', message: 'Grind finer', priority: 'primary' },
        { type: 'temperature', message: 'Raise water temp by 1-2°C', priority: 'secondary' },
        { type: 'time', message: 'Increase contact time for better extraction', priority: 'tertiary' }
      );
    }

    if (y < -this.THRESHOLD) {
      recommendations.push(
        { type: 'dose', message: 'Increase coffee dose', priority: 'primary' },
        { type: 'ratio', message: 'Reduce water ratio (e.g., 1:15 → 1:14)', priority: 'secondary' }
      );

      if (!recommendations.some(r => r.type === 'grind')) {
        recommendations.push({ type: 'grind', message: 'Grind slightly finer', priority: 'tertiary' });
      }
    } else if (y > this.THRESHOLD) {
      recommendations.push(
        { type: 'dose', message: 'Decrease coffee dose', priority: 'primary' },
        { type: 'ratio', message: 'Increase water ratio (e.g., 1:15 → 1:16)', priority: 'secondary' }
      );

      if (!recommendations.some(r => r.type === 'grind')) {
        recommendations.push({ type: 'grind', message: 'Grind slightly coarser', priority: 'tertiary' });
      }
    }

    return this.deduplicateAndPrioritize(recommendations);
  }

  private static deduplicateAndPrioritize(recommendations: BrewingRecommendation[]): BrewingRecommendation[] {
    const priorityOrder: Record<BrewingRecommendation['type'], number> = {
      grind: 1,
      ratio: 2,
      dose: 3,
      temperature: 4,
      time: 5,
    };

    const uniqueRecommendations = recommendations.reduce((acc, rec) => {
      const existing = acc.find(r => r.type === rec.type);
      if (!existing) {
        acc.push(rec);
      } else if (rec.priority === 'primary' && existing.priority !== 'primary') {
        acc[acc.indexOf(existing)] = rec;
      }
      return acc;
    }, [] as BrewingRecommendation[]);

    return uniqueRecommendations
      .sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type])
      .slice(0, 3);
  }

  static getTasteDescription(tasteProfile: TasteProfile): string {
    const { x, y } = tasteProfile;

    let xDesc = 'Balanced';
    if (x > this.THRESHOLD) xDesc = 'Bitter/Harsh';
    else if (x < -this.THRESHOLD) xDesc = 'Sour/Acidic';
    else if (x > 0.1) xDesc = 'Slightly Bitter';
    else if (x < -0.1) xDesc = 'Slightly Sour';

    let yDesc = 'Balanced Strength';
    if (y > this.THRESHOLD) yDesc = 'Strong/Muddy';
    else if (y < -this.THRESHOLD) yDesc = 'Weak/Watery';
    else if (y > 0.1) yDesc = 'Strong';
    else if (y < -0.1) yDesc = 'Weak';

    return `${xDesc}, ${yDesc}`;
  }

  static isProfileBalanced(tasteProfile: TasteProfile): boolean {
    return Math.abs(tasteProfile.x) <= 0.2 && Math.abs(tasteProfile.y) <= 0.2;
  }
}