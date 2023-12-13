export const redirect: (
	path: string,
	params?: Record<string, string>,
) => Response = (path, params = {}) => {
	const paramsString = new URLSearchParams(params).toString();
	return new Response(null, {
		status: 302,
		headers: {
			Location: `${path}${paramsString ? `?${paramsString}` : ""}`,
		},
	});
};
