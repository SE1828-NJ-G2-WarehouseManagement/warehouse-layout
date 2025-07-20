import axiosInstance from "../config/axios";

class ReportService {

    constructor() {
        this.url = '/reports'
    }

    async getReports(date) {
        
        try {
            const response = await axiosInstance.get(`${this.url}`, {
                params: {date},
                requiresAuth: true
            });

            if (response) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

export default ReportService;