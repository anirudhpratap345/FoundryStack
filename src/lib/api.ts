// Simple API helper to call the FastAPI backend
// Uses NEXT_PUBLIC_API_BASE if provided, otherwise defaults to http://localhost:8000

export type GeneratePayload = {
	user_id: string;
	prompt: string;
	input_overrides?: Record<string, unknown>;
};

export type GenerateSuccess = {
	response: any;
	tokens_used: number;
	remaining_trials: number;
};

export type GenerateError = {
	detail?: string | { msg?: string }[];
};

export function getApiBase(): string {
    // If deployed with a backend domain, set NEXT_PUBLIC_API_BASE_URL to that URL
    const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined;
    if (fromEnv && fromEnv.length > 0) return fromEnv.replace(/\/$/, "");
    return "http://localhost:8000";
}

export async function postGenerate(payload: GeneratePayload): Promise<{
	ok: boolean;
	status: number;
	data?: GenerateSuccess;
	error?: GenerateError | string;
}> {
	const base = getApiBase();
	try {
		const res = await fetch(`${base}/api/generate`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		const contentType = res.headers.get('content-type') || '';
		const isJson = contentType.includes('application/json');
		const body = isJson ? await res.json() : await res.text();

		if (!res.ok) {
			return { ok: false, status: res.status, error: body as GenerateError };
		}

		return { ok: true, status: res.status, data: body as GenerateSuccess };
	} catch (err: any) {
		return { ok: false, status: 0, error: err?.message || 'Network error' };
	}
}


