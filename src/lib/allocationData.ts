// Memory allocation flame graph data
// Shows bytes allocated through each call path

export interface AllocationNode {
  name: string
  bytes: number       // total bytes allocated through this path
  selfBytes?: number  // bytes allocated directly by this function
  children?: AllocationNode[]
}

// Sample data: A web request handler that allocates memory
// - parseJSON allocates buffers for parsing
// - buildResponse creates the response objects
// - imageResize is a memory hog
export const allocationData: AllocationNode = {
  name: 'handleRequest',
  bytes: 52_428_800,  // 50 MB total
  selfBytes: 0,
  children: [
    {
      name: 'parseBody',
      bytes: 5_242_880,  // 5 MB
      selfBytes: 1_048_576,  // 1 MB for buffer
      children: [
        {
          name: 'parseJSON',
          bytes: 4_194_304,  // 4 MB
          selfBytes: 4_194_304,  // All self (creates objects)
        },
      ],
    },
    {
      name: 'processImage',
      bytes: 41_943_040,  // 40 MB - the memory hog!
      selfBytes: 0,
      children: [
        {
          name: 'decodeImage',
          bytes: 10_485_760,  // 10 MB
          selfBytes: 10_485_760,
        },
        {
          name: 'resizeImage',
          bytes: 20_971_520,  // 20 MB - biggest allocator
          selfBytes: 20_971_520,
        },
        {
          name: 'encodeImage',
          bytes: 10_485_760,  // 10 MB
          selfBytes: 10_485_760,
        },
      ],
    },
    {
      name: 'buildResponse',
      bytes: 5_242_880,  // 5 MB
      selfBytes: 5_242_880,
    },
  ],
}

// Format bytes to human readable
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
