import Axios from "./instance";

export async function useReminderNoticeHuck(): Promise<void> {
	Axios.get("http://118.25.6.84:10086/reminder");
}

export async function useWeekBangumiNoticeHuck(): Promise<void> {
	Axios.get("http://118.25.6.84:10086/week");
}

export async function useBangumiNoticeHuck(): Promise<void> {
	Axios.get("http://118.25.6.84:10086/bangumi");
}
