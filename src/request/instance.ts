import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const config: AxiosRequestConfig = {
    timeout: 8888,
    headers: {
        "Content-Type": "application/json"
    }
};

const instance: AxiosInstance = Axios.create(config);

export default instance;