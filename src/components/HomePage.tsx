import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Gauge, Thermometer, Factory, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
	const navigate = useNavigate();

	const dashboards = [
		{
			title: "Dashboard di Produzione",
			description:
				"Monitoraggio in tempo reale della produzione di olio, rese e consumi.",
			icon: <Factory className='w-8 h-8 text-chart-1' />,
			route: "/processing",
		},
		{
			title: "Dashboard di Qualità",
			description:
				"Analisi dei parametri qualitativi e certificazioni del prodotto.",
			icon: <BarChart3 className='w-8 h-8 text-chart-2' />,
			route: "/quality",
		},
		{
			title: "Dashboard Ambiente",
			description:
				"Monitoraggio delle condizioni ambientali e meteorologiche.",
			icon: <Thermometer className='w-8 h-8 text-chart-3' />,
			route: "/environmental",
		},
		{
			title: "Dashboard Macchine",
			description: "Stato e manutenzione dei macchinari del frantoio.",
			icon: <Gauge className='w-8 h-8 text-chart-4' />,
			route: "/machine",
		},
	];

	return (
		<div className='p-8 space-y-8'>
			<div className='space-y-4'>
				<h1 className='text-4xl font-bold'>
					Oleificio Cooperativo Cima di Bitonto
				</h1>
				<p className='text-xl text-muted-foreground'>
					Sistema di Monitoraggio Integrato
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				{dashboards.map((dashboard) => (
					<Card
						key={dashboard.route}
						className='hover:border-primary cursor-pointer transition-all'
						onClick={() => navigate(dashboard.route)}
					>
						<CardHeader>
							<div className='flex items-center gap-4'>
								{dashboard.icon}
								<div>
									<CardTitle>{dashboard.title}</CardTitle>
									<CardDescription>
										{dashboard.description}
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className='h-40 flex items-center justify-center bg-muted/50 rounded-lg'>
								{/* Qui potremmo inserire un preview chart o stats per ogni dashboard */}
								<span className='text-muted-foreground'>
									Clicca per visualizzare{" "}
									{dashboard.title.toLowerCase()}
								</span>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Informazioni sull'Oleificio</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						<p>
							L'Oleificio Cooperativo Cima di Bitonto produce olio
							extravergine di oliva in Puglia dal 1960. Le varietà
							coltivate sono per il 70% Ogliarola e il restante 30%
							Coratina.
						</p>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							<div className='p-4 bg-muted/50 rounded-lg'>
								<h3 className='font-semibold mb-2'>Produzione</h3>
								<p>
									Oltre 1.700.000 alberi di ulivo con una bassissima
									acidità media (0,21%)
								</p>
							</div>
							<div className='p-4 bg-muted/50 rounded-lg'>
								<h3 className='font-semibold mb-2'>Qualità</h3>
								<p>
									Estrazione a freddo entro 24 ore dalla raccolta per
									massima qualità e genuinità
								</p>
							</div>
							<div className='p-4 bg-muted/50 rounded-lg'>
								<h3 className='font-semibold mb-2'>Esportazione</h3>
								<p>
									Esportazione in tutta Europa e America con
									certificazioni DOP e BIO
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default HomePage;
