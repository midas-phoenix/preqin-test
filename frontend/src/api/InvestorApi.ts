import { AxiosResponse } from "axios";
import axios from "axios";
import { Commitment } from "../models/Commitment";
import { Investor } from "../models/Investor";

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/',
    timeout: 10000
});

const dataCallback = (response: AxiosResponse) => response.data;

const getInvestors = async (): Promise<Investor[]> => {
    return await axiosInstance.get<Investor[]>("/investors")
        .then(dataCallback)
        .catch((error) => {
            console.log(error)
            return [];
        }
        );
}

const getCommitments = async (investorID: string): Promise<Commitment[] | []> => {
    return await axiosInstance.get<Commitment[]>(`/investors/${investorID}/commitments`)
        .then(dataCallback)
        .catch((error) => {
            console.log(error)
            return [];
        });
}

export const InvestorAPI = {
    getInvestors,
    getCommitments
}


