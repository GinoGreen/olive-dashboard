import { useOleificio } from "@/hooks/useOleificio";
import { OilAnalysis } from "@/types/types";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	Legend,
	CartesianGrid,
	Radar,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
} from "recharts";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "./ui/DatePickerRange";

interface FilteredQualityData extends Omit<OilAnalysis, "timestamp"> {
	timestamp: string;
}

const QualitySection = () => {
	const { getDataset } = useOleificio();
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date("2024-10-01"),
		to: new Date("2025-01-31"),
	});
	const [filteredQualityData, setFilteredQualityData] = useState<
		FilteredQualityData[]
	>([]);
	const [averageQualityData, setAverageQualityData] = useState<
		{ parameter: string; value: number; fullMark: number }[]
	>([]);

	// KPI per la qualità
	const [kpis, setKpis] = useState({
		averageAcidity: 0,
		averagePeroxides: 0,
		averagePolyphenols: 0,
		averageAlkylEsters: 0,
		averageOrganolepticScore: 0,
		certifiedBatches: 0,
	});

	const updateKpis = (qualityData: OilAnalysis[]) => {
		const averageAcidity =
			qualityData.reduce((acc, data) => acc + data.acidity, 0) /
			qualityData.length;
		const averagePeroxides =
			qualityData.reduce((acc, data) => acc + data.peroxides, 0) /
			qualityData.length;
		const averagePolyphenols =
			qualityData.reduce((acc, data) => acc + data.polyphenols, 0) /
			qualityData.length;
		const averageAlkylEsters =
			qualityData.reduce((acc, data) => acc + data.alkylEsters, 0) /
			qualityData.length;
		const averageOrganolepticScore =
			qualityData.reduce((acc, data) => acc + data.organolepticsScore, 0) /
			qualityData.length;
		const certifiedBatches = qualityData.filter(
			(data) =>
				data.qualityCertification.isDOP ||
				data.qualityCertification.isOrganic
		).length;

		setKpis({
			averageAcidity,
			averagePeroxides,
			averagePolyphenols,
			averageAlkylEsters,
			averageOrganolepticScore,
			certifiedBatches,
		});

		// Aggiorna i dati per il radar chart
		setAverageQualityData([
			{
				parameter: "Acidità",
				value: (averageAcidity / 0.8) * 100,
				fullMark: 100, // Limite massimo per olio extra vergine
			},
			{
				parameter: "Perossidi",
				value: averagePeroxides,
				fullMark: 20, // Limite massimo per olio extra vergine
			},
			{
				parameter: "Polifenoli",
				value: averagePolyphenols,
				fullMark: 500, // Valore massimo tipico
			},
			{
				parameter: "Alcoli Esteri",
				value: averageAlkylEsters,
				fullMark: 75, // Limite per extra vergine
			},
		]);
	};

	const updateFilteredQualityData = (
		qualityData: OilAnalysis[],
		startDate: Date,
		endDate: Date
	) => {
		console.log("startDate:", startDate);
		console.log("endDate:", endDate);
		console.log("qualityData:", qualityData);

		
		const filteredData = qualityData
			.filter((data) => {
				const qualityDate = new Date(data.timestamp);
				return qualityDate >= startDate && qualityDate <= endDate;
			})
			.map((data) => ({
				...data,
				timestamp: new Date(data.timestamp).toLocaleDateString("it-IT"),
			}));

		setFilteredQualityData(filteredData);
		updateKpis(
			qualityData.filter((data) => {
				const qualityDate = new Date(data.timestamp);
				return qualityDate >= startDate && qualityDate <= endDate;
			})
		);
	};

	const updateData = () => {
		if (!date?.to || !date?.from) {
			return;
		}
		const dataset = getDataset();
		const { quality } = dataset;
		updateFilteredQualityData(quality, date.from, date.to);
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
				<div className='text-3xl font-bold'>Dashboard della Qualità</div>
				<DatePickerWithRange
					date={date}
					setDate={setDate}
				/>
			</div>

			{/* KPI Cards */}
			<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Acidità Media
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.averageAcidity.toFixed(3)}%
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Perossidi Medi
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.averagePeroxides.toFixed(1)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Polifenoli Medi
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.averagePolyphenols.toFixed(0)} mg/kg
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Alcoli Esteri Medi
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.averageAlkylEsters.toFixed(1)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Panel Test Medio
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.averageOrganolepticScore.toFixed(1)}/9
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Lotti Certificati
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.certifiedBatches}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Quality Charts */}
			<div className='grid gap-4 md:grid-cols-2'>
				<Card className='p-4'>
					<CardHeader>
						<CardTitle>Radar Chart Parametri Qualità</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='h-80'>
							<ResponsiveContainer
								width='100%'
								height='100%'
							>
								<RadarChart
									outerRadius={90}
									data={averageQualityData}
								>
									<PolarGrid />
									<PolarAngleAxis dataKey='parameter' />
									<PolarRadiusAxis
										angle={90}
										tickFormatter={(value) => `${value}%`}
									/>
									<Radar
										name='Valori Medi'
										dataKey='value'
										stroke='hsl(var(--chart-1))'
										fill='hsl(var(--chart-1))'
										fillOpacity={0.6}
									/>
									<Tooltip
										formatter={(value, name, props) => [
											props.payload.value.toFixed(2),
											name,
										]}
									/>
									<Legend />
								</RadarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				<Card className='p-4'>
					<CardHeader>
						<CardTitle>Andamento Panel Test</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='h-80'>
							<ResponsiveContainer
								width='100%'
								height='100%'
							>
								<LineChart data={filteredQualityData}>
									<CartesianGrid strokeDasharray='3 3' />
									<XAxis dataKey='timestamp' />
									<YAxis
										domain={[0, 9]}
										label={{
											value: "Panel Test Score",
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
										dataKey='organolepticsScore'
										name='Panel Test'
										stroke='hsl(var(--chart-2))'
										strokeWidth={2}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Acidità e Perossidi Trend */}
			<Card className='p-4'>
				<CardHeader>
					<CardTitle>Trend Acidità e Perossidi</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='h-80'>
						<ResponsiveContainer
							width='100%'
							height='100%'
						>
							<LineChart data={filteredQualityData}>
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
									dataKey='acidity'
									name='Acidità (%)'
									stroke='hsl(var(--chart-3))'
									strokeWidth={2}
								/>
								<Line
									yAxisId='right'
									type='monotone'
									dataKey='peroxides'
									name='Perossidi'
									stroke='hsl(var(--chart-4))'
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

export default QualitySection;
