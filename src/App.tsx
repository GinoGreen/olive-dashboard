import { RouterProvider } from "react-router-dom";
import router from "./router";
import { OleificioProvider } from "./context/OleificioProvider";

function App() {
	return (
		<OleificioProvider>
			<RouterProvider router={router} />
		</OleificioProvider>
	);
}

export default App;
