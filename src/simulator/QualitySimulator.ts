import {
	OlivesBatch,
	ProcessingParameters,
	OilAnalysis,
	QualityCertification,
} from "@/types/types";

/**
 * Simulatore del sistema di controllo qualità.
 * Replica le analisi e le certificazioni dell'Oleificio Cima di Bitonto,
 * seguendo gli standard dell'industria per l'olio extra vergine di oliva.
 */
class QualitySimulator {
	// Limiti per la classificazione extra vergine
	private readonly QUALITY_LIMITS = {
		ACIDITY: {
			EXTRA_VIRGIN: 0.8, // Massima acidità per extra vergine
			EXCELLENT: 0.4, // Soglia per qualità eccellente
			ORGANIC: 0.6, // Limite più stringente per il biologico
		},
		PEROXIDES: {
			EXTRA_VIRGIN: 20, // Massimo numero di perossidi
			OPTIMAL: 12, // Valore ottimale
			ORGANIC: 16, // Limite per il biologico
		},
		POLYPHENOLS: {
			MIN: 200, // Minimo per buona qualità
			OPTIMAL: 350, // Valore ottimale
			MAX: 500, // Massimo tipico
		},
		ALKYL_ESTERS: {
			EXTRA_VIRGIN: 75, // Limite per extra vergine
			OPTIMAL: 40, // Valore ottimale
		},
		PANEL_TEST: {
			MIN_EXTRA_VIRGIN: 6.5, // Minimo per extra vergine
			EXCELLENT: 7.5, // Soglia per qualità eccellente
		},
	} as const;

	/**
	 * Genera i dati delle analisi di qualità per un lotto di olio prodotto.
	 * I valori sono influenzati dalla qualità delle olive e dai parametri di processo.
	 */
	public generateQualityData(
		batch: OlivesBatch,
		params: ProcessingParameters
	): OilAnalysis {
		// Determiniamo i fattori base di qualità
		const qualityFactors = this.calculateQualityFactors(batch, params);

		// Generiamo i valori delle analisi
		let analysis: OilAnalysis = {
			batchId: batch.id,
			timestamp: new Date(),
			acidity: this.generateAcidity(qualityFactors),
			peroxides: this.generatePeroxides(qualityFactors),
			polyphenols: this.generatePolyphenols(qualityFactors),
			alkylEsters: this.generateAlkylEsters(qualityFactors),
			organolepticsScore: this.generateOrganolepticsScore(qualityFactors),
			qualityCertification: {} as QualityCertification, // Inizializza con un oggetto vuoto castato a QualityCertification
		};

		// Verifichiamo se il lotto rispetta i requisiti per le certificazioni
		const qualityCertification = this.checkCertifications(analysis, batch);

		analysis = { ...analysis, qualityCertification };

		return analysis;
	}

	/**
	 * Calcola i fattori che influenzano la qualità dell'olio basandosi
	 * sulle caratteristiche delle olive e sui parametri di processo.
	 */
	private calculateQualityFactors(
		batch: OlivesBatch,
		params: ProcessingParameters
	): {
		baseQuality: number; // 0-1, qualità base delle olive
		freshness: number; // 0-1, freschezza delle olive
		processQuality: number; // 0-1, qualità del processo
		variety: "Ogliarola" | "Coratina";
	} {
		// La qualità base dipende dal grado delle olive
		const baseQuality = batch.quality === "Premium" ? 0.9 : 0.7;

		// La freschezza dipende dal tempo tra raccolta e lavorazione
		const harvestToProcessHours =
			(batch.arrivalTimestamp.getTime() - batch.harvestDate.getTime()) /
			(1000 * 60 * 60);
		const freshness = Math.max(0, 1 - harvestToProcessHours / 48); // 48 ore è il massimo

		// La qualità del processo dipende principalmente dalla temperatura
		const processQuality =
			params.extractionTemperature <= 27
				? 1 - (params.extractionTemperature / 27) * 0.2
				: 0.7;

		return {
			baseQuality,
			freshness,
			processQuality,
			variety: batch.variety,
		};
	}

	/**
	 * Genera il valore di acidità dell'olio.
	 * L'acidità è uno dei parametri più importanti per la classificazione.
	 */
	private generateAcidity(
		factors: ReturnType<typeof this.calculateQualityFactors>
	): number {
		// L'acidità base dipende dalla varietà
		const baseAcidity = factors.variety === "Ogliarola" ? 0.3 : 0.35;

		// Calcoliamo l'acidità finale considerando tutti i fattori
		let finalAcidity =
			baseAcidity *
			(1 +
				(1 - factors.baseQuality) * 0.5 + // Influenza della qualità
				(1 - factors.freshness) * 0.3 + // Influenza della freschezza
				(1 - factors.processQuality) * 0.2); // Influenza del processo

		// Aggiungiamo una piccola variazione casuale (±5%)
		finalAcidity *= 1 + (Math.random() - 0.5) * 0.1;

		return Number(
			Math.min(
				finalAcidity,
				this.QUALITY_LIMITS.ACIDITY.EXTRA_VIRGIN
			).toFixed(2)
		);
	}

