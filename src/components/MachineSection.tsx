import { useOleificio } from "@/hooks/useOleificio";
import { SystemStatus } from "@/types/types";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Activity,
	AlertTriangle,
	CheckCircle,
	Clock,
	XCircle,
} from "lucide-react";

interface FilteredMachineData extends Omit<SystemStatus, "timestamp"> {
	timestamp: string;
}

const MachineSection = () => {
	const { getDataset } = useOleificio();
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date("2024-10-01"),
		to: new Date("2025-01-31"),
	});
	const [filteredMachineData, setFilteredMachineData] = useState<
		FilteredMachineData[]
	>([]);
	const [activeAlerts, setActiveAlerts] = useState<SystemStatus['maintenanceAlerts']>([]);

	// Stati per gli indicatori principali
	const [kpis, setKpis] = useState({
		totalAlerts: 0,
		criticalAlerts: 0,
		maintenanceCount: 0,
		averageOliveStorage: 0,
		averageOilStorage: 0,
		machineUptime: {
			defogliatore: 0,
			frangitore: 0,
			gramola: 0,
			decanter: 0,
			separatore: 0,
		},
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "text-green-500";
			case "maintenance":
				return "text-yellow-500";
			case "error":
				return "text-red-500";
			default:
				return "text-gray-500";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "active":
				return <CheckCircle className='w-6 h-6' />;
			case "maintenance":
				return <Clock className='w-6 h-6' />;
			case "error":
				return <XCircle className='w-6 h-6' />;
			default:
				return <Activity className='w-6 h-6' />;
		}
	};

	const updateKpis = (machineData: SystemStatus[]) => {
		const totalAlerts = machineData.reduce(
			(acc, data) => acc + data.maintenanceAlerts.length,
			0
		);
		const criticalAlerts = machineData.reduce(
			(acc, data) =>
				acc +
				data.maintenanceAlerts.filter((alert) => alert.severity === "high")
					.length,
			0
		);
		const maintenanceCount = machineData.reduce(
			(acc, data) =>
				acc +
				Object.values(data.machineStatuses).filter(
					(status) => status === "maintenance"
				).length,
			0
		);
		const averageOliveStorage =
			machineData.reduce(
				(acc, data) => acc + data.storageCapacity.oliveStorage,
				0
			) / machineData.length;
		const averageOilStorage =
			machineData.reduce(
				(acc, data) => acc + data.storageCapacity.oilStorage,
				0
			) / machineData.length;

		// Calcolo uptime per ogni macchina
		const machineUptime: { defogliatore: number; frangitore: number; gramola: number; decanter: number; separatore: number; } = {
			defogliatore: 0,
			frangitore: 0,
			gramola: 0,
			decanter: 0,
			separatore: 0,
		};
		Object.keys(machineData[0].machineStatuses).forEach((machine) => {
			const activeTime = machineData.filter(
				(data) => data.machineStatuses[machine as keyof typeof data.machineStatuses] === "active"
			).length;
			machineUptime[machine as keyof typeof machineUptime] = (activeTime / machineData.length) * 100;
		});

		setKpis({
			totalAlerts,
			criticalAlerts,
			maintenanceCount,
			averageOliveStorage,
			averageOilStorage,
			machineUptime,
		});

		// Aggiorna gli alert attivi
		const latestData = machineData[machineData.length - 1];
		if (latestData) {
			setActiveAlerts(latestData.maintenanceAlerts);
		}
	};

	const updateFilteredMachineData = (
		machineData: SystemStatus[],
		startDate: Date,
		endDate: Date
	) => {
		const filteredData = machineData
			.filter((data) => {
				const machineDate = new Date(data.timestamp);
				return machineDate >= startDate && machineDate <= endDate;
			})
			.map((data) => ({
				...data,
				timestamp: new Date(data.timestamp).toLocaleDateString("it-IT"),
			}));

		setFilteredMachineData(filteredData);
		updateKpis(
			machineData.filter((data) => {
				const machineDate = new Date(data.timestamp);
				return machineDate >= startDate && machineDate <= endDate;
			})
		);
	};

	const updateData = () => {
		if (!date?.to || !date?.from) {
			return;
		}
		const dataset = getDataset();
		const { machineStatus } = dataset;
		updateFilteredMachineData(machineStatus, date.from, date.to);
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
				<div className='text-3xl font-bold'>Dashboard Stato Macchine</div>
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
							Alert Totali
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{kpis.totalAlerts}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Alert Critici
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.criticalAlerts}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Manutenzioni
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.maintenanceCount}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Stoccaggio Olive
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.averageOliveStorage.toFixed(0)} kg
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Stoccaggio Olio
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{kpis.averageOilStorage.toFixed(0)} L
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Machine Status Cards */}
			<div className='grid gap-4 md:grid-cols-5'>
				{Object.entries(
					filteredMachineData[filteredMachineData.length - 1]
						?.machineStatuses || {}
				).map(([machine, status]) => (
					<Card key={machine}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium capitalize'>
								{machine}
							</CardTitle>
							<div className={getStatusColor(status)}>
								{getStatusIcon(status)}
							</div>
						</CardHeader>
						<CardContent>
							<div className='text-xl font-bold capitalize'>
								{status}
							</div>
							<div className='text-sm text-muted-foreground'>
								Uptime: {kpis.machineUptime[machine as keyof typeof kpis.machineUptime].toFixed(1)}%
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Active Alerts */}
			<Card className='p-4'>
				<CardHeader>
					<CardTitle>Alert Attivi</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{activeAlerts.length > 0 ? (
							activeAlerts.map((alert) => (
								<Alert
									key={alert.id}
									variant={
										alert.severity === "high"
											? "destructive"
											: "default"
									}
								>
									<AlertTriangle className='h-4 w-4' />
									<AlertTitle className='capitalize'>
										{alert.machine} - {alert.severity}
									</AlertTitle>
									<AlertDescription>
										{alert.description}
									</AlertDescription>
								</Alert>
							))
						) : (
							<div className='text-center text-muted-foreground'>
								Nessun alert attivo
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Storage Capacity Chart */}
			<Card className='p-4'>
				<CardHeader>
					<CardTitle>Capacità di Stoccaggio</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='h-80'>
						<ResponsiveContainer
							width='100%'
							height='100%'
						>
							<LineChart data={filteredMachineData}>
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
									dataKey='storageCapacity.oliveStorage'
									name='Stoccaggio Olive (kg)'
									stroke='hsl(var(--chart-1))'
									strokeWidth={2}
								/>
								<Line
									yAxisId='right'
									type='monotone'
									dataKey='storageCapacity.oilStorage'
									name='Stoccaggio Olio (L)'
									stroke='hsl(var(--chart-2))'
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

export default MachineSection;
