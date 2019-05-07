import * as d3 from 'd3';
import React from 'react';
import './App.css';
import jpg from './lxt.jpg';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  radius: number;
  src: string;
}
interface Link extends d3.SimulationLinkDatum<d3.SimulationNodeDatum> {
  source: string;
  target: string;
  label: string;
  color: string;
}

const width = 1000;
const height = 600;
const nodes: Node[] = [
  { id: 'Alice', radius: 40, src: jpg },
  { id: 'Bob', radius: 35, src: jpg },
  { id: 'Carol', radius: 35, src: jpg }
];
const links: Link[] = [
  { source: 'Alice', target: 'Bob', label: '弟弟', color: '#1890ff' },
  { source: 'Bob', target: 'Alice', label: '同行', color: 'orange' },
  { source: 'Alice', target: 'Carol', label: '弟弟', color: '#1890ff' }
];

class App extends React.Component<any, any> {
  componentDidMount() {
    // 创建力学仿真容器
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(200)
      )
      .force('charge', d3.forceManyBody())
      .force('collision', d3.forceCollide(50))
      .force('center', d3.forceCenter(width / 2, height / 2));
    // 获取 svg
    const svg = d3.select('svg').call(this.zoome());

    // 定义节点背景图
    svg
      .append('defs')
      .selectAll('pattern')
      .data(nodes)
      .join('pattern')
      .attr('id', d => `image-${d.index}`)
      .attr('width', d => d.radius * 2)
      .attr('height', d => d.radius * 2)
      .append('image')
      .attr('href', d => d.src)
      .attr('width', d => d.radius * 2)
      .attr('height', d => d.radius * 2);
    // 定义连接线箭头
    svg
      .append('defs')
      .selectAll('marker')
      .data(links)
      .join('marker')
      .attr('id', d => `marker-${d.index}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('refX', (d: any) => d.target.radius + 5)
      .attr('refY', 0)
      .attr('markerWidth', 12)
      .attr('markerHeight', 12)
      .attr('orient', 'auto')
      .attr('stroke-width', 2)
      .append('path')
      .attr('d', 'M2,0 L0,-3 L9,0 L0,3 M2,0 L0,-3')
      .attr('fill', d => d.color);

    const link = svg
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('id', d => `link-${d.index}`)
      .attr('class', 'link')
      .attr('stroke', d => d.color)
      .attr('marker-end', d => `url(#marker-${d.index})`);
    const node = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node');

    svg
      .append('g')
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('class', 'link-text')
      .append('textPath')
      .attr('href', d => `#link-${d.index}`)
      .text(d => d.label);
    node
      .append('circle')
      .attr('class', 'node-circle')
      .attr('r', d => d.radius)
      .attr('fill', d => `url(#image-${d.index})`)
      .call(this.drag(simulation));
    node
      .append('text')
      .attr('class', 'node-text')
      .text(d => d.id);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      node
        .selectAll('*')
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  }

  drag(simulation: any): any {
    function dragstarted(d: any) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d: any) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d: any) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  zoome(): any {
    return d3.zoom().on('zoom', function() {
      // d3.select(this).style('background', '#ccc');
    });
  }

  render() {
    return (
      <div className="app">
        <svg width={width} height={height} />
      </div>
    );
  }
}

export default App;
