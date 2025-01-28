import { OleificioContext } from "@/context/OleificioContext";
import { useContext } from "react";

export const useOleificio = () => {
	const context = useContext(OleificioContext);
	if (!context)
		throw new Error("useOleificio must be used within an OleificioContext");
	return { ...context };
};
