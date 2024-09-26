import { useSelector } from 'react-redux';
import { RootState } from './store';

function App() {
	const data = useSelector<RootState>(state => state.graph);
	console.log(data);
	return <></>;
}

export default App;
