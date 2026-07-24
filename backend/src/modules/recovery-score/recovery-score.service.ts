import { recoveryScoreRepository } from './recovery-score.repository';
import { CreateRecoveryInput, RecoveryScoreResponse } from './recovery-score.types';

export class RecoveryScoreService {
  calculateScore(data: CreateRecoveryInput): { score: number; recommendation: string } {
    let sleepPoints = 0;
    if (data.sleepHours >= 7 && data.sleepHours <= 9) sleepPoints = 100;
    else if (data.sleepHours > 9) sleepPoints = 85;
    else if (data.sleepHours >= 6) sleepPoints = 75;
    else if (data.sleepHours >= 5) sleepPoints = 50;
    else sleepPoints = 25;

    let qualityPoints = 0;
    if (data.sleepQuality === 'EXCELLENT') qualityPoints = 100;
    else if (data.sleepQuality === 'GOOD') qualityPoints = 80;
    else if (data.sleepQuality === 'FAIR') qualityPoints = 50;
    else qualityPoints = 20;

    let hydrationPoints = 0;
    if (data.hydrationLevel === 'HIGH') hydrationPoints = 100;
    else if (data.hydrationLevel === 'MEDIUM') hydrationPoints = 70;
    else hydrationPoints = 30;

    let stressPoints = 0;
    if (data.stressLevel === 'LOW') stressPoints = 100;
    else if (data.stressLevel === 'MEDIUM') stressPoints = 60;
    else stressPoints = 20;

    let sorenessPoints = 0;
    if (data.sorenessLevel === 'NONE') sorenessPoints = 100;
    else if (data.sorenessLevel === 'LIGHT') sorenessPoints = 60;
    else sorenessPoints = 20;

    let energyPoints = 0;
    if (data.energyLevel === 'HIGH') energyPoints = 100;
    else if (data.energyLevel === 'MEDIUM') energyPoints = 60;
    else energyPoints = 20;

    const rawScore = 
      (sleepPoints * 0.3) +
      (qualityPoints * 0.2) +
      (hydrationPoints * 0.15) +
      (stressPoints * 0.15) +
      (sorenessPoints * 0.1) +
      (energyPoints * 0.1);

    const score = Math.round(rawScore);

    let recommendation = '';
    if (score >= 80) {
      recommendation = 'Fully recovered. Ready for optimal training.';
    } else if (score >= 60) {
      recommendation = 'Moderately recovered. Consider slight volume/intensity reduction.';
    } else if (score >= 40) {
      recommendation = 'Low recovery. Reduced workout focus recommended.';
    } else {
      recommendation = 'Poor recovery. Active recovery, mobility work, or complete rest recommended.';
    }

    return { score, recommendation };
  }

  async createEntry(userId: string, data: CreateRecoveryInput): Promise<RecoveryScoreResponse> {
    const { score, recommendation } = this.calculateScore(data);
    return recoveryScoreRepository.saveRecoveryEntry(userId, data, score, recommendation);
  }

  async getLatestEntry(userId: string): Promise<RecoveryScoreResponse | null> {
    return recoveryScoreRepository.getLatestRecoveryEntry(userId);
  }
}

export const recoveryScoreService = new RecoveryScoreService();
