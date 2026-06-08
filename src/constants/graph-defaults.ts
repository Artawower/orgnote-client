import type { GraphUiConfig } from 'orgnote-api';

export const DEFAULT_GRAPH_CONFIG: GraphUiConfig = {
  nodeRelSize: 18,
  linkDistance: 76,
  chargeStrength: -56,
  warmupTicks: 180,
  velocityDecay: 0.32,
  initialZoom: 1.5,
  labelFontSize: 12,
  linkWidth: 0.7,
};
