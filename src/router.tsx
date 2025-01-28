import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./components/layouts/RootLayout";
import ProcessingSection from "./components/ProcessingSection";

const router = createBrowserRouter([
	{
		element: <RootLayout />,
		children: [
			{
				path: "/",
				element: <></>,
			},
			{
				path: "/processing",
				element: <ProcessingSection />,
			},
			// {
			// 	path: "/quality",
			// 	element: <AreaSelection />,
			// },
			// {
			// 	path: "/envinromental",
			// 	element: <TableSelection />,
			// },
			// {
			// 	path: "/machine",
			// 	element: <TableSelection />,
			// },
		],
	},
]);

export default router;
