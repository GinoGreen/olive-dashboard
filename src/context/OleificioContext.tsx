import { Dataset } from "@/types/types";
import { createContext } from "react";

interface OleificioContextType {
	getDataset: () => Dataset;
	regenerateDataset: () => void;
}

const defaultContextValue: OleificioContextType = {
	getDataset: () => ({} as Dataset),
	regenerateDataset: () => {},
};

export const OleificioContext = createContext(defaultContextValue);
