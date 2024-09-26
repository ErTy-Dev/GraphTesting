import { configureStore } from '@reduxjs/toolkit';
import { graphReducer } from '../Graph/model';
import { useDispatch, useSelector } from 'react-redux';

const store = configureStore({
	reducer: {
		graph: graphReducer,
	},
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export default store;
