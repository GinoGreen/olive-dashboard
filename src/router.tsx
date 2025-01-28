import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./components/layouts/RootLayout";
import ProcessingSection from "./components/ProcessingSection";
import QualitySection from "./components/QualitySection";
import EnvironmentalSection from "./components/EnvironmentalSection";
import MachineSection from "./components/MachineSection";
import HomePage from "./components/HomePage";

const router = createBrowserRouter([
	{
		element: <RootLayout />,
		children: [
			{
				path: "/",
				element: <HomePage />,
			},
			{
				path: "/processing",
				element: <ProcessingSection />,
			},
			{
				path: "/quality",
				element: <QualitySection />,
			},
			{
				path: "/environmental",
				element: <EnvironmentalSection />,
			},
			{
				path: "/machine",
				element: <MachineSection />,
			},
		],
	},
]);

export default router;
