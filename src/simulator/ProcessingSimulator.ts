import {
	OlivesBatch,
	ProcessingParameters,
	ProductionData,
	EnvironmentalData,
} from "@/types/types";

/**
 * Simulatore del processo di lavorazione delle olive.
 * Replica il processo produttivo dell'Oleificio Cima di Bitonto,
 * dalla defogliazione fino all'estrazione dell'olio.
 */
class ProcessingSimulator {
	// Parametri ottimali del processo
	private readonly OPTIMAL_PARAMETERS = {
		// Temperatura massima per preservare la qualità
		MAX_PROCESSING_TEMP: 27,

		// Tempi di gramolatura (in minuti)
		MIXING_TIME: {
			min: 30,
			optimal: 35,
			max: 45,
		},

		// Velocità centrifuga (rpm)
		CENTRIFUGE_SPEED: {
			premium: {
				min: 3000,
				optimal: 3200,
				max: 3400,
			},
			standard: {
				min: 3400,
				optimal: 3600,
				max: 3800,
			},
		},

		// Consumo d'acqua (litri per kg di olive)
		WATER_CONSUMPTION: 0.1,

		// Rese medie per varietà (percentuale)
		YIELD_RATES: {
			Ogliarola: {
				base: 13.5, // 13-14% resa media
				variation: 0.5, // ±0.5% di variazione
			},
			Coratina: {
				base: 15.0, // 14-16% resa media
				variation: 1.0, // ±1.0% di variazione
			},
		},
	} as const;

	/**
	 * Genera i dati di lavorazione per un lotto di olive,
	 * considerando le condizioni ambientali.
	 */
	public generateProcessingData(
		batch: OlivesBatch,
		environmentalData: EnvironmentalData
	): {
		parameters: ProcessingParameters;
		production: ProductionData;
	} {
		// Generiamo i parametri di processo
		const parameters = this.generateProcessingParameters(
			batch,
			environmentalData
		);

		// Calcoliamo i dati di produzione basati sui parametri
		const production = this.calculateProduction(
			batch,
			parameters,
		);

		return { parameters, production };
	}

	/**
	 * Genera i parametri di processo per un lotto di olive,
	 * tenendo conto delle condizioni ambientali e della qualità delle olive.
	 */
	private generateProcessingParameters(
		batch: OlivesBatch,
		envData: EnvironmentalData
	): ProcessingParameters {
		// La temperatura di lavorazione è influenzata dalla temperatura ambientale
		const baseTemp = Math.min(
			envData.temperature + 5,
			this.OPTIMAL_PARAMETERS.MAX_PROCESSING_TEMP
		);

		// La durata della gramolatura dipende dall'umidità ambientale
		// Con umidità più alta serve più tempo
		const mixingDuration = this.calculateMixingDuration(envData.humidity);

		// La velocità di centrifugazione dipende dalla qualità delle olive
		const centrifugationSpeed = this.calculateCentrifugationSpeed(
			batch.quality.toLowerCase() as "premium" | "standard"
		);

		return {
			timestamp: new Date(),
			grindingTemperature: Number(baseTemp.toFixed(1)),
			mixingDuration,
			extractionTemperature: Number((baseTemp - 1).toFixed(1)), // Leggermente più bassa
			centrifugationSpeed,
		};
	}

	/**
	 * Calcola la durata ottimale della gramolatura in base all'umidità.
	 */
	private calculateMixingDuration(humidity: number): number {
		const { min, optimal, max } = this.OPTIMAL_PARAMETERS.MIXING_TIME;

		// Con umidità alta aumentiamo il tempo di gramolatura
		const humidityFactor = humidity / 70; // normalizzato a 70% di umidità
		const duration = optimal * humidityFactor;

		return Number(Math.min(Math.max(duration, min), max).toFixed(1));
	}

	/**
	 * Determina la velocità di centrifugazione in base alla qualità delle olive.
	 */
	private calculateCentrifugationSpeed(
		quality: "premium" | "standard"
	): number {
		const speeds =
			this.OPTIMAL_PARAMETERS.CENTRIFUGE_SPEED[quality];
		const baseSpeed = speeds.optimal;

		// Aggiungiamo una piccola variazione casuale (±2%)
		const variation = baseSpeed * 0.02 * (Math.random() - 0.5);

		return Number(
			Math.min(
				Math.max(baseSpeed + variation, speeds.min),
				speeds.max
			).toFixed(0)
		);
	}

