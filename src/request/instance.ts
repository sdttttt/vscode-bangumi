import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const config: AxiosRequestConfig = {
    timeout: 5000,
};

const instance: AxiosInstance = Axios.create(config);


export default instance;
