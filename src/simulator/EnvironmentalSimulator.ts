import { EnvironmentalData } from "@/types/types";

/**
 * Simulatore delle condizioni ambientali per l'Oleificio Cima di Bitonto.
 * Genera dati meteorologici realistici basati sulle caratteristiche climatiche
 * della zona di Bitonto durante il periodo di raccolta (ottobre-gennaio).
 */
class EnvironmentalSimulator {
	// Medie climatiche mensili per Bitonto
	private readonly MONTHLY_AVERAGES : { [key: number]: [number, number, number, number, number] } = {
		// Mese: [tempMin, tempMax, humidityMin, humidityMax, precipProbability]
		9: [15, 22, 65, 80, 0.25], // Ottobre
		10: [12, 18, 70, 85, 0.35], // Novembre
		11: [8, 15, 75, 90, 0.4], // Dicembre
		0: [7, 13, 75, 90, 0.45], // Gennaio
	} as const;

	// Valori estremi osservabili
	private readonly EXTREMES = {
		temperature: {
			min: 2,
			max: 25,
		},
		humidity: {
			min: 40,
			max: 95,
		},
		windSpeed: {
			min: 0,
			max: 45, // km/h
		},
		precipitation: {
			min: 0,
			max: 80, // mm
		},
	} as const;

	/**
	 * Genera i dati ambientali per un giorno specifico.
	 * I dati vengono generati tenendo conto del mese e delle condizioni tipiche
	 * del periodo, con variazioni realistiche durante la giornata.
	 */
	public generateDailyData(date: Date): EnvironmentalData {
		const monthAverages = this.MONTHLY_AVERAGES[date.getMonth()];
		const hourlyData: EnvironmentalData[] = [];

		// Generiamo le condizioni base per la giornata
		const baseConditions = this.generateBaseDailyConditions(monthAverages);

		// Generiamo dati per ogni ora di attività (8-18)
		for (let hour = 8; hour <= 18; hour++) {
			hourlyData.push(this.generateHourlyData(date, hour, baseConditions));
		}

		// Calcoliamo le medie giornaliere
		const dailyAverage: EnvironmentalData = {
			timestamp: date,
			temperature: this.calculateAverage(
				hourlyData.map((d) => d.temperature)
			),
			humidity: this.calculateAverage(hourlyData.map((d) => d.humidity)),
			windSpeed: this.calculateAverage(hourlyData.map((d) => d.windSpeed)),
			precipitation: hourlyData.reduce((sum, d) => sum + d.precipitation, 0), // Sommiamo le precipitazioni
		};

		return dailyAverage;
	}

	/**
	 * Genera le condizioni meteorologiche di base per l'intera giornata
	 */
	private generateBaseDailyConditions(
		monthAverages: readonly [number, number, number, number, number]
	) {
		const [tempMin, tempMax, humidityMin, humidityMax, precipProb] =
			monthAverages;

		// Determiniamo se è una giornata piovosa
		const isRainyDay = Math.random() < precipProb;

		// Temperatura media giornaliera con variazione casuale
		const tempVariation = (Math.random() - 0.5) * 3; // ±1.5°C di variazione
		const baseTemp = (tempMin + tempMax) / 2 + tempVariation;

		// Umidità media con correlazione inversa alla temperatura
		const humidityVariation = (Math.random() - 0.5) * 10;
		const baseHumidity = (humidityMin + humidityMax) / 2 + humidityVariation;

		// Velocità del vento di base
		const baseWindSpeed = Math.random() * 15; // 0-15 km/h di base

		return {
			isRainyDay,
			baseTemp,
			baseHumidity,
			baseWindSpeed,
		};
	}

	/**
	 * Genera i dati ambientali per una specifica ora del giorno,
	 * considerando le variazioni tipiche durante la giornata.
	 */
	private generateHourlyData(
		date: Date,
		hour: number,
		baseConditions: {
			isRainyDay: boolean;
			baseTemp: number;
			baseHumidity: number;
			baseWindSpeed: number;
		}
	): EnvironmentalData {
		// Calcoliamo le variazioni in base all'ora del giorno
		const hourlyVariations = this.calculateHourlyVariations(hour);

		// Temperatura con variazione oraria
		let temperature = baseConditions.baseTemp + hourlyVariations.tempDelta;
		temperature = this.clamp(
			temperature,
			this.EXTREMES.temperature.min,
			this.EXTREMES.temperature.max
		);

		// Umidità con variazione inversa alla temperatura
		let humidity =
			baseConditions.baseHumidity - hourlyVariations.tempDelta * 2;
		humidity = this.clamp(
			humidity,
			this.EXTREMES.humidity.min,
			this.EXTREMES.humidity.max
		);

		// Vento con picco nelle ore centrali
		let windSpeed = baseConditions.baseWindSpeed + hourlyVariations.windDelta;
		windSpeed = this.clamp(
			windSpeed,
			this.EXTREMES.windSpeed.min,
			this.EXTREMES.windSpeed.max
		);

		// Precipitazioni
		let precipitation = 0;
		if (baseConditions.isRainyDay) {
			precipitation = this.generateHourlyPrecipitation(hour);
		}

		const timestamp = new Date(date);
		timestamp.setHours(hour, 0, 0, 0);

		return {
			timestamp,
			temperature: Number(temperature.toFixed(1)),
			humidity: Number(humidity.toFixed(1)),
			windSpeed: Number(windSpeed.toFixed(1)),
			precipitation: Number(precipitation.toFixed(1)),
		};
	}

	/**
	 * Calcola le variazioni di temperatura e vento in base all'ora del giorno.
	 * Le temperature più alte e i venti più forti si verificano nelle ore centrali.
	 */
	private calculateHourlyVariations(hour: number): {
		tempDelta: number;
		windDelta: number;
	} {
		// La temperatura raggiunge il picco alle 14:00
		const tempPeakHour = 14;
		const hourFromPeak = Math.abs(hour - tempPeakHour);
		const tempDelta = 3 - hourFromPeak * 0.5; // Massima variazione di ±3°C

		// Il vento tende ad aumentare nelle ore più calde
		const windDelta = 5 - hourFromPeak * 0.7; // Massima variazione di ±5 km/h

		return { tempDelta, windDelta };
	}

	/**
	 * Genera un valore realistico di precipitazione oraria per una giornata piovosa
	 */
	private generateHourlyPrecipitation(hour: number): number {
		// La pioggia è più probabile nel pomeriggio
		const rainIntensity =
			Math.random() * this.EXTREMES.precipitation.max * 0.3; // Max 30% del massimo per ora

		// Aggiungiamo variabilità in base all'ora
		const hourFactor = hour < 13 ? hour / 12 : (18 - hour) / 5;
		return rainIntensity * hourFactor;
	}

	/**
	 * Calcola la media di un array di numeri
	 */
	private calculateAverage(values: number[]): number {
		const sum = values.reduce((acc, val) => acc + val, 0);
		return Number((sum / values.length).toFixed(1));
	}

	/**
	 * Utility per limitare un valore entro un range
	 */
	private clamp(value: number, min: number, max: number): number {
		return Math.min(Math.max(value, min), max);
	}
}

export default EnvironmentalSimulator;
