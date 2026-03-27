import type { GraphUiConfig } from 'orgnote-api';

export const DEFAULT_GRAPH_CONFIG: GraphUiConfig = {
  nodeRelSize: 4,
  linkDistance: 50,
  chargeStrength: -80,
  warmupTicks: 150,
  velocityDecay: 0.3,
  initialZoom: 1.5,
  labelFontSize: 12,
  linkWidth: 0.5,
};
