import {
    DeleteOutlined,
    HomeOutlined,
    PlusOutlined,
    ShoppingOutlined,
    DownloadOutlined,
    UploadOutlined
} from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout';
import {
    BackTop,
    Breadcrumb,
    Button,
    Col,
    Form,
    Modal,
    Row,
    Select,
    Space,
    Spin,
    Table,
    Popconfirm,
    Tag,
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

    const history = useHistory();

    const showModal = () => {
        setOpenModalCreate(true);
    };

    const handleOkUser = async (values) => {
        setLoading(true);
        try {
            console.log(values);
            const examId = id; // Đảm bảo biến id được định nghĩa đúng

            // Duyệt qua từng sinh viên được chọn
            const promises = values.students.map(studentId => {
                const categoryList = {
                    "examId": examId,
                    "userId": studentId,
                };
                return axiosClient.post("/exam/addStudentToExamList", categoryList);
            });

            // Chờ tất cả các lời hứa (promises) hoàn thành
            const results = await Promise.all(promises);

            // Kiểm tra kết quả của từng API call
            let successCount = 0;
            let errorCount = 0;
            results.forEach(response => {
                if (response.message === "Student added to exam list successfully") {
                    successCount++;
                } else if (response && response.status === 400) {
                    errorCount++;
                    notification.error({
                        message: 'Thông báo',
                        description: 'Sinh viên đã được gán cho kỳ thi này',
                    });
                } else {
                    errorCount++;
                    notification.error({
                        message: 'Thông báo',
                        description: 'Thêm sinh viên vào danh sách thi thất bại',
                    });
                }
            });

            if (successCount > 0) {
                notification.success({
                    message: 'Thông báo',
                    description: `Thêm ${successCount} sinh viên vào danh sách thi thành công`,
                });
                setOpenModalCreate(false);
                handleCategoryList();
            }

            setLoading(false);
        } catch (error) {
            console.error('Error adding students to exam list:', error);
            setLoading(false);
        }
    };


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
                "examId": Number(id),
                "userId": userId,
            }

            await examApi.deleteStudentFromExamList(data).then(response => {
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
        {
            title: 'Điểm danh',
            dataIndex: 'attendance',
            key: 'attendance',
            render: (attendance) => (
                <Tag color={attendance === 1 ? 'green' : 'red'}>
                    {attendance === 1 ? 'Đã điểm danh' : 'Chưa điểm danh'}
                </Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Popconfirm
                        title="Bạn có chắc chắn xóa sinh viên này?"
                        onConfirm={() => handleDeleteCategory(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            size="small"
                            icon={<DeleteOutlined />}
                            style={{ width: 150, borderRadius: 15, height: 30 }}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </div>
            ),
        }
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
            'Điểm danh': item.attendance === 1 ? 'Đã điểm danh' : 'Chưa điểm danh',
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setUploadFile(file);
    };

    const [uploadFile, setUploadFile] = useState(null);


    const handleUploadFile = async () => {
        if (!uploadFile) {
            console.error("No file selected.");
            return;
        }

        setLoading(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheet];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            try {
                for (let i = 0; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    const studentToAdd = {
                        examId: id, // Replace id with your exam id variable
                        studentId: row[0], // Assuming the first column has student IDs
                    };

                    const response = await axiosClient.post("/exam/addStudentToExamList2", studentToAdd);

                    if (response.status === 200) {
                        console.log(`Thêm sinh viên ${studentToAdd.userId} vào danh sách thi thành công`);
                        // Handle success notification or other actions
                    } else {
                        console.error(`Thêm sinh viên ${studentToAdd.userId} vào danh sách thi thất bại:`, response.data);
                        // Handle error notification or other actions
                    }
                }

                // Notify overall success if needed
                notification.success({
                    message: 'Thông báo',
                    description: 'Thêm sinh viên vào danh sách thi thành công',
                });

                // Close modal or refresh data after all students are added
                setOpenModalCreate(false);
                handleCategoryList();

            } catch (error) {
                console.error('Thêm sinh viên vào danh sách thi thất bại:', error);
                // Handle error notification or other actions
                notification.error({
                    message: 'Thông báo',
                    description: 'Thêm sinh viên vào danh sách thi thất bại',
                });

            } finally {
                setLoading(false);
            }
        };

        reader.readAsArrayBuffer(uploadFile);
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
                                                <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                                                <button onClick={handleUploadFile} disabled={!uploadFile || loading}>
                                                    {loading ? 'Đang xử lý...' : 'Upload'}
                                                </button>
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
                                label="Chọn sinh viên"
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
                                    mode="multiple"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().includes(input.toLowerCase()) ||
                                        option.value.toString().includes(input)
                                    }
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