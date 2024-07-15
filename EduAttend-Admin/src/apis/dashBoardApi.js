import axiosClient from "./axiosClient";

const dashBoardApi = {
    async getAssetStatistics() {
        const url = `/statistics/all`;
        try {
            const response = await axiosClient.get(url);
            return response;
        } catch (error) {
            throw error;
        }
    }, 
}

export default dashBoardApi;
