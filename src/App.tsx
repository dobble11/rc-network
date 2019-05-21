import * as d3 from 'd3';
import _ from 'lodash';
import React from 'react';
import './App.css';
import jpg from './lxt.jpg';

interface Node extends d3.SimulationNodeDatum {
  id: number;
  label: string;
  radius: number;
  src: string;
}
interface Link extends d3.SimulationLinkDatum<d3.SimulationNodeDatum> {
  id: number;
  source: number;
  target: number;
  label: string;
  type: 'relation' | 'walk';
}

const width = 1000;
const height = 600;
const nodes: Node[] = _.range(500).map(i => ({
  id: i,
  label: i.toString(),
  radius: 15,
  src: jpg
}));
const links: Link[] = _.range(200).map(i => ({
  id: i,
  source: i,
  target: _.random(499, false),
  label: '同行',
  type: _.random() > 0.5 ? 'relation' : 'walk'
}));

class App extends React.Component<any> {
  componentDidMount() {
    // 创建力学仿真容器
    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id))
      .force('charge', d3.forceManyBody())
      .force('collision', d3.forceCollide(100))
      .force('center', d3.forceCenter(width / 2, height / 2));
    // 创建顶级 g 作为容器，接收 transform
    const container = d3
      .select('svg')
      .call(this.zoom())
      .append('g');

    // 定义节点背景图
    container
      .append('defs')
      .selectAll('pattern')
      .data(nodes)
      .join('pattern')
      .attr('id', d => `image-${d.id}`)
      .attr('width', d => d.radius * 2)
      .attr('height', d => d.radius * 2)
      .append('image')
      .attr('href', d => d.src)
      .attr('width', d => d.radius * 2)
      .attr('height', d => d.radius * 2);
    // 定义连接线箭头
    container
      .append('defs')
      .selectAll('marker')
      .data(['relation', 'walk'])
      .join('marker')
      .attr('id', d => `marker-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 27)
      .attr('refY', -1)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5');

    const link = container
      .append('g')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('id', d => `link-${d.id}`)
      .attr('class', d => `link link-${d.type}`)
      .attr('marker-end', d => `url(#marker-${d.type})`);
    const node = container
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node');

    // 添加连接线文本
    container
      .append('g')
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('class', 'link-text')
      .attr('dy', '-0.5em')
      .append('textPath')
      .attr('href', d => `#link-${d.id}`)
      .attr('startOffset', '50%')
      .text(d => d.label);
    // 添加节点
    node
      .append('circle')
      .attr('class', 'node-circle')
      .attr('r', d => d.radius)
      .attr('fill', d => `url(#image-${d.id})`)
      .call(this.drag(simulation));

    // 添加节点文本
    node
      .append('text')
      .attr('class', 'node-text')
      .text(d => d.label);

    simulation.on('tick', () => {
      link.attr('d', this.genLinkPath);
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

  zoom(): any {
    return d3.zoom().on('zoom', function() {
      d3.select(this)
        .select('g')
        .attr('transform', d3.event.transform.toString());
    });
  }

  // 生成关系连线路径
  genLinkPath(link: any) {
    const sx = link.source.x;
    const tx = link.target.x;
    const sy = link.source.y;
    const ty = link.target.y;
    const dr = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));

    return `M${sx} ${sy} A ${dr} ${dr} 0 0 1 ${tx} ${ty}`;
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
