import { useOleificio } from "@/hooks/useOleificio";
import { ProcessingParameters, ProductionData } from "@/types/types";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "./ui/DatePickerRange";

interface FilteredProductionData extends Omit<ProductionData, 'timestamp'> {
	timestamp: string;
}

const ProcessingSection = () => {
	const { getDataset } = useOleificio();
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date("2024-10-01"),
		to: new Date("2025-01-31"),
	});
	const [filteredProductionData, setFilteredProductionData] = useState<
		FilteredProductionData[]
	>([]);
	const [filteredProcessingParameters, setFilteredProcessingParameters] =
		useState<ProcessingParameters[]>([]);

	// Stati per gli indicatori principali
	const [kpis, setKpis] = useState({
		totalOliveProcessed: 0,
		totalOilProduced: 0,
		averageYield: 0,
		energyConsumption: 0,
		waterConsumption: 0,
	});

	const updateKpis = (productionData: ProductionData[]) => {
		const totalOliveProcessed = productionData.reduce(
			(acc, data) => acc + data.oliveProcessed,
			0
		);
		const totalOilProduced = productionData.reduce(
			(acc, data) => acc + data.oilProduced,
			0
		);
		const averageYield =
			productionData.length > 0 ? totalOilProduced / totalOliveProcessed : 0;
		const energyConsumption = productionData.reduce(
			(acc, data) => acc + data.energyConsumption,
			0
		);
		const waterConsumption = productionData.reduce(
			(acc, data) => acc + data.waterConsumption,
			0
		);

		setKpis({
			totalOliveProcessed,
			totalOilProduced,
			averageYield,
			energyConsumption,
			waterConsumption,
		});
	};

	const updateFilteredProductionData = (
		productionData: ProductionData[],
		startDate: Date,
		endDate: Date
	) => {
		const filteredData = productionData
			.filter((data) => {
				const productionDate = new Date(data.timestamp);
				return productionDate >= startDate && productionDate <= endDate;
			})
			.map((data) => {
				return { ...data, timestamp: data.timestamp };
			});
		const formattedData = filteredData.map((data) => ({
			...data,
			timestamp: new Date(data.timestamp).toLocaleDateString("it-IT"),
		}));
		setFilteredProductionData(formattedData);
		updateKpis(filteredData);
	};

	const updateFilteredProcessingParameters = (
		productionData: ProcessingParameters[],
		startDate: Date,
		endDate: Date
	) => {
		const filteredData = productionData.filter((data) => {
			const productionDate = new Date(data.timestamp);
			return productionDate >= startDate && productionDate <= endDate;
		});
		setFilteredProcessingParameters(filteredData);
	};

	const updateData = () => {
		if (!date?.to || !date?.from) {
			return;
		}
		const dataset = getDataset();

		const { production, processing } = dataset;
		updateFilteredProductionData(production, date.from, date.to);
		updateFilteredProcessingParameters(processing, date.from, date.to);
	};

	useEffect(() => {
		// Simuliamo il caricamento dei dati
		// In un'applicazione reale, questi dati verrebbero da un'API
		updateData();
	}, [date, date?.to, date?.from]);

	useEffect(() => {
		updateData();
		console.log(getDataset());
	}, []);

	return (
		<div className='space-y-6'>
			<div className="flex justify-between items-center">
				<div className='text-3xl font-bold'>Dashboard di Produzione</div>
				<DatePickerWithRange date={date} setDate={setDate} />
			</div>

			{/* KPI Cards */}
			<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Olive Lavorate
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.totalOliveProcessed.toFixed(0)} kg
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Olio Prodotto
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.totalOilProduced.toFixed(0)} L
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Resa Media
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.averageYield.toFixed(2)}%
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Consumo Energia
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.energyConsumption.toFixed(0)} kWh
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Consumo Acqua
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.waterConsumption.toFixed(0)} L
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Production Charts */}
			<div className='grid gap-4 md:grid-cols-2'>
				<Card className='p-4'>
					<CardHeader>
						<CardTitle>Produzione Totale</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='h-80'>
							<ResponsiveContainer
								width='100%'
								height='100%'
							>
								<BarChart
									data={[
										{
											month: "Totale",
											oliveProcessed: filteredProductionData
												.reduce(
													(acc, data) => acc + data.oliveProcessed,
													0
												)
												.toFixed(2),
											oilProduced: filteredProductionData
												.reduce(
													(acc, data) => acc + data.oilProduced,
													0
												)
												.toFixed(2),
										},
									]}
								>
									<CartesianGrid strokeDasharray='3 3' />
									<XAxis dataKey='month' />
									<YAxis
										yAxisId='left'
										orientation='left'
										stroke='#8884d8'
									/>
									<YAxis
										yAxisId='right'
										orientation='right'
										stroke='#82ca9d'
									/>
									<Tooltip />
									<Legend />
									<Bar
										yAxisId='left'
										dataKey='oliveProcessed'
										name='Olive (kg)'
										fill='hsl(var(--chart-1))'
									/>
									<Bar
										yAxisId='right'
										dataKey='oilProduced'
										name='Olio (L)'
										fill='hsl(var(--chart-2))'
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				<Card className='p-4'>
					<CardHeader>
						<CardTitle>Resa Olive</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='h-80'>
							<ResponsiveContainer
								width='100%'
								height='100%'
							>
								<LineChart data={filteredProductionData}>
									<CartesianGrid strokeDasharray='3 3' />
									<XAxis dataKey='timestamp' />
									<YAxis
										dataKey='yield'
										label={{
											value: "Resa (%)",
											angle: -90,
											position: "insideLeft",
											offset: 10,
											style: { textAnchor: "middle" },
										}}
									/>
									<Tooltip />
									<Legend />
									<Line
										type='monotone'
										dataKey='yield'
										name='Resa (%)'
										stroke='hsl(var(--chart-3))'
										strokeWidth={2}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Processing Parameters */}
			<Card className='p-4'>
				<CardHeader>
					<CardTitle>Parametri di Processo</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='h-80'>
						<ResponsiveContainer
							width='100%'
							height='100%'
						>
							<LineChart data={filteredProcessingParameters}>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis
									dataKey='timestamp'
									tickFormatter={(timestamp) =>
										new Date(timestamp).toLocaleDateString()
									}
								/>
								<YAxis />
								<Tooltip
									labelFormatter={(timestamp) =>
										new Date(timestamp).toLocaleDateString()
									}
								/>
								<Legend />
								<Line
									type='monotone'
									dataKey='grindingTemperature'
									name='Temp. Molitura (°C)'
									stroke='hsl(var(--chart-4))'
									strokeWidth={2}
								/>
								<Line
									type='monotone'
									dataKey='extractionTemperature'
									name='Temp. Estrazione (°C)'
									stroke='hsl(var(--chart-5))'
									strokeWidth={2}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default ProcessingSection;
