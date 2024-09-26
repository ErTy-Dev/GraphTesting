import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { Node, fetchGraphData } from '../model';
import * as d3 from 'd3';

const Graph = () => {
	const refRoot = useRef<HTMLDivElement>(null);
	const { links, nodes } = useAppSelector(state => state.graph);
	const dispatch = useAppDispatch();
	const [inputAddress, setInputAddress] = useState('0x0000');
	const [isUSDTVisible, setIsUSDTVisible] = useState(true);
	const [groupedNodes, setGroupedNodes] = useState<(Node & d3.SimulationNodeDatum)[]>([]);
	const [isGrouped, setIsGrouped] = useState(false);

	const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputAddress(e.target.value);
	};

	const handleSearch = () => {
		dispatch(fetchGraphData(inputAddress));
	};

	const toggleLinkAmount = () => {
		setIsUSDTVisible(!isUSDTVisible);
	};

	const groupNodes = () => {
		// Grouping logic here (example implementation)
		const newGroup = {
			id: 'group-' + Date.now(), // Unique ID for the group
			type: 'group',
			name: 'Group ' + (groupedNodes.length + 1),
			usdt_balance: groupedNodes.reduce((sum, node) => sum + node.usdt_balance, 0),
			tokens: [], // Can be modified based on your logic
		};

		setGroupedNodes([...groupedNodes, newGroup]);
		setIsGrouped(true);
	};

	const ungroupNodes = (groupId: string) => {
		// Ungrouping logic here
		setGroupedNodes(groupedNodes.filter(node => node.id !== groupId));
		setIsGrouped(false);
	};

	useEffect(() => {
		if (!nodes.length || !links.length) return;

		const svg = d3.select(refRoot.current).select('svg').attr('width', '100%').attr('height', 600).style('background-color', '#f9f9f9');
		svg.selectAll('*').remove();

		const nodesCopy: (Node & d3.SimulationNodeDatum)[] = JSON.parse(JSON.stringify(nodes));

		// Check for new address
		const newAddress = inputAddress;
		if (!nodesCopy.find(node => node.id === newAddress)) {
			const newNode = {
				id: newAddress,
				type: 'user', // Change this as needed
				name: newAddress,
				usdt_balance: 0,
				tokens: [],
			};
			nodesCopy.push(newNode);
		}

		// Create links with nodes
		const linksWithNodes = links.map(link => ({
			source: nodesCopy.find(node => node.id === link.sender),
			target: nodesCopy.find(node => node.id === link.receiver),
			amount: isUSDTVisible ? link.usdt_amount : link.token_amount, // Adjust based on visibility
		}));

		const simulation = d3
			.forceSimulation(nodesCopy)
			.force('link', d3.forceLink(linksWithNodes).distance(150).strength(1))
			.force('charge', d3.forceManyBody().strength(-200))
			.force('center', d3.forceCenter(400, 300))
			.on('tick', ticked);

		const link = svg
			.append('g')
			.selectAll('line')
			.data(linksWithNodes)
			.enter()
			.append('line')
			.attr('stroke', '#999')
			.attr('stroke-width', 2)
			.attr('marker-end', 'url(#arrow)');

		const node = svg
			.append('g')
			.selectAll('circle')
			.data(nodesCopy)
			.enter()
			.append('circle')
			.attr('r', 20)
			.attr('fill', d => {
				switch (d.type) {
					case 'user':
						return 'blue';
					case 'cex':
						return 'green';
					case 'bridge':
						return 'orange';
					case 'group':
						return 'purple'; // Group nodes
					default:
						return 'gray';
				}
			})
			.call(d3.drag().on('start', dragStarted).on('drag', dragged).on('end', dragEnded))
			.on('dblclick', (event, d) => {
				if (d.type === 'group') {
					ungroupNodes(d.id);
				} else {
					const address = d.id;
					dispatch(fetchGraphData(address));
				}
			})
			.on('click', (event, d) => {
				if (isGrouped && d.type !== 'group') {
					groupNodes();
				}
			});

		node.append('title').text(d => `${d.id}\n${d.name}\nБаланс USDT: ${d.usdt_balance}`);

		const linkLabels = svg
			.append('g')
			.selectAll('text')
			.data(linksWithNodes)
			.enter()
			.append('text')
			.attr('x', d => (d.source.x + d.target.x) / 2)
			.attr('y', d => (d.source.y + d.target.y) / 2)
			.attr('text-anchor', 'middle')
			.text(d => d.amount); // Display amounts based on visibility

		function ticked() {
			link.attr('x1', d => d.source.x)
				.attr('y1', d => d.source.y)
				.attr('x2', d => d.target.x)
				.attr('y2', d => d.target.y);

			node.attr('cx', d => d.x).attr('cy', d => d.y);

			linkLabels.attr('x', d => (d.source.x + d.target.x) / 2).attr('y', d => (d.source.y + d.target.y) / 2);
		}

		function dragStarted(event: any, d: any) {
			if (!event.active) simulation.alphaTarget(0.3).restart();
			d.fx = d.x;
			d.fy = d.y;
		}

		function dragged(event: any, d: any) {
			d.fx = event.x;
			d.fy = event.y;
		}

		function dragEnded(event: any, d: any) {
			if (!event.active) simulation.alphaTarget(0);
			d.fx = null;
			d.fy = null;
		}

		// Zoom and pan functionality FIX_ME
		// const zoomHandler = d3
		// 	.zoom()
		// 	.scaleExtent([0.1, 4])
		// 	.on('zoom', event => {
		// 		svg.attr('transform', event.transform);
		// 	});

		// svg.call(zoomHandler);
	}, [nodes, links, inputAddress, isUSDTVisible, groupedNodes]);

	return (
		<div>
			<div>
				<input type='text' placeholder='Введите адрес' value={inputAddress} onChange={handleAddressChange} />
				<div className='grid'>
					<button onClick={handleSearch}>Найти подграф</button>
					<button onClick={toggleLinkAmount}>{isUSDTVisible ? 'Показать по токенам' : 'Показать в долларах'}</button>
					{/* <button onClick={groupNodes} disabled={!isGrouped}>
						Группировать
					</button> */}
				</div>
			</div>
			<div ref={refRoot}>
				<svg></svg>
			</div>
		</div>
	);
};

export default Graph;
