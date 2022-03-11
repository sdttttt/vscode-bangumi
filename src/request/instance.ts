import Axios, { AxiosRequestConfig, AxiosInstance } from "axios";


const config: AxiosRequestConfig = {
	timeout: 8888,
	headers: {
		"Content-Type": "application/json",
	},
};

const instance: AxiosInstance = Axios.create(config);

// instance.interceptors.request.use(function (config: AxiosRequestConfig) {
//     return config;
// }, function (err: any) {
//     return Promise.reject(err);
// });

// instance.interceptors.response.use(function (res: AxiosResponse<any>) {
//     return res;
// }, function (err: any) {
//     return Promise.reject(err);
// });

export default instance;
