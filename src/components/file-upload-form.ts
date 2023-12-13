import { ExtensionMapKeys } from "bnkit/files-folders";
import { cc, children } from "bnkit/htmlody";
import { section } from "./section";

export type AllowedFileExtension = string | ExtensionMapKeys;

export const fileUploadForm = ({
	allowedFilesTypes,
	action,
	formTitle,
}: {
	allowedFilesTypes: AllowedFileExtension[];
	action?: string;
	formTitle: string;
}) => {
	// allowed file types passed in as "json", "ts"
	const buildFileTypesAttr = () => {
		const allowedFileTypes = allowedFilesTypes.map(
			(fileType: AllowedFileExtension) => {
				return `.${fileType}`;
			},
		);

		return allowedFileTypes.join(",");
	};

	return section([
		{
			tag: "h2",
			content: "Import",
			cr: cc(["text-3xl", "font-bold", "mb-4"]),
			attributes: {
				itemprop: "headline",
			},
		},
		{
			tag: "form",
			attributes: {
				method: "post",
				enctype: "multipart/form-data",
				...(action && { action }),
			},
			child: children([
				{
					tag: "input",
					attributes: {
						type: "file",
						name: "file",
						//  only allow json files
						accept: buildFileTypesAttr(),
					},
				},
				{
					tag: "input",
					attributes: {
						type: "submit",
					},
				},
			]),
		},
	]);
};
