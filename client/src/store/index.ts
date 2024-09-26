import { configureStore } from '@reduxjs/toolkit';
import { graphReducer } from '../Graph/model';
import { useDispatch } from 'react-redux';

const store = configureStore({
	reducer: {
		graph: graphReducer,
	},
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export default store;
