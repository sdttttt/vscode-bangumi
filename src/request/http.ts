/**
 * 单次请求的超时时间，单位为毫秒。
 *
 * @author sdttttt
 */
export const REQUEST_TIMEOUT_MS = 8888;

/**
 * 请求一个地址并解析 JSON 响应体。
 *
 * 扩展宿主自带 Node.js 20，因此可以直接使用全局 `fetch`，
 * 并由 `AbortSignal.timeout` 在超时后中断请求。非 2xx 状态按错误上报，
 * 与此前的 HTTP 客户端行为一致。
 *
 * @param url 请求地址
 * @returns 解析后的 JSON 响应体，类型由调用方指定
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
