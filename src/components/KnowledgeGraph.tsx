"use client";

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { KnowledgeGraphData, KnowledgeNode } from '../lib/knowledge-graph';

interface KnowledgeGraphProps {
  data: KnowledgeGraphData;
  width?: number;
  height?: number;
  onNodeClick?: (node: KnowledgeNode) => void;
}

export default function KnowledgeGraph({
  data,
  width = 760,
  height = 460,
  onNodeClick,
}: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const nodes = data.nodes.map((d) => ({ ...d }));
    const links = data.links.map((d) => ({ ...d }));

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', [0, 0, width, height]);

    const g = svg.append('g');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        'link',
        d3
          .forceLink(links as any)
          .id((d: any) => d.id)
          .distance((d: any) => (d.relationship === 'belongs_to' ? 58 : 42))
      )
      .force('charge', d3.forceManyBody().strength(-110))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(18));

    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#dcd9d0')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 1);

    const node = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .on('click', (_event, d: any) => {
        if (onNodeClick) onNodeClick(d);
      })
      .call(drag(simulation) as any);

    node
      .append('circle')
      .attr('r', (d: any) => getNodeRadius(d))
      .attr('fill', (d: any) => getNodeColor(d.type))
      .attr('stroke', '#faf9f5')
      .attr('stroke-width', 1.5);

    node
      .filter((d: any) => d.type === 'category' || d.weight >= 3)
      .append('text')
      .text((d: any) => d.label)
      .attr('x', (d: any) => getNodeRadius(d) + 5)
      .attr('y', '0.32em')
      .style('font-size', (d: any) => (d.type === 'category' ? '12px' : '10.5px'))
      .style('font-weight', (d: any) => (d.type === 'category' ? '600' : '400'))
      .style('fill', '#3d3d3a')
      .style('pointer-events', 'none');

    node.append('title').text((d: any) => d.label);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [data, width, height, onNodeClick]);

  return (
    <div className="knowledge-graph-box">
      <svg ref={svgRef} width="100%" height={height} />
      <div className="graph-legend">
        <span><i className="dot cat-dot" /> 分类</span>
        <span><i className="dot post-dot" /> 文章</span>
        <span><i className="dot tag-dot" /> 标签</span>
      </div>
    </div>
  );
}

function getNodeRadius(node: any) {
  switch (node.type) {
    case 'category':
      return 8.5;
    case 'article':
      return 4.5;
    case 'tag':
      return Math.min(6.5, 3.5 + Math.sqrt(node.weight || 1));
    default:
      return 4.5;
  }
}

function getNodeColor(type: string) {
  switch (type) {
    case 'category':
      return '#2f6f5e';
    case 'article':
      return '#6b8e78';
    case 'tag':
      return '#b5895a';
    default:
      return '#8c8c88';
  }
}

function drag(simulation: any) {
  function dragstarted(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: any) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event: any) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
}
