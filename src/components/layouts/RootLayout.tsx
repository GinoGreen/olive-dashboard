import Sidebar from "../Sidebar";

const RootLayout = () => {
	return (
		<div className="h-screen w-screen flex">
			{/* Sidebar */}
			<Sidebar />
			{/* main */}
			<main className="w-full h-full overflow-auto">
				
			</main>
		</div>
	);
}
 
export default RootLayout;