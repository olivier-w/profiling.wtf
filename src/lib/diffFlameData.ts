// Differential flame graph data
// Shows before/after adding caching to parseJSON

export interface DiffNode {
  name: string
  before: number  // samples before optimization
  after: number   // samples after optimization
  children?: DiffNode[]
}

// Story: We added caching to parseJSON. It now only runs on cache misses.
// parseJSON went from 40 samples to 10 samples (75% improvement)
// But we added a small overhead for cache lookup (5 samples)
export const diffData: DiffNode = {
  name: 'main',
  before: 100,
  after: 75,  // Overall 25% improvement
  children: [
    {
      name: 'handleRequest',
      before: 100,
      after: 75,
      children: [
        {
          name: 'log',
          before: 10,
          after: 10,  // No change
        },
        {
          name: 'processData',
          before: 90,
          after: 65,
          children: [
            {
              name: 'checkCache',  // NEW - added overhead
              before: 0,
              after: 5,
            },
            {
              name: 'parseJSON',
              before: 40,
              after: 10,  // 75% improvement due to caching
            },
            {
              name: 'transform',
              before: 20,
              after: 20,  // No change
            },
            {
              name: 'validate',
              before: 30,
              after: 30,  // No change
            },
          ],
        },
      ],
    },
  ],
}
