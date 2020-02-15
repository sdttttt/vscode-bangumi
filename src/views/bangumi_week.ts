import { getWeekBangumi } from "../request/bangumi";

export function openWeekBangumi() {
    const callback: (a: any) => void = (a: any) => {};
    getWeekBangumi(callback);
}