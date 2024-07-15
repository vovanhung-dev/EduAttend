import axiosClient from './axiosClient';

const examApi = {
    createExam(data) {
        const url = '/exam';
        return axiosClient.post(url, data);
    },

    getDetailExam(id) {
        const url = `/exam/${id}`;
        return axiosClient.get(url);
    },

    getListExams(data) {
        const url = '/exam';
        // Thiết lập giới hạn và trang mặc định nếu không được cung cấp
        if (!data.page || !data.limit) {
            data.limit = 10;
            data.page = 1;
        }
        return axiosClient.get(url, { params: data });
    },

    deleteExam(id) {
        const url = `/exam/${id}`;
        return axiosClient.delete(url);
    },

    updateExam(id, data) {
        const url = `/exam/${id}`;
        return axiosClient.put(url, data);
    },

    searchExams(keyword) {
        const params = {
            keyword: keyword.target.value
        };
        const url = '/exam/search';
        return axiosClient.get(url, { params });
    },

    assignInvigilator(examId, invigilatorId) {
        const url = `/exam/${examId}/assignInvigilator`;
        return axiosClient.post(url, { invigilatorId });
    },

    removeInvigilator(examId, invigilatorId) {
        const url = `/exam/${examId}/removeInvigilator`;
        return axiosClient.post(url, { invigilatorId });
    },

    getExamListByExamId(examId) {
        const url = `/exam/exam_list/${examId}`;
        return axiosClient.get(url);
    },

    deleteStudentFromExamList(data) {
        const url = `/exam/deleteStudentFromExamList`;
        return axiosClient.delete(url, { data });
    },
};


export default examApi;
