import {
	SystemStatus,
	MachineStatus,
	MaintenanceAlert,
	EnvironmentalData,
} from "@/types/types";

/**
 * Simulatore dello stato dei macchinari dell'Oleificio Cima di Bitonto.
 * Replica il comportamento delle macchine durante la produzione,
 * inclusi stati operativi, manutenzione e possibili guasti.
 */
class MachineSimulator {
	// Capacità massime di stoccaggio
	private readonly STORAGE_CAPACITY = {
		OLIVES: 50000, // kg di olive
		OIL: 20000, // litri di olio
	} as const;

	// Probabilità di guasto base per ogni macchina (percentuale giornaliera)
	private readonly BASE_FAILURE_RATES = {
		defogliatore: 0.5, // Più semplice, meno guasti
		frangitore: 1.0, // Stress meccanico elevato
		gramola: 0.7, // Stress termico moderato
		decanter: 1.2, // Componente critico
		separatore: 0.8, // Stress meccanico moderato
	} as const;

	// Durata media delle operazioni di manutenzione (in ore)
	private readonly MAINTENANCE_DURATION = {
		routine: 2, // Manutenzione ordinaria
		repair: 6, // Riparazioni
		emergency: 12, // Interventi di emergenza
	} as const;

	// Tiene traccia dello stato corrente delle macchine
	private currentStatus: {
		[key: string]: {
			status: MachineStatus;
			lastMaintenance: Date;
			operatingHours: number;
			alerts: MaintenanceAlert[];
		};
	} = {};

	constructor() {
		// Inizializza lo stato delle macchine
		const machines = [
			"defogliatore",
			"frangitore",
			"gramola",
			"decanter",
			"separatore",
		];
		const now = new Date();

		machines.forEach((machine) => {
			this.currentStatus[machine] = {
				status: "idle",
				lastMaintenance: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 giorni fa
				operatingHours: 0,
				alerts: [],
			};
		});
	}

	/**
	 * Genera lo stato del sistema per un giorno specifico,
	 * considerando il numero di lotti lavorati e le condizioni ambientali.
	 */
	public generateDailyStatus(
		date: Date,
		numBatches: number,
		envData: EnvironmentalData
	): SystemStatus {
		// Aggiorna lo stato delle macchine in base al carico di lavoro
		this.updateMachineStatuses(numBatches, envData);

		// Genera gli avvisi di manutenzione
		const maintenanceAlerts = this.generateMaintenanceAlerts(date);

		// Calcola la capacità di stoccaggio disponibile
		const storageCapacity = this.calculateStorageCapacity(numBatches);

		return {
			timestamp: date,
			machineStatuses: {
				defogliatore: this.currentStatus.defogliatore.status,
				frangitore: this.currentStatus.frangitore.status,
				gramola: this.currentStatus.gramola.status,
				decanter: this.currentStatus.decanter.status,
				separatore: this.currentStatus.separatore.status,
			},
			maintenanceAlerts,
			storageCapacity,
		};
	}

	/**
	 * Aggiorna lo stato delle macchine in base al carico di lavoro
	 * e alle condizioni ambientali.
	 */
	/**
	 * Calcola il tempo necessario per la manutenzione o riparazione.
	 */
	private calculateMaintenanceTime(
		status: MachineStatus,
		severity: "low" | "medium" | "high"
	): number {
		if (status === "maintenance") {
			return this.MAINTENANCE_DURATION.routine;
		}

		if (status === "error") {
			switch (severity) {
				case "low":
					return this.MAINTENANCE_DURATION.repair;
				case "medium":
					return this.MAINTENANCE_DURATION.repair * 1.5;
				case "high":
					return this.MAINTENANCE_DURATION.emergency;
				default:
					return this.MAINTENANCE_DURATION.repair;
			}
		}

		return 0;
	}

