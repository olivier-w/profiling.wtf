export interface FlameNode {
  name: string
  value: number      // total samples (includes children)
  selfValue?: number // samples where this was top of stack
  children?: FlameNode[]
}

// Sample data designed to teach self-time vs total-time:
// - main and handleRequest have high total, near-zero self
// - parseJSON has high self (actual work)
// - validate and transform have moderate self
// - log has low total but 100% self (leaf node)
export const sampleFlameData: FlameNode = {
  name: 'main',
  value: 8,
  selfValue: 0,
  children: [
    {
      name: 'handleRequest',
      value: 8,
      selfValue: 0,
      children: [
        {
          name: 'log',
          value: 1,
          selfValue: 1,
        },
        {
          name: 'processData',
          value: 7,
          selfValue: 0,
          children: [
            {
              name: 'parseJSON',
              value: 4,
              selfValue: 4,
            },
            {
              name: 'transform',
              value: 1,
              selfValue: 1,
            },
            {
              name: 'validate',
              value: 2,
              selfValue: 2,
            },
          ],
        },
      ],
    },
  ],
}

// Raw samples for the BuildDemo section
export const rawSamples = [
  'main;handleRequest;processData;parseJSON',
  'main;handleRequest;processData;parseJSON',
  'main;handleRequest;processData;validate',
  'main;handleRequest;processData;validate',
  'main;handleRequest;processData;parseJSON',
  'main;handleRequest;log',
  'main;handleRequest;processData;transform',
  'main;handleRequest;processData;parseJSON',
]

// Folded samples with counts
export const foldedSamples = [
  { stack: 'main;handleRequest;processData;parseJSON', count: 4 },
  { stack: 'main;handleRequest;processData;validate', count: 2 },
  { stack: 'main;handleRequest;processData;transform', count: 1 },
  { stack: 'main;handleRequest;log', count: 1 },
]

// Sorted samples (siblings sorted alphabetically)
export const sortedSamples = [
  { stack: 'main;handleRequest;log', count: 1 },
  { stack: 'main;handleRequest;processData;parseJSON', count: 4 },
  { stack: 'main;handleRequest;processData;transform', count: 1 },
  { stack: 'main;handleRequest;processData;validate', count: 2 },
]
