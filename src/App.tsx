import * as d3 from 'd3';
import React from 'react';
import './App.css';
import jpg from './lxt.jpg';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  radius: number;
  src: string;
}

const width = 1000;
const height = 600;
const nodes: Node[] = [
  { id: 'Alice', radius: 40, src: jpg },
  { id: 'Bob', radius: 35, src: jpg },
  { id: 'Carol', radius: 35, src: jpg }
];
const links = [
  { source: 'Alice', target: 'Bob', relation: '弟弟' },
  { source: 'Bob', target: 'Alice', relation: '同行' },
  { source: 'Bob', target: 'Carol', relation: '弟弟' }
];

class App extends React.Component<any, any> {
  componentDidMount() {
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
    const svg = d3.select('svg').call(this.zoomed());
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

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 2);
    const node = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node');

    node
      .append('circle')
      .attr('class', 'node-circle')
      .attr('r', d => d.radius)
      .attr('fill', d => `url(#image-${d.index})`)
      .call(this.drag(simulation));
    node
      .append('text')
      .attr('class', 'node-text')
      .html(d => d.id);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      node.attr('transform', d => `translate(${d.x!} ${d.y!})`);
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

  zoomed(): any {
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
