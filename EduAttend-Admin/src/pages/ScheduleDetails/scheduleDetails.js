import {
    DeleteOutlined,
    HomeOutlined,
    PlusOutlined,
    ShoppingOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout';
import {
    BackTop,
    Breadcrumb,
    Button,
    Col,
    Form,
    Modal, Popconfirm,
    Row,
    Select,
    Space,
    Spin,
    Table,
    notification
} from 'antd';
import React, { useEffect, useState } from 'react';

import * as XLSX from 'xlsx';
import { useHistory, useParams } from 'react-router-dom';
import axiosClient from '../../apis/axiosClient';
import examApi from "../../apis/examApi";
import userApi from "../../apis/userApi";

import "./scheduleDetails.css";
const { Option } = Select;

const ScheduleDetails = () => {

    const [category, setCategory] = useState([]);

    const [openModalCreate, setOpenModalCreate] = useState(false);
    const [openModalUpdate, setOpenModalUpdate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const [form2] = Form.useForm();
    const [studentList, setStudentList] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const { id } = useParams();
    const [file, setUploadFile] = useState();

    const history = useHistory();

    const showModal = () => {
        setOpenModalCreate(true);
    };

    const handleOkUser = async (values) => {
        setLoading(true);
        try {

            console.log(values);

            const categoryList = {
                "examId": id,
                "userId": values.students,
            }
            return axiosClient.post("/exam/addStudentToExamList", categoryList).then(response => {
                if (response.message == "Student added to exam list successfully") {
                    notification.success({
                        message: 'Thông báo',
                        description: 'Thêm sinh viên vào danh sách thi thành công',
                    });
                    setOpenModalCreate(false)
                    handleCategoryList();
                } else if (response && response.status === 400) {
                    notification.error({
                        message: 'Thông báo',
                        description: 'Sinh viên đã được gán cho kỳ thi này',
                    });
                } else {
                    notification.error({
                        message: 'Thông báo',
                        description: 'Thêm sinh viên vào danh sách thi thất bại',
                    });
                }
                setLoading(false)
            })
        } catch (error) {
            throw error;
        }
    }

    const handleCancel = (type) => {
        if (type === "create") {
            setOpenModalCreate(false);
        } else {
            setOpenModalUpdate(false)
        }
        console.log('Clicked cancel button');
    };

    const handleCategoryList = async () => {
        try {
            await examApi.getExamListByExamId(id).then((res) => {
                console.log(res);
                setCategory(res.data);
                setLoading(false);
            });
        } catch (error) {
            console.log('Failed to fetch event list:' + error);
        };
    }

    const handleDeleteCategory = async (userId) => {
        setLoading(true);
        try {
            const data = {
                "classId": id,
                "userId": userId,
            }

            await examApi.deleteUserClass(data).then(response => {
                if (response === undefined) {
                    notification["error"]({
                        message: `Thông báo`,
                        description:
                            'Xóa sinh viên thất bại',

                    });
                    setLoading(false);
                }
                else {
                    notification["success"]({
                        message: `Thông báo`,
                        description:
                            'Xóa sinh viên thành công',

                    });
                    setCurrentPage(1);
                    handleCategoryList();
                    setLoading(false);
                }
            }
            );

        } catch (error) {
            console.log('Failed to fetch event list:' + error);
        }
    }

    const handleFilter = async (name) => {
        try {
            const res = await examApi.searchClass(name);
            setCategory(res.classes);
        } catch (error) {
            console.log('search to fetch category list:' + error);
        }
    }

    const columns = [
        {
            title: 'ID',
            key: 'index',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Mã số sinh viên',
            dataIndex: 'student_id',
            key: 'student_id',
            render: (text) => <a>{text}</a>,
        }, 
        {
            title: 'Họ và tên',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Môn thi',
            dataIndex: 'subject',
            key: 'subject',
        },
        {
            title: 'Phòng thi',
            dataIndex: 'room',
            key: 'room',
        },
        // {
        //     title: 'Action',
        //     key: 'action',
        //     render: (text, record) => (
        //         <div style={{ display: 'flex', flexDirection: 'column' }}>
        //             <Popconfirm
        //                 title="Bạn có chắc chắn xóa sinh viên này?"
        //                 onConfirm={() => handleDeleteCategory(record.id)}
        //                 okText="Yes"
        //                 cancelText="No"
        //             >
        //                 <Button
        //                     size="small"
        //                     icon={<DeleteOutlined />}
        //                     style={{ width: 150, borderRadius: 15, height: 30 }}
        //                 >
        //                     Xóa
        //                 </Button>
        //             </Popconfirm>
        //         </div>
        //     ),
        // }
    ];


    useEffect(() => {
        (async () => {
            try {
                await examApi.getExamListByExamId(id).then((res) => {
                    console.log(res);
                    setCategory(res.data);
                    setLoading(false);
                });

                await userApi.listUserByAdmin().then((res) => {
                    const studentList = res.data.filter(user => user.role === 'isStudent');
                    setStudentList(studentList);
                }).catch((error) => {
                    console.error('Error fetching student list:', error);
                });
            } catch (error) {
                console.log('Failed to fetch category list:' + error);
            }
        })();
    }, [])

    const handleExportToExcel = () => {
        if (category.length === 0) {
            notification.warning({
                message: 'Thông báo',
                description: 'Không có dữ liệu để xuất ra Excel',
            });
            return;
        }

        // Mapping data for export
        const dataToExport = category.map(item => ({
            'Mã số sinh viên': item.student_id,
            'Họ và tên': item.username,
            'Môn thi': item.subject,
            'Phòng thi': item.room,
        }));

        // Call exportToExcel function from utils
        exportToExcel(dataToExport, 'Danh sách sinh viên');
    };

    const exportToExcel = (data, fileName) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    return (
        <div>
            <Spin spinning={loading}>
                <div className='container'>
                    <div style={{ marginTop: 20 }}>
                        <Breadcrumb>
                            <Breadcrumb.Item href="">
                                <HomeOutlined />
                            </Breadcrumb.Item>
                            <Breadcrumb.Item href="">
                                <ShoppingOutlined />
                                <span>Chi tiết danh sách sinh viên</span>
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </div>

                    <div style={{ marginTop: 20 }}>
                        <div id="my__event_container__list">
                            <PageHeader
                                subTitle=""
                                style={{ fontSize: 14 }}
                            >
                                <Row>
                                    <Col span="18">
                                        {/* <Input
                                            placeholder="Tìm kiếm"
                                            allowClear
                                            onChange={handleFilter}
                                            style={{ width: 300 }}
                                        /> */}
                                    </Col>
                                    <Col span="6">
                                        <Row justify="end">
                                            <Space>
                                                <Button onClick={showModal} icon={<PlusOutlined />} style={{ marginLeft: 10 }} >Thêm sinh viên vào lịch thi</Button>
                                                <Button onClick={handleExportToExcel} icon={<DownloadOutlined />} style={{ marginLeft: 10 }} >Xuất Excel</Button>
                                            </Space>
                                        </Row>
                                    </Col>
                                </Row>

                            </PageHeader>
                        </div>
                    </div>

                    <div style={{ marginTop: 30 }}>
                        <Table columns={columns} pagination={{ position: ['bottomCenter'] }} dataSource={category} />
                    </div>
                </div>

                <Modal
                    title="Thêm sinh viên vào lớp học"
                    visible={openModalCreate}
                    style={{ top: 100 }}
                    onOk={() => {
                        form
                            .validateFields()
                            .then((values) => {
                                form.resetFields();
                                handleOkUser(values);
                            })
                            .catch((info) => {
                                console.log('Validate Failed:', info);
                            });
                    }}
                    onCancel={() => handleCancel("create")}
                    okText="Hoàn thành"
                    cancelText="Hủy"
                    width={600}
                >
                    <Spin spinning={loading}>
                        <Form
                            form={form}
                            name="eventCreate"
                            layout="vertical"
                            initialValues={{
                                residence: ['zhejiang', 'hangzhou', 'xihu'],
                                prefix: '86',
                            }}
                            scrollToFirstError
                        >

                            <Form.Item
                                name="students"
                                label="Tiện ích"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn sinh viên!',
                                    },
                                ]}
                                style={{ marginBottom: 10 }}
                            >
                                <Select
                                    placeholder="Chọn sinh viên"
                                >
                                    {studentList?.map((item) => (
                                        <Option key={item.id} value={item.id}>
                                            {item.username + " - " + item.student_id}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Form>
                    </Spin>
                </Modal>



                <BackTop style={{ textAlign: 'right' }} />
            </Spin>
        </div >
    )
}

export default ScheduleDetails;