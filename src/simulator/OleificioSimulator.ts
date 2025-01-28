import {
	EnvironmentalData,
	OlivesBatch,
	ProcessingParameters,
	OilAnalysis,
	ProductionData,
	SystemStatus,
} from "@/types/types";
import EnvironmentalSimulator from "./EnvironmentalSimulator";
import ProcessingSimulator from "./ProcessingSimulator";
import QualitySimulator from "./QualitySimulator";
import MachineSimulator from "./MachineSimulator";

/**
 * Simulatore che genera dataset realistici per l'Oleificio Cima di Bitonto.
 * Genera dati per un'intera stagione produttiva (ottobre-gennaio).
 */
class OleificioSimulator {
	private readonly SEASON_START = new Date(2024, 9, 1); // 1 Ottobre 2024
	private readonly SEASON_END = new Date(2025, 0, 31); // 31 Gennaio 2025

	private readonly DAILY_BATCHES = {
		min: 1, // Minimo numero di lotti al giorno
		max: 2, // Massimo numero di lotti al giorno
	};

	private readonly BATCH_SIZE = {
		min: 500, // Dimensione minima lotto in kg
		max: 2000, // Dimensione massima lotto in kg
	};

	// Istanziamo i simulatori come proprietà private
	private readonly envSimulator: EnvironmentalSimulator;
	private readonly processSimulator: ProcessingSimulator;
	private readonly qualitySimulator: QualitySimulator;
	private readonly machineSimulator: MachineSimulator;

	constructor() {
		// Creiamo le istanze nel costruttore
		this.envSimulator = new EnvironmentalSimulator();
		this.processSimulator = new ProcessingSimulator();
		this.qualitySimulator = new QualitySimulator();
		this.machineSimulator = new MachineSimulator();
	}

	/**
	 * Genera il dataset completo per una stagione produttiva
	 */
	public generateSeasonData(): {
		environmental: EnvironmentalData[];
		batches: OlivesBatch[];
		processing: ProcessingParameters[];
		production: ProductionData[];
		quality: OilAnalysis[];
		machineStatus: SystemStatus[];
	} {
		const dataset = {
			environmental: [] as EnvironmentalData[],
			batches: [] as OlivesBatch[],
			processing: [] as ProcessingParameters[],
			production: [] as ProductionData[],
			quality: [] as OilAnalysis[],
			machineStatus: [] as SystemStatus[],
		};

		// Generiamo i dati giorno per giorno
		const currentDate = new Date(this.SEASON_START);
		while (currentDate <= this.SEASON_END) {
			// Generiamo i dati ambientali per questo giorno
			const envData = this.envSimulator.generateDailyData(new Date(currentDate));
			dataset.environmental.push(envData);

			// Generiamo i lotti di olive per questo giorno
			const dailyBatches = this.generateDailyBatches(new Date(currentDate));
			dataset.batches.push(...dailyBatches);

			// Per ogni lotto, generiamo i dati di lavorazione
			for (const batch of dailyBatches) {
				const processingData = this.processSimulator.generateProcessingData(
					batch,
					envData,
					new Date(batch.arrivalTimestamp)
				);
				dataset.processing.push(processingData.parameters);
				dataset.production.push(processingData.production);

				const qualityData = this.qualitySimulator.generateQualityData(
					batch,
					processingData.parameters,
					new Date(currentDate)
				);
				dataset.quality.push(qualityData);
			}

			// Generiamo lo stato delle macchine per questo giorno
			const machineStatus = this.machineSimulator.generateDailyStatus(
				new Date(currentDate),
				dailyBatches.length,
				envData
			);
			dataset.machineStatus.push(machineStatus);

			// Avanziamo al giorno successivo
			currentDate.setDate(currentDate.getDate() + 1);
		}

		return dataset;
	}

	/**
	 * Genera i lotti di olive per un giorno specifico
	 */
	private generateDailyBatches(date: Date): OlivesBatch[] {
		const batches: OlivesBatch[] = [];
		const numBatches = this.getRandomInt(
			this.DAILY_BATCHES.min,
			this.DAILY_BATCHES.max
		);

		for (let i = 0; i < numBatches; i++) {
			batches.push(this.generateBatch(date, i + 1));
		}

		return batches;
	}

	/**
	 * Genera un singolo lotto di olive
	 */
	private generateBatch(date: Date, sequenceNum: number): OlivesBatch {
		const batchSize = this.getRandomInt(
			this.BATCH_SIZE.min,
			this.BATCH_SIZE.max
		);

		// 70% Ogliarola, 30% Coratina come da documentazione
		const variety = Math.random() < 0.7 ? "Ogliarola" : "Coratina";

		// La qualità Premium è più probabile all'inizio della stagione
		const monthIndex = date.getMonth();
		const premiumProbability = 0.8 - (monthIndex - 9) * 0.2; // Decresce col passare dei mesi
		const quality =
			Math.random() < premiumProbability ? "Premium" : "Standard";

		return {
			id: `${date.toISOString().split("T")[0]}-${sequenceNum}`,
			arrivalTimestamp: this.getRandomTimeInDay(date),
			weight: batchSize,
			variety,
			quality,
			origin: "Bitonto",
			harvestDate: new Date(date.getTime() - 24 * 60 * 60 * 1000), // Il giorno prima
			isOrganic: Math.random() < 0.2, // 20% di probabilità che sia biologico
		};
	}

	private getRandomInt(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	private getRandomTimeInDay(date: Date): Date {
		const hours = this.getRandomInt(8, 17); // Ore lavorative 8-17
		const minutes = this.getRandomInt(0, 59);
		return new Date(date.setHours(hours, minutes, 0, 0));
	}
}

export default OleificioSimulator;
