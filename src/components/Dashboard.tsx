import OleificioSimulator from "@/simulator/OleificioSimulator";
import { useEffect } from "react";

const Dashboard = () => {
	useEffect(() => {

		const oleificioSimulator = new OleificioSimulator();
		// Fetch data from API
		console.log(JSON.stringify(oleificioSimulator.generateSeasonData()));
	}, []);
	return (
		<div className="h-screen w-screen flex">
			{/* sidebar */}
			<div className="h-full w-1/5 bg-gray-800 text-white p-4">
				<h1 className="text-2xl font-bold">Dashboard</h1>
				
			</div>
		</div>
	);
};

export default Dashboard;
