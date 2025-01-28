import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, Factory, BadgeCheck, Leaf, Cog, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
	const navigator = useNavigate();
	// Definiamo le rotte principali dell'applicazione con icone appropriate
	const mainNavItems = [
		{
			icon: Home,
			label: "Home",
			path: "/",
			description: "Dashboard principale",
		},
		{
			icon: Factory,
			label: "Produzione",
			path: "/processing",
			description: "Gestione della produzione",
		},
		{
			icon: BadgeCheck,
			label: "Qualità",
			path: "/quality",
			description: "Controllo qualità",
		},
		{
			icon: Leaf,
			label: "Ambiente",
			path: "/environment",
			description: "Gestione ambientale",
		},
		{
			icon: Cog,
			label: "Macchine",
			path: "/machine",
			description: "Manutenzione macchinari",
		},
	];

	return (
		<div className='h-full w-64 border-r bg-background flex flex-col'>
			{/* Intestazione con il logo/titolo */}
			<div className='p-6 border-b'>
				<h1 className='text-xl font-semibold tracking-tight'>
					Oleificio Dashboard
				</h1>
			</div>

			{/* Area di navigazione principale con scroll */}
			<ScrollArea className='flex-1 px-4'>
				<div className='space-y-4 py-4'>
					{/* Sezione di navigazione principale */}
					<div className='space-y-1'>
						{mainNavItems.map((item) => (
							<Button
								key={item.path}
								variant='ghost'
								className='w-full justify-start gap-2 h-auto py-3'
								onClick={() => navigator(item.path)}
							>
								<item.icon
									size={20}
									className='shrink-0'
								/>
								<div className='flex flex-col items-start gap-0'>
									<span>{item.label}</span>
									<span className='text-xs text-muted-foreground font-normal'>
										{item.description}
									</span>
								</div>
							</Button>
						))}
					</div>
				</div>
			</ScrollArea>

			{/* Footer con pulsante di logout */}
			<div className='p-4 border-t'>
				<Button
					variant='ghost'
					className='w-full justify-start gap-2'
					onClick={() => console.log("Logging out...")}
				>
					<LogOut
						size={20}
						className='text-muted-foreground'
					/>
					<a
						href='https://www.oleificiocimadibitonto.it/'
						target='_blank'
					>
						Oleificio
					</a>
				</Button>
			</div>
		</div>
	);
};

export default Sidebar;
