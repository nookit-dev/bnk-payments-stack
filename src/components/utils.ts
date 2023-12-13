import { CRNode, ClassRecord } from "bnkit/htmlody";
export type ResponsiveClassRecord = {
	"*"?: ClassRecord;
	sm?: ClassRecord;
	md?: ClassRecord;
	lg?: ClassRecord;
	xl?: ClassRecord;
};
export const combineClasses = (
	classRecords: ResponsiveClassRecord,
	node?: CRNode | Omit<CRNode, "tag">,
): ResponsiveClassRecord => {
	const combinedClassRecords = {
		...classRecords,
	} satisfies ResponsiveClassRecord;
	// as the combinedClassRecords

	// if the node has a classRecord for a breakpoint, then combine the two
	// classRecords together
	if (node?.cr) {
		for (const breakpoint in node.cr) {
			const nodeClassRecord = node?.cr?.[breakpoint] as unknown as ClassRecord;
			// if the node has a classRecord for a breakpoint, then combine the two

			if (nodeClassRecord) {
				// @ts-ignore 
				combinedClassRecords[breakpoint] = {
					// @ts-ignore
					...combinedClassRecords[breakpoint],
					// @ts-ignore
					...node.cr[breakpoint],
				};
			}
		}
	}

	return combinedClassRecords;
};
