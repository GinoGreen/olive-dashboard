import { useEffect, useState } from "react";
import { OleificioContext } from "./OleificioContext";
import { Dataset } from "@/types/types";
import OleificioSimulator from "@/simulator/OleificioSimulator";

interface OleificioProviderProps {
	children: React.ReactNode;
}

export function OleificioProvider({ children }: Readonly<OleificioProviderProps>) {
	const oleificioSimulator = new OleificioSimulator();
	const [dataset, setDataset] = useState<Dataset | null>(null);

	useEffect(() => {
		regenerateDataset();
	}, []);

	const regenerateDataset = () : Dataset => {
		const newDataset = oleificioSimulator.generateSeasonData();
		setDataset(newDataset);
		return newDataset;
	};

	const getDataset = () : Dataset => {
		if(dataset) {
			return dataset;
		} else {
			return regenerateDataset();
		}
	}

	return (
		<OleificioContext.Provider
			value={{
				getDataset,
				regenerateDataset
			}}
		>
			{children}
		</OleificioContext.Provider>
	);
}
