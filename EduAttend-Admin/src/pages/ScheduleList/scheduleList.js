import {
    DeleteOutlined,
    EditOutlined,
    HomeOutlined,
    PlusOutlined,
    ShoppingOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout';
import {
    BackTop,
    Breadcrumb,
    Button,
    Col,
    Empty,
    Form,
    Input,
    Modal, Popconfirm,
    Row,
    Space,
    Spin,
    Table,
    Tag,
    Select,
    notification,
    TimePicker,
    DatePicker
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axiosClient from '../../apis/axiosClient';
import classApi from "../../apis/classApi";
import "./scheduleList.css";
import uploadFileApi from '../../apis/uploadFileApi';
import userApi from '../../apis/userApi';
import moment from "moment";
import dayjs from 'dayjs';
const { Option } = Select;

const ScheduleList = () => {

    const [category, setCategory] = useState([]);

    const [openModalCreate, setOpenModalCreate] = useState(false);
    const [openModalUpdate, setOpenModalUpdate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const [form2] = Form.useForm();
    const [total, setTotalList] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [id, setId] = useState();
    const [image, setImage] = useState();
    const [file, setUploadFile] = useState();

    const history = useHistory();

    const showModal = () => {
        setOpenModalCreate(true);
    };

    const handleOkUser = async (values) => {
        setLoading(true);
        try {

            console.log(values);

            const examScheduleData = {
                subject: values.subject,
                classId: values.classId,
                teacherId: values.teacherId,
                examDate: values.examDate.format('YYYY-MM-DD'), 
                startTime: values.startTime.format('HH:mm'),    
                endTime: values.endTime.format('HH:mm'),       
                room: values.room
            };
            return axiosClient.post("/class/createExamSchedule", examScheduleData).then(response => {
                if (response === undefined) {
                    notification["error"]({
                        message: `Thông báo`,
                        description:
                            'Tạo lịch thi thất bại',
                    });
                }
                else {
                    notification["success"]({
                        message: `Thông báo`,
                        description:
                            'Tạo lịch thi thành công',
                    });
                    setOpenModalCreate(false);
                    handleCategoryList();
                }
            })
        } catch (error) {
            throw error;
        }
    }

    const handleUpdateCategory = async (values) => {
        setLoading(true);
        try {
            const examScheduleData = {
                subject: values.subject,
                classId: values.classId,
                teacherId: values.teacherId,
                examDate: values.examDate.format('YYYY-MM-DD'), 
                startTime: values.startTime.format('HH:mm'),    
                endTime: values.endTime.format('HH:mm'),       
                room: values.room
            };
            return axiosClient.put("/class/updateExamSchedule/" + id, examScheduleData).then(response => {
                if (response === undefined) {
                    notification["error"]({
                        message: `Thông báo`,
                        description:
                            'Chỉnh sửa lịch thi thất bại',
                    });
                }
                else {
                    notification["success"]({
                        message: `Thông báo`,
                        description:
                            'Chỉnh sửa lịch thi thành công',
                    });
                    handleCategoryList();
                    setOpenModalUpdate(false);
                }
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
            await classApi.getListExamSchedules({ page: 1, limit: 10000 }).then((res) => {
                console.log(res);
                setCategory(res.schedules);
                setLoading(false);
            });

            await classApi.getListClass({ page: 1, limit: 10000 }).then((res) => {
                console.log(res);
                setClassList(res.classes);
                setLoading(false);
            });

            await userApi.listUserByAdmin().then((res) => {
                const teacherList = res.data.filter(user => user.role === 'isTeacher');
                setTeacherList(teacherList);
            }).catch((error) => {
                console.error('Error fetching student list:', error);
            });
        } catch (error) {
            console.log('Failed to fetch event list:' + error);
        };
    }

    const handleDeleteCategory = async (id) => {
        setLoading(true);
        try {
            await classApi.deleteExamSchedule(id).then(response => {
                if (response === undefined) {
                    notification["error"]({
                        message: `Thông báo`,
                        description:
                            'Xóa lịch thi thất bại',

                    });
                    setLoading(false);
                }
                else {
                    notification["success"]({
                        message: `Thông báo`,
                        description:
                            'Xóa lịch thi thành công',

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

    const handleEditCategory = (id) => {
        setOpenModalUpdate(true);
        (async () => {
            try {
                const response = await classApi.getDetailExamSchedule(id);
                setId(id);
                form2.setFieldsValue({
                    subject: response.scheduleInfo.subject,
                    classId: response.scheduleInfo.class_id,
                    teacherId: response.scheduleInfo.teacher_id,
                    examDate: dayjs(response.scheduleInfo.examDate), 
                    startTime: dayjs(response.scheduleInfo.startTime),    
                    endTime: dayjs(response.scheduleInfo.endTime),       
                    room: response.scheduleInfo.room

                });
                console.log(form2);
                setLoading(false);
            } catch (error) {
                throw error;
            }
        })();
    }

    const handleFilter = async (name) => {
        try {
            const res = await classApi.searchClass(name);
            setCategory(res.classes);
        } catch (error) {
            console.log('search to fetch category list:' + error);
        }
    }

    const handleChangeImage = async (e) => {
        setLoading(true);
        const response = await uploadFileApi.uploadFile(e);
        if (response) {
            setUploadFile(response);
        }
        setLoading(false);
    }

    const handleViewDetails = (id) => {
        history.push(`/details-class/${id}`);
    };

    const columns = [
        {
            title: 'ID',
            key: 'index',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Môn thi',
            dataIndex: 'subject',
            key: 'subject',
        },
        {
            title: 'Lớp học',
            dataIndex: 'class_id',
            key: 'class_id',
            render: (classId, record) => record.className, // Giả định rằng bạn có một cột tên lớp học
        },
        {
            title: 'Giáo viên',
            dataIndex: 'teacher_id',
            key: 'teacher_id',
            render: (teacherId, record) => record.teacherName, // Giả định rằng bạn có một cột tên giáo viên
        },
        {
            title: 'Ngày thi',
            dataIndex: 'exam_date',
            key: 'exam_date',
            render: (date) => moment(date).format('YYYY-MM-DD'),
        },
        {
            title: 'Thời gian bắt đầu',
            dataIndex: 'start_time',
            key: 'start_time',
            render: (time) => moment(time, 'HH:mm:ss').format('HH:mm'),
        },
        {
            title: 'Thời gian kết thúc',
            dataIndex: 'end_time',
            key: 'end_time',
            render: (time) => moment(time, 'HH:mm:ss').format('HH:mm'),
        },
        {
            title: 'Phòng thi',
            dataIndex: 'room',
            key: 'room',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        style={{ width: 150, borderRadius: 15, height: 30, marginBottom: 10 }}
                        onClick={() => handleEditCategory(record.id)}
                    >
                        {"Chỉnh sửa"}
                    </Button>

                    <Popconfirm
                        title="Bạn có chắc chắn xóa lịch thi này?"
                        onConfirm={() => handleDeleteCategory(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            size="small"
                            icon={<DeleteOutlined />}
                            style={{ width: 150, borderRadius: 15, height: 30 }}
                        >
                            {"Xóa"}
                        </Button>
                    </Popconfirm>
                </div>
            ),
        }
    ];

    const [teacherList, setTeacherList] = useState();
    const [classList, setClassList] = useState();

    useEffect(() => {
        (async () => {
            try {
                await classApi.getListExamSchedules({ page: 1, limit: 10000 }).then((res) => {
                    console.log(res);
                    setCategory(res.schedules);
                    setLoading(false);
                });

                await classApi.getListClass({ page: 1, limit: 10000 }).then((res) => {
                    console.log(res);
                    setClassList(res.classes);
                    setLoading(false);
                });

                await userApi.listUserByAdmin().then((res) => {
                    const teacherList = res.data.filter(user => user.role === 'isTeacher');
                    setTeacherList(teacherList);
                }).catch((error) => {
                    console.error('Error fetching student list:', error);
                });

            } catch (error) {
                console.log('Failed to fetch category list:' + error);
            }
        })();
    }, [])
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
                                <span>Quản lý lịch thi</span>
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
                                        <Input
                                            placeholder="Tìm kiếm"
                                            allowClear
                                            onChange={handleFilter}
                                            style={{ width: 300 }}
                                        />
                                    </Col>
                                    <Col span="6">
                                        <Row justify="end">
                                            <Space>
                                                <Button onClick={showModal} icon={<PlusOutlined />} style={{ marginLeft: 10 }} >Tạo lịch thi</Button>
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
                    title="Tạo lịch thi mới"
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
                                name="subject"
                                label="Môn thi"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập môn thi!',
                                    },
                                ]}
                                style={{ marginBottom: 10 }}
                            >
                                <Input placeholder="Môn thi" />
                            </Form.Item>

                            <Form.Item
                                name="classId"
                                label="Lớp học"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn lớp học!',
                                    },
                                ]}
                                style={{ marginBottom: 10 }}
                            >
                                <Select placeholder="Chọn lớp học">
                                    {classList?.map((item) => (
                                        <Option key={item.id} value={item.id}>
                                            {item.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="teacherId"
                                label="Giáo viên"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn giáo viên!',
                                    },
                                ]}
                                style={{ marginBottom: 10 }}
                            >
                                <Select placeholder="Chọn giáo viên">
                                    {teacherList?.map((item) => (
                                        <Option key={item.id} value={item.id}>
                                            {item.username}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="examDate"
                                label="Ngày thi"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn ngày thi!',
                                    },
                                ]}
                                style={{ marginBottom: 10 }}
                            >
                                <DatePicker format="YYYY-MM-DD" />
                            </Form.Item>

                            <Form.Item
                                name="startTime"
                                label="Thời gian bắt đầu"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn thời gian bắt đầu!',
                                    },
                                ]}
                                style={{ marginBottom: 10 }}
                            >
                                <TimePicker format="HH:mm" />
                            </Form.Item>

                            <Form.Item
                                name="endTime"
                                label="Thời gian kết thúc"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn thời gian kết thúc!',
                                    },
                                ]}
                                style={{ marginBottom: 10 }}
                            >
                                <TimePicker format="HH:mm" />
                            </Form.Item>

                            <Form.Item
                                name="room"
                                label="Phòng thi"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập phòng thi!',
                                    },
                                ]}
                                style={{ marginBottom: 10 }}
                            >
                                <Input placeholder="Phòng thi" />
                            </Form.Item>


                        </Form>
                    </Spin>
                </Modal>

                <Modal
                    title="Chỉnh sửa lịch thi"
                    visible={openModalUpdate}
                    style={{ top: 100 }}
                    onOk={() => {
                        form2
                            .validateFields()
                            .then((values) => {
                                form2.resetFields();
                                handleUpdateCategory(values);
                            })
                            .catch((info) => {
                                console.log('Validate Failed:', info);
                            });
                    }}
                    onCancel={handleCancel}
                    okText="Hoàn thành"
                    cancelText="Hủy"
                    width={600}
                >
                    <Spin spinning={loading}>

                        <Form
                            form={form2}
                            name="eventCreate"
                            layout="vertical"
                            initialValues={{
                                residence: ['zhejiang', 'hangzhou', 'xihu'],
                                prefix: '86',
                            }}
                            scrollToFirstError
                        >
                           <Form.Item
                                name="subject"
                                label="Môn thi"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập môn thi!',
                                    },
                                ]}
                                style={{ marginBottom: 10 }}
                            >
                                <Input placeholder="Môn thi" />
                            </Form.Item>

                            <Form.Item
                                name="classId"
                                label="Lớp học"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn lớp học!',
                                    },
                                ]}
                                style={{ marginBottom: 10 }}
                            >
                                <Select placeholder="Chọn lớp học">
                                    {classList?.map((item) => (
                                        <Option key={item.id} value={item.id}>
                                            {item.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="teacherId"
                                label="Giáo viên"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn giáo viên!',
                                    },
                                ]}
                                style={{ marginBottom: 10 }}
                            >
                                <Select placeholder="Chọn giáo viên">
                                    {teacherList?.map((item) => (
                                        <Option key={item.id} value={item.id}>
                                            {item.username}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="examDate"
                                label="Ngày thi"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn ngày thi!',
                                    },
                                ]}
                                style={{ marginBottom: 10 }}
                            >
                                <DatePicker format="YYYY-MM-DD" />
                            </Form.Item>

                            <Form.Item
                                name="startTime"
                                label="Thời gian bắt đầu"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn thời gian bắt đầu!',
                                    },
                                ]}
                                style={{ marginBottom: 10 }}
                            >
                                <TimePicker format="HH:mm" />
                            </Form.Item>

                            <Form.Item
                                name="endTime"
                                label="Thời gian kết thúc"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn thời gian kết thúc!',
                                    },
                                ]}
                                style={{ marginBottom: 10 }}
                            >
                                <TimePicker format="HH:mm" />
                            </Form.Item>

                            <Form.Item
                                name="room"
                                label="Phòng thi"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập phòng thi!',
                                    },
                                ]}
                                style={{ marginBottom: 10 }}
                            >
                                <Input placeholder="Phòng thi" />
                            </Form.Item>
                        </Form>
                    </Spin>

                </Modal>

                <BackTop style={{ textAlign: 'right' }} />
            </Spin>
        </div >
    )
}

export default ScheduleList;