import axiosClient from './axiosClient';

const classApi = {
    createClass(data) {
        const url = '/class/search';
        return axiosClient.post(url, data);
    },

    getDetailClass(id) {
        const url = '/class/' + id;
        return axiosClient.get(url);
    },

    getListClass(data) {
        const url = '/class/search';
        if (!data.page || !data.limit) {
            data.limit = 10;
            data.page = 1;
        }
        return axiosClient.post(url, data);
    },

    deleteClass(id) {
        const url = "/class/" + id;
        return axiosClient.delete(url);
    },

    deleteUserClass(data) {
        const url = "/class/removeUser";
        return axiosClient.post(url, data);
    },

    searchClass(name) {
        const params = {
            name: name.target.value
        }
        const url = '/class/searchByName';
        return axiosClient.get(url, { params });
    },

    addUser(data) {
        const url = '/class/addUser';
        return axiosClient.post(url, data);
    },

    getStudentsByClassId(id) {
        const url = `/class/students/${id}`;
        return axiosClient.get(url);
    },

    // Các API liên quan đến lịch thi
    createExamSchedule(data) {
        const url = '/class/createExamSchedule';
        return axiosClient.post(url, data);
    },

    getDetailExamSchedule(id) {
        const url = `/class/getExamScheduleById/${id}`;
        return axiosClient.get(url);
    },

    getListExamSchedules() {
        const url = '/class/getAllExamSchedules';
        return axiosClient.get(url);
    },

    deleteExamSchedule(id) {
        const url = `/class/deleteExamSchedule/${id}`;
        return axiosClient.delete(url);
    },

    deleteUserFromExamSchedule(data) {
        const url = '/class/examSchedule/removeUser';
        return axiosClient.post(url, data);
    },

    searchExamSchedule(name) {
        const params = {
            name: name.target.value
        };
        const url = '/class/examSchedule/searchByName';
        return axiosClient.get(url, { params });
    },

    addUserToExamSchedule(data) {
        const url = '/class/examSchedule/addUser';
        return axiosClient.post(url, data);
    },

    getStudentsByExamScheduleId(id) {
        const url = `/class/examSchedule/students/${id}`;
        return axiosClient.get(url);
    },
}

export default classApi;
