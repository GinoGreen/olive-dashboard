// Dati ambientali monitorati durante la produzione
export interface EnvironmentalData {
	timestamp: Date;
	temperature: number; // in Celsius
	humidity: number; // percentuale
	windSpeed: number; // km/h
	precipitation: number; // mm
}

// Caratteristiche delle olive in ingresso
export interface OlivesBatch {
	id: string;
	arrivalTimestamp: Date;
	weight: number; // in kg
	variety: "Ogliarola" | "Coratina"; // Le due varietà principali di Cima di Bitonto
	quality: "Premium" | "Standard";
	origin: string; // zona di provenienza
	harvestDate: Date;
	isOrganic: boolean;
}

// Parametri del processo di lavorazione
export interface ProcessingParameters {
	timestamp: Date;
	grindingTemperature: number; // temperatura molitura
	mixingDuration: number; // durata gramolatura in minuti
	extractionTemperature: number; // temperatura estrazione
	centrifugationSpeed: number; // velocità centrifuga
}

// Risultati dell'analisi dell'olio
export interface OilAnalysis {
	batchId: string;
	timestamp: Date;
	acidity: number; // acidità
	peroxides: number; // numero di perossidi
	polyphenols: number; // contenuto polifenoli
	alkylEsters: number; // alchil esteri
	organolepticsScore: number; // valutazione panel test
	qualityCertification: QualityCertification;
}

// Dati di produzione
export interface ProductionData {
	batchId: string;
	timestamp: Date;
	oliveProcessed: number; // kg di olive lavorate
	oilProduced: number; // litri di olio prodotto
	yield: number; // resa in percentuale
	processingTime: number; // tempo di lavorazione in minuti
	energyConsumption: number; // consumo energetico in kWh
	waterConsumption: number; // consumo acqua in litri
}

// Sistema di qualità e certificazioni
export interface QualityCertification {
	batchId: string;
	isDOP: boolean; // Denominazione di Origine Protetta
	isOrganic: boolean; // Certificazione Biologica
	certificationBody: string; // Ente certificatore
	certificationDate: Date;
	expiryDate: Date;
	certificationNumber: string;
}

// Stato del sistema di produzione
export type MachineStatus = "active" | "idle" | "maintenance" | "error";

export interface SystemStatus {
	timestamp: Date;
	machineStatuses: {
		defogliatore: MachineStatus;
		frangitore: MachineStatus;
		gramola: MachineStatus;
		decanter: MachineStatus;
		separatore: MachineStatus;
	};
	maintenanceAlerts: MaintenanceAlert[];
	storageCapacity: {
		oliveStorage: number; // capacità disponibile in kg
		oilStorage: number; // capacità disponibile in litri
	};
}

// Avvisi di manutenzione
export interface MaintenanceAlert {
	id: string;
	timestamp: Date;
	machine: keyof SystemStatus["machineStatuses"];
	severity: "low" | "medium" | "high";
	description: string;
	status: "pending" | "in-progress" | "resolved";
	estimatedDuration: number; // in minuti
}

export interface Dataset {
	environmental: EnvironmentalData[];
	batches: OlivesBatch[];
	processing: ProcessingParameters[];
	production: ProductionData[];
	quality: OilAnalysis[];
	machineStatus: SystemStatus[];
}