	/**
	 * Calcola i dati di produzione basati sui parametri di processo
	 * e sulle caratteristiche del lotto.
	 */
	private calculateProduction(
		batch: OlivesBatch,
		params: ProcessingParameters,
	): ProductionData {
		// Calcoliamo la resa base in funzione della varietà
		const varietyYield = this.OPTIMAL_PARAMETERS.YIELD_RATES[batch.variety];
		const baseYield =
			varietyYield.base + (Math.random() - 0.5) * varietyYield.variation;

		// Applichiamo i modificatori basati su vari fattori
		const yieldModifiers = this.calculateYieldModifiers(
			batch,
			params,
		);
		const finalYield = baseYield * yieldModifiers.total;

		// Calcoliamo la quantità di olio prodotto
		const oilProduced = (batch.weight * finalYield) / 100;

		// Calcoliamo i consumi
		const processingTime = this.calculateProcessingTime(batch.weight, params);
		const energyConsumption = this.calculateEnergyConsumption(
			batch.weight,
			params,
			processingTime
		);
		const waterConsumption =
			batch.weight * this.OPTIMAL_PARAMETERS.WATER_CONSUMPTION;

		return {
			batchId: batch.id,
			timestamp: new Date(),
			oliveProcessed: batch.weight,
			oilProduced: Number(oilProduced.toFixed(1)),
			yield: Number(finalYield.toFixed(2)),
			processingTime,
			energyConsumption: Number(energyConsumption.toFixed(1)),
			waterConsumption: Number(waterConsumption.toFixed(1)),
		};
	}

	/**
	 * Calcola i modificatori che influenzano la resa dell'olio.
	 */
	private calculateYieldModifiers(
		batch: OlivesBatch,
		params: ProcessingParameters,
	): {
		quality: number;
		temperature: number;
		mixing: number;
		total: number;
	} {
		// Modificatore qualità
		const qualityMod = batch.quality === "Premium" ? 1.1 : 0.9;

		// Modificatore temperatura (penalizza temperature troppo alte)
		const tempMod =
			params.extractionTemperature >
			this.OPTIMAL_PARAMETERS.MAX_PROCESSING_TEMP
				? 0.9
				: 1.0;

		// Modificatore gramolatura (ottimale tra 30-45 minuti)
		const mixingMod = this.calculateMixingModifier(params.mixingDuration);

		return {
			quality: qualityMod,
			temperature: tempMod,
			mixing: mixingMod,
			total: qualityMod * tempMod * mixingMod,
		};
	}

	/**
	 * Calcola il modificatore basato sul tempo di gramolatura.
	 */
	private calculateMixingModifier(duration: number): number {
		const { min, optimal, max } = this.OPTIMAL_PARAMETERS.MIXING_TIME;

		if (duration < min) return 0.9;
		if (duration > max) return 0.95;
		if (Math.abs(duration - optimal) <= 5) return 1.0;

		// Penalizzazione proporzionale alla distanza dal tempo ottimale
		return 1.0 - (Math.abs(duration - optimal) / optimal) * 0.1;
	}

	/**
	 * Calcola il tempo di lavorazione basato sul peso del lotto
	 * e sui parametri di processo.
	 */
	private calculateProcessingTime(
		weight: number,
		params: ProcessingParameters
	): number {
		// Tempo base: 45 minuti per 1000kg
		const baseTime = 45 * (weight / 1000);

		// Aggiungiamo il tempo di gramolatura
		const totalTime = baseTime + params.mixingDuration;

		// Aggiungiamo una variazione casuale del ±5%
		const variation = totalTime * 0.05 * (Math.random() - 0.5);

		return Number((totalTime + variation).toFixed(0));
	}

	/**
	 * Calcola il consumo energetico del processo.
	 */
	private calculateEnergyConsumption(
		weight: number,
		params: ProcessingParameters,
		processingTime: number
	): number {
		// Consumo base: 0.1 kWh per kg di olive
		const baseConsumption = weight * 0.1;

		// Modificatori basati sui parametri di processo
		const tempModifier =
			params.extractionTemperature /
			this.OPTIMAL_PARAMETERS.MAX_PROCESSING_TEMP;
		const speedModifier = params.centrifugationSpeed / 3500;
		const timeModifier = processingTime / (45 * (weight / 1000));

		return baseConsumption * tempModifier * speedModifier * timeModifier;
	}
}

export default ProcessingSimulator;
