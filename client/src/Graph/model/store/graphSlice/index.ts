import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Node {
	id: string;
	type: string;
	name: string;
	usdt_balance: number;
	tokens: { name: string; amount: number; usdt_amount: number }[];
}

export interface Link {
	id: string;
	sender: string;
	receiver: string;
	usdt_amount: number;
	tokens_amount: { name: string; amount: number; usdt_amount: number }[];
}

interface GraphState {
	nodes: Node[];
	links: Link[];
	loading: boolean;
}

const initialState: GraphState = {
	nodes: [],
	links: [],
	loading: false,
};

export const fetchGraphData = createAsyncThunk('graph/fetchGraphData', async (address: string) => {
	const response = await fetch('http://localhost:3000/messages', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ address }),
	});
	return await response.json();
});

const graphSlice = createSlice({
	name: 'graph',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder
			.addCase(fetchGraphData.pending, state => {
				state.loading = true;
			})
			.addCase(fetchGraphData.fulfilled, (state, action) => {
				state.nodes = action.payload.nodes;
				state.links = action.payload.links;
				state.loading = false;
			});
	},
});

export default graphSlice.reducer;