	/**
	 * Aggiorna lo stato delle macchine in base al carico di lavoro
	 * e alle condizioni ambientali.
	 */
	private updateMachineStatuses(
		numBatches: number,
		envData: EnvironmentalData
	): void {
		// Calcola il carico di lavoro (0-1)
		const workload = numBatches / 20; // 20 è il massimo numero di lotti giornalieri

		// Calcola il fattore di stress ambientale
		const envStress = this.calculateEnvironmentalStress(envData);

		Object.entries(this.currentStatus).forEach(([machine, status]) => {
			// Aumenta le ore di operatività
			if (status.status === "active") {
				status.operatingHours += workload * 8; // Max 8 ore al giorno
			}

			// Calcola la probabilità di guasto
			const baseRate =
				this.BASE_FAILURE_RATES[
					machine as keyof typeof this.BASE_FAILURE_RATES
				];
			const failureProb = baseRate * workload * envStress;

			// Determina se si verifica un guasto
			if (Math.random() * 100 < failureProb) {
				status.status = "error";
				return;
			}

			// Verifica necessità di manutenzione
			const daysSinceLastMaintenance =
				(new Date().getTime() - status.lastMaintenance.getTime()) /
				(1000 * 60 * 60 * 24);

			if (daysSinceLastMaintenance > 30 || status.operatingHours > 200) {
				status.status = "maintenance";
				status.lastMaintenance = new Date();
				status.operatingHours = 0;
				return;
			}

			// Se non ci sono problemi, lo stato dipende dal carico
			status.status = workload > 0 ? "active" : "idle";
		});
	}

	/**
	 * Calcola il fattore di stress ambientale che influenza
	 * la probabilità di guasto delle macchine.
	 */
	private calculateEnvironmentalStress(envData: EnvironmentalData): number {
		let stress = 1.0;

		// La temperatura elevata aumenta lo stress
		if (envData.temperature > 25) {
			stress *= 1 + (envData.temperature - 25) * 0.05;
		}

		// L'umidità elevata aumenta lo stress
		if (envData.humidity > 70) {
			stress *= 1 + (envData.humidity - 70) * 0.02;
		}

		return stress;
	}

	/**
	 * Genera gli avvisi di manutenzione basati sullo stato delle macchine.
	 */
	private generateMaintenanceAlerts(date: Date): MaintenanceAlert[] {
		const alerts: MaintenanceAlert[] = [];

		Object.entries(this.currentStatus).forEach(([machine, status]) => {
			// Genera avvisi in base allo stato
			if (status.status === "error") {
				alerts.push(
					this.createMaintenanceAlert(
						date,
						machine as keyof SystemStatus["machineStatuses"],
						"high",
						`Guasto rilevato sul ${machine}. Richiesto intervento immediato.`
					)
				);
			} else if (status.status === "maintenance") {
				alerts.push(
					this.createMaintenanceAlert(
						date,
						machine as keyof SystemStatus["machineStatuses"],
						"medium",
						`Manutenzione programmata per ${machine}.`
					)
				);
			} else if (status.operatingHours > 150) {
				// Avviso preventivo
				alerts.push(
					this.createMaintenanceAlert(
						date,
						machine as keyof SystemStatus["machineStatuses"],
						"low",
						`${machine}: consigliata manutenzione preventiva.`
					)
				);
			}
		});

		return alerts;
	}

	/**
	 * Crea un nuovo avviso di manutenzione.
	 */
	private createMaintenanceAlert(
		date: Date,
		machine: keyof SystemStatus["machineStatuses"],
		severity: "low" | "medium" | "high",
		description: string
	): MaintenanceAlert {
		const maintenanceTime = this.calculateMaintenanceTime(
			this.currentStatus[machine].status,
			severity
		);
		return {
			id: `${date.toISOString()}-${machine}-${Math.random()
				.toString(36)
				.substring(2, 11)}`,
			timestamp: date,
			machine,
			severity,
			description,
			status: "pending",
			estimatedDuration: maintenanceTime,
		};
	}

	/**
	 * Calcola la capacità di stoccaggio disponibile.
	 */
	private calculateStorageCapacity(
		numBatches: number
	): SystemStatus["storageCapacity"] {
		// Stima l'occupazione basata sul numero di lotti
		const oliveStorage = Math.max(
			0,
			this.STORAGE_CAPACITY.OLIVES - numBatches * 1500 // Media di 1500kg per lotto
		);

		// L'olio occupa circa il 15% del peso delle olive
		const oilStorage = Math.max(
			0,
			this.STORAGE_CAPACITY.OIL - numBatches * 1500 * 0.15
		);

		return {
			oliveStorage: Number(oliveStorage.toFixed(0)),
			oilStorage: Number(oilStorage.toFixed(0)),
		};
	}
}

export default MachineSimulator;