	/**
	 * Genera il numero di perossidi dell'olio.
	 * I perossidi indicano lo stato di ossidazione dell'olio.
	 */
	private generatePeroxides(
		factors: ReturnType<typeof this.calculateQualityFactors>
	): number {
		// Il valore base dipende dalla varietà
		const basePeroxides = factors.variety === "Ogliarola" ? 10 : 12;

		// Calcoliamo il valore finale
		let finalPeroxides =
			basePeroxides *
			(1 +
				(1 - factors.freshness) * 0.4 + // La freschezza è molto importante
				(1 - factors.processQuality) * 0.3 + // Il processo influisce
				(1 - factors.baseQuality) * 0.3); // La qualità delle olive conta

		// Variazione casuale (±10%)
		finalPeroxides *= 1 + (Math.random() - 0.5) * 0.2;

		return Math.round(
			Math.min(finalPeroxides, this.QUALITY_LIMITS.PEROXIDES.EXTRA_VIRGIN)
		);
	}

	/**
	 * Genera il contenuto di polifenoli dell'olio.
	 * I polifenoli sono importanti antiossidanti naturali.
	 */
	private generatePolyphenols(
		factors: ReturnType<typeof this.calculateQualityFactors>
	): number {
		// Valore base dipende dalla varietà (Coratina ha più polifenoli)
		const basePolyphenols = factors.variety === "Coratina" ? 400 : 300;

		let finalPolyphenols =
			(basePolyphenols *
				(factors.baseQuality + // Qualità delle olive
					factors.freshness * 0.5 + // Freschezza
					factors.processQuality * 0.5)) / // Processo di estrazione
			2;

		// Manteniamo il valore entro i limiti tipici
		finalPolyphenols = Math.max(
			this.QUALITY_LIMITS.POLYPHENOLS.MIN,
			Math.min(finalPolyphenols, this.QUALITY_LIMITS.POLYPHENOLS.MAX)
		);

		return Math.round(finalPolyphenols);
	}

	/**
	 * Genera il valore degli alchil esteri.
	 * Sono indicatori della qualità delle olive e del processo.
	 */
	private generateAlkylEsters(
		factors: ReturnType<typeof this.calculateQualityFactors>
	): number {
		// Valore base dipende principalmente dalla qualità delle olive
		const baseAlkylEsters = factors.baseQuality > 0.8 ? 35 : 50;

		let finalAlkylEsters =
			baseAlkylEsters *
			(1 +
				(1 - factors.freshness) * 0.3 + // Influenza della freschezza
				(1 - factors.processQuality) * 0.2); // Influenza del processo

		// Variazione casuale (±10%)
		finalAlkylEsters *= 1 + (Math.random() - 0.5) * 0.2;

		return Math.round(
			Math.min(
				finalAlkylEsters,
				this.QUALITY_LIMITS.ALKYL_ESTERS.EXTRA_VIRGIN
			)
		);
	}

	/**
	 * Genera il punteggio del panel test (valutazione organolettica).
	 * Il panel test è fondamentale per la classificazione dell'olio.
	 */
	private generateOrganolepticsScore(
		factors: ReturnType<typeof this.calculateQualityFactors>
	): number {
		// Punteggio base dipende dalla varietà e qualità
		const baseScore =
			factors.variety === "Coratina"
				? factors.baseQuality > 0.8
					? 8
					: 7
				: factors.baseQuality > 0.8
				? 7.5
				: 6.8;

		let finalScore =
			baseScore *
			(factors.processQuality * 0.4 + // Il processo è molto importante
				factors.freshness * 0.3 + // La freschezza influisce
				factors.baseQuality * 0.3); // La qualità delle olive è fondamentale

		// Piccola variazione casuale (±0.3 punti)
		finalScore += (Math.random() - 0.5) * 0.6;

		// Il punteggio deve essere tra 0 e 9
		return Number(Math.min(Math.max(finalScore, 0), 9).toFixed(1));
	}

	/**
	 * Verifica se il lotto soddisfa i requisiti per le certificazioni.
	 */
	private checkCertifications(
		analysis: OilAnalysis,
		batch: OlivesBatch
	): QualityCertification {
		const isExtraVirgin =
			analysis.acidity <= this.QUALITY_LIMITS.ACIDITY.EXTRA_VIRGIN &&
			analysis.peroxides <= this.QUALITY_LIMITS.PEROXIDES.EXTRA_VIRGIN &&
			analysis.alkylEsters <=
				this.QUALITY_LIMITS.ALKYL_ESTERS.EXTRA_VIRGIN &&
			analysis.organolepticsScore >=
				this.QUALITY_LIMITS.PANEL_TEST.MIN_EXTRA_VIRGIN;

		const isDOP =
			isExtraVirgin &&
			batch.origin === "Bitonto" &&
			["Ogliarola", "Coratina"].includes(batch.variety);

		return {
			batchId: batch.id,
			isDOP,
			isOrganic:
				batch.isOrganic &&
				analysis.acidity <= this.QUALITY_LIMITS.ACIDITY.ORGANIC,
			certificationBody: "Organismo di Certificazione autorizzato UE",
			certificationDate: new Date(),
			expiryDate: new Date(
				new Date().setFullYear(new Date().getFullYear() + 1)
			),
			certificationNumber: `CIMA-${batch.id}`,
		};
	}
}

export default QualitySimulator;
