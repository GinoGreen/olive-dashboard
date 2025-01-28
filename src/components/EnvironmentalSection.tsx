import { useOleificio } from "@/hooks/useOleificio";
import { EnvironmentalData } from "@/types/types";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
	Area,
	AreaChart,
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

interface FilteredEnvironmentalData
	extends Omit<EnvironmentalData, "timestamp"> {
	timestamp: string;
}

const EnvironmentalSection = () => {
	const { getDataset } = useOleificio();
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date("2024-10-01"),
		to: new Date("2025-01-31"),
	});
	const [filteredEnvironmentalData, setFilteredEnvironmentalData] = useState<
		FilteredEnvironmentalData[]
	>([]);

	// Stati per gli indicatori principali
	const [kpis, setKpis] = useState({
		averageTemperature: 0,
		averageHumidity: 0,
		averageWindSpeed: 0,
		totalPrecipitation: 0,
		rainyDays: 0,
	});

	const updateKpis = (envData: EnvironmentalData[]) => {
		const averageTemperature =
			envData.reduce((acc, data) => acc + data.temperature, 0) /
			envData.length;
		const averageHumidity =
			envData.reduce((acc, data) => acc + data.humidity, 0) / envData.length;
		const averageWindSpeed =
			envData.reduce((acc, data) => acc + data.windSpeed, 0) /
			envData.length;
		const totalPrecipitation = envData.reduce(
			(acc, data) => acc + data.precipitation,
			0
		);
		const rainyDays = envData.filter((data) => data.precipitation > 0).length;

		setKpis({
			averageTemperature,
			averageHumidity,
			averageWindSpeed,
			totalPrecipitation,
			rainyDays,
		});
	};

	const updateFilteredEnvironmentalData = (
		envData: EnvironmentalData[],
		startDate: Date,
		endDate: Date
	) => {
		const filteredData = envData
			.filter((data) => {
				const envDate = new Date(data.timestamp);
				return envDate >= startDate && envDate <= endDate;
			})
			.map((data) => ({
				...data,
				timestamp: new Date(data.timestamp).toLocaleDateString("it-IT"),
			}));

		setFilteredEnvironmentalData(filteredData);
		updateKpis(
			envData.filter((data) => {
				const envDate = new Date(data.timestamp);
				return envDate >= startDate && envDate <= endDate;
			})
		);
	};

	const updateData = () => {
		if (!date?.to || !date?.from) {
			return;
		}
		const dataset = getDataset();
		const { environmental } = dataset;
		updateFilteredEnvironmentalData(environmental, date.from, date.to);
	};

	useEffect(() => {
		updateData();
	}, [date, date?.to, date?.from]);

	useEffect(() => {
		updateData();
	}, []);

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div className='text-3xl font-bold'>Dashboard Ambiente</div>
				<DatePickerWithRange
					date={date}
					setDate={setDate}
				/>
			</div>

			{/* KPI Cards */}
			<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Temperatura Media
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.averageTemperature.toFixed(1)}°C
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Umidità Media
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.averageHumidity.toFixed(1)}%
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Velocità Vento Media
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.averageWindSpeed.toFixed(1)} km/h
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Precipitazioni Totali
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.totalPrecipitation.toFixed(1)} mm
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Giorni di Pioggia
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{kpis.rainyDays}</div>
					</CardContent>
				</Card>
			</div>

			{/* Environmental Charts */}
			<div className='grid gap-4 md:grid-cols-2'>
				<Card className='p-4'>
					<CardHeader>
						<CardTitle>Temperatura e Umidità</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='h-80'>
							<ResponsiveContainer
								width='100%'
								height='100%'
							>
								<LineChart data={filteredEnvironmentalData}>
									<CartesianGrid strokeDasharray='3 3' />
									<XAxis dataKey='timestamp' />
									<YAxis yAxisId='left' />
									<YAxis
										yAxisId='right'
										orientation='right'
									/>
									<Tooltip />
									<Legend />
									<Line
										yAxisId='left'
										type='monotone'
										dataKey='temperature'
										name='Temperatura (°C)'
										stroke='hsl(var(--chart-1))'
										strokeWidth={2}
									/>
									<Line
										yAxisId='right'
										type='monotone'
										dataKey='humidity'
										name='Umidità (%)'
										stroke='hsl(var(--chart-2))'
										strokeWidth={2}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				<Card className='p-4'>
					<CardHeader>
						<CardTitle>Velocità del Vento</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='h-80'>
							<ResponsiveContainer
								width='100%'
								height='100%'
							>
								<BarChart data={filteredEnvironmentalData}>
									<CartesianGrid strokeDasharray='3 3' />
									<XAxis dataKey='timestamp' />
									<YAxis
										label={{
											value: "Velocità (km/h)",
											angle: -90,
											position: "insideLeft",
										}}
									/>
									<Tooltip />
									<Legend />
									<Bar
										dataKey='windSpeed'
										name='Velocità Vento'
										fill='hsl(var(--chart-3))'
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Precipitation Chart */}
			<Card className='p-4'>
				<CardHeader>
					<CardTitle>Precipitazioni</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='h-80'>
						<ResponsiveContainer
							width='100%'
							height='100%'
						>
							<AreaChart data={filteredEnvironmentalData}>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis dataKey='timestamp' />
								<YAxis
									label={{
										value: "Precipitazioni (mm)",
										angle: -90,
										position: "insideLeft",
									}}
								/>
								<Tooltip />
								<Legend />
								<Area
									type='monotone'
									dataKey='precipitation'
									name='Precipitazioni'
									stroke='hsl(var(--chart-4))'
									fill='hsl(var(--chart-4))'
									fillOpacity={0.3}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default EnvironmentalSection;
