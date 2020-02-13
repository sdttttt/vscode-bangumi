import { Vue } from "vue-property-decorator";
import { WeekBangumi } from '@/utils/constants';
import { AxiosResponse } from 'axios';
import { WeekBangumiResponse } from './types';


/**
 * Gets week bangumi
 * @param callback 
 * @author sdttttt
 */
export function getWeekBangumi(callback: (data:WeekBangumiResponse) => void) {
    Vue.$axios.get(WeekBangumi).then((ares: AxiosResponse) => {
        const res: WeekBangumiResponse = <WeekBangumiResponse>(ares.data);
        callback(res);
    });
}