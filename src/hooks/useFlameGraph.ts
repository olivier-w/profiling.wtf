import { useState, useCallback, useMemo } from 'react'
import { hierarchy, type HierarchyNode } from 'd3-hierarchy'
import type { FlameNode } from '../lib/flameGraphData'

export interface ProcessedNode {
  data: FlameNode
  x0: number
  x1: number
  depth: number
  id: string
}

export function useFlameGraph(data: FlameNode) {
  const [zoomNode, setZoomNode] = useState<ProcessedNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<ProcessedNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isIcicle, setIsIcicle] = useState(false)

  // Build hierarchy
  const root = useMemo(() => {
    return hierarchy(data)
      .sum(d => d.selfValue ?? 0)
      .sort((a, b) => (a.data.name || '').localeCompare(b.data.name || ''))
  }, [data])

  // Total samples for percentage calculations
  const totalSamples = data.value

  // Process nodes into flat array with positions
  const processedNodes = useMemo(() => {
    const nodes: ProcessedNode[] = []
    const activeRoot = zoomNode ? 
      root.descendants().find(n => n.data.name === zoomNode.data.name) || root 
      : root

    function processNode(
      node: HierarchyNode<FlameNode>,
      x0: number,
      width: number,
      depth: number,
      path: string
    ) {
      const id = `${path}/${node.data.name}`
      nodes.push({
        data: node.data,
        x0,
        x1: x0 + width,
        depth,
        id,
      })

      if (node.children) {
        // Sort children alphabetically
        const sortedChildren = [...node.children].sort((a, b) => 
          a.data.name.localeCompare(b.data.name)
        )
        
        let childX = x0
        const parentValue = node.data.value || 1
        
        for (const child of sortedChildren) {
          const childValue = child.data.value || 0
          const childWidth = (childValue / parentValue) * width
          processNode(child, childX, childWidth, depth + 1, id)
          childX += childWidth
        }
      }
    }

    processNode(activeRoot, 0, 1, 0, '')

    // If zoomed, adjust positions to fill width
    if (zoomNode) {
      const zoomNodeData = nodes.find(n => n.data.name === zoomNode.data.name)
      if (zoomNodeData) {
        const scale = 1 / (zoomNodeData.x1 - zoomNodeData.x0)
        const offset = zoomNodeData.x0
        for (const n of nodes) {
          n.x0 = (n.x0 - offset) * scale
          n.x1 = (n.x1 - offset) * scale
        }
      }
    }

    return nodes
  }, [root, zoomNode])

  // Search matching
  const matchingNodeIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>()
    const query = searchQuery.toLowerCase()
    return new Set(
      processedNodes
        .filter(n => n.data.name.toLowerCase().includes(query))
        .map(n => n.id)
    )
  }, [processedNodes, searchQuery])

  // Search stats
  const searchStats = useMemo(() => {
    if (!searchQuery.trim() || matchingNodeIds.size === 0) return null
    
    const matchingNodes = processedNodes.filter(n => matchingNodeIds.has(n.id))
    const totalMatchingSamples = matchingNodes.reduce((sum, n) => sum + (n.data.selfValue || 0), 0)
    const percentage = ((totalMatchingSamples / totalSamples) * 100).toFixed(1)
    
    return {
      count: matchingNodeIds.size,
      percentage,
    }
  }, [matchingNodeIds, processedNodes, totalSamples, searchQuery])

  const handleZoom = useCallback((node: ProcessedNode | null) => {
    setZoomNode(node)
  }, [])

  const handleResetZoom = useCallback(() => {
    setZoomNode(null)
  }, [])

  const handleHover = useCallback((node: ProcessedNode | null) => {
    setHoveredNode(node)
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const toggleLayout = useCallback(() => {
    setIsIcicle(prev => !prev)
  }, [])

  return {
    processedNodes,
    zoomNode,
    hoveredNode,
    searchQuery,
    searchStats,
    matchingNodeIds,
    isIcicle,
    totalSamples,
    handleZoom,
    handleResetZoom,
    handleHover,
    handleSearch,
    toggleLayout,
  }
}
