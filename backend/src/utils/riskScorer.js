function calculateRiskScore(factors) {
  let score = 0;
  let appliedFactors = [];

  if (factors.failedLogins > 0) {
    const p = Math.min(factors.failedLogins * 15, 30);
    score += p;
    appliedFactors.push(`Failed logins (${factors.failedLogins}) : +${p}`);
  }

  if (factors.unusualTimeLogin) {
    score += 20;
    appliedFactors.push('Unusual time login : +20');
  }

  if (factors.unusualActivityVolume) {
    score += 15;
    appliedFactors.push('Unusual activity volume : +15');
  }

  if (factors.sensitiveResourceAccess) {
    score += 20;
    appliedFactors.push('Sensitive resource access : +20');
  }

  if (factors.unknownDevice) {
    score += 20;
    appliedFactors.push('Unknown device login : +20');
  }

  if (factors.policyViolations > 0) {
    const p = Math.min(factors.policyViolations * 10, 20);
    score += p;
    appliedFactors.push(`Policy violations (${factors.policyViolations}) : +${p}`);
  }

  if (factors.dataExports > 0) {
    const p = Math.min(factors.dataExports * 10, 20);
    score += p;
    appliedFactors.push(`Data exports (${factors.dataExports}) : +${p}`);
  }

  if (factors.previousAlerts > 0) {
    const p = Math.min(factors.previousAlerts * 5, 15);
    score += p;
    appliedFactors.push(`Previous alerts (${factors.previousAlerts}) : +${p}`);
  }

  score = Math.min(score, 100);

  let level = 'LOW';
  if (score >= 80) level = 'CRITICAL';
  else if (score >= 60) level = 'HIGH';
  else if (score >= 30) level = 'MEDIUM';

  return {
    score,
    level,
    factors: appliedFactors
  };
}

module.exports = { calculateRiskScore };
