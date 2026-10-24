/** Estimate the operation count where indexed lookup repays its setup cost.
 * All times must come from measured benchmark samples using the same workload/environment.
 */
export function estimateBreakEven({ arraySetupMs = 0, mapSetupMs, arrayPerOperationMs, mapPerOperationMs, noisy = false }) {
  const values = [arraySetupMs, mapSetupMs, arrayPerOperationMs, mapPerOperationMs];
  if (values.some((v) => typeof v !== 'number' || !Number.isFinite(v) || v < 0)) return { status: 'unavailable', reason: 'Missing or invalid measured timing inputs.' };
  if (noisy) return { status: 'unavailable', reason: 'Measurement variability is too high to trust a crossover estimate.' };
  const savedPerOperation = arrayPerOperationMs - mapPerOperationMs;
  if (savedPerOperation <= 0) return { status: 'no-crossover', reason: 'The indexed strategy has no measured per-operation advantage.' };
  const setupDifference = Math.max(0, mapSetupMs - arraySetupMs);
  const operations = Math.ceil(setupDifference / savedPerOperation);
  return { status: 'estimated', operations, setupDifferenceMs: setupDifference, savedPerOperationMs: savedPerOperation, caveat: 'Approximation from measured medians; workload, cache, runtime and host changes can shift the crossover.' };
}
