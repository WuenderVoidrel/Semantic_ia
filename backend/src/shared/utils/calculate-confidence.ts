type ConfidenceInput = {
  exactSynonymMatch: boolean;
  metricNameMatch: boolean;
  periodDetected: boolean;
  groupByDetected: boolean;
  domainDetected: boolean;
};

export function calculateConfidence(input: ConfidenceInput) {
  let score = 0;

  if (input.exactSynonymMatch) {
    score += 0.5;
  }

  if (input.metricNameMatch) {
    score += 0.3;
  }

  if (input.periodDetected) {
    score += 0.1;
  }

  if (input.groupByDetected) {
    score += 0.1;
  }

  if (input.domainDetected) {
    score += 0.1;
  }

  return Math.min(Number(score.toFixed(2)), 1);
}
