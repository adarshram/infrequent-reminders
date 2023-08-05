import { REACT_APP_DEV_MODE, REACT_APP_PROD_MODE } from "@env";

const baseUrl =
	process.env.NODE_ENV == "development"
		? REACT_APP_DEV_MODE
		: REACT_APP_PROD_MODE;

export class ServerCall {
	bearer: string = "";
	setBearerHeader = (bearer: string) => {
		this.bearer = `Bearer ${bearer}`;
	};
	get = async (endPoint: string) => {
		let endPointUrl = baseUrl + endPoint;
		const fetchOptions = {
			method: "GET",
			headers: new Headers({
				Authorization: this.bearer != "" ? this.bearer : null,
				Accept: "application/json",
				"Content-Type": "application/json",
			}),
		};
		console.log(this.bearer);

		try {
			let callResults = await fetch(endPointUrl, fetchOptions);

			if (!callResults.ok) {
				throw new Error("failed");
			}
			return callResults;
		} catch (e) {
			console.log(`${endPoint} failed`);
		}
		return false;
	};
	post = async (endPoint: string, callBody?: any) => {
		let endPointUrl = baseUrl + endPoint;

		const fetchOptions = {
			method: "POST",
			headers: new Headers({
				Authorization: this.bearer != "" ? this.bearer : null,
				Accept: "application/json",
				"Content-Type": "application/json",
			}),
			body: JSON.stringify(callBody ? callBody : {}),
		};

		try {
			let callResults = await fetch(endPointUrl, fetchOptions);

			if (!callResults.ok) {
				throw new Error("failed");
			}
			return callResults;
		} catch (e) {
			console.log(`${endPoint} failed`);
		}
		return false;
	};
}
