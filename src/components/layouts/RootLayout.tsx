import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";

const RootLayout = () => {
	return (
		<div className='h-screen w-screen flex'>
			{/* Sidebar */}
			<Sidebar />
			{/* main */}
			<main className='w-full h-full p-4 overflow-auto'>
				<Outlet />
			</main>
		</div>
	);
};

export default RootLayout;
