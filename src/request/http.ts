/**
 * Timeout of a single request, in milliseconds.
 *
 * @author sdttttt
 */
export const REQUEST_TIMEOUT_MS = 8888;

/**
 * Requests a url and parses the JSON body.
 *
 * The extension host ships Node.js 20, so the global `fetch` is available and
 * `AbortSignal.timeout` aborts the request once it takes too long. A non-2xx
 * status is reported as an error, matching the behaviour of the previous HTTP
 * client.
 *
 * @param {string} url
 * @returns the parsed JSON body, typed by the caller
 * @async
 * @author sdttttt
 */
export async function getJson<T>(url: string): Promise<T> {
    const response = await fetch(url, {
        headers: {
            Accept: "application/json",
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
        throw new Error(
            `Request failed with status ${response.status} ${response.statusText}`
        );
    }

    return (await response.json()) as T;
}
