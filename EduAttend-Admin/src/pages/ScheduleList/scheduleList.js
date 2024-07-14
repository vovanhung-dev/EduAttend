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
    DatePicker,
    Form,
    Input,
    Modal,
    notification,
    Popconfirm,
    Row,
    Select,
    Space,
    Spin,
    Table,
    TimePicker
} from 'antd';
import dayjs from 'dayjs';
import moment from "moment";
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axiosClient from '../../apis/axiosClient';
import examApi from "../../apis/examApi";
import userApi from '../../apis/userApi';
import "./scheduleList.css";
const { Option } = Select;

const ScheduleList = () => {

    const [category, setCategory] = useState([]);

    const [openModalCreate, setOpenModalCreate] = useState(false);
    const [openModalUpdate, setOpenModalUpdate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const [form2] = Form.useForm();
    const [currentPage, setCurrentPage] = useState(1);
    const [id, setId] = useState();

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
                room: values.room,
                invigilator_1: values.invigilator_1,
                invigilator_2: values.invigilator_2,
                invigilator_3: values.invigilator_3,
                invigilator_4: values.invigilator_4,
                date: dayjs(values.date).format('YYYY-MM-DD'),
            };
            return axiosClient.post("/exam", examScheduleData).then(response => {
                if (response.message == "Sheet với tiêu đề này đã tồn tại") {
                    setOpenModalCreate(false);
                    handleCategoryList();
                    return notification["error"]({
                        message: `Thông báo`,
                        description:
                            'Lịch thi này đã tồn tại! Vui lòng kiểm tra lại',
                    });
                }

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
                room: values.room,
                invigilator_1: values.invigilator_1,
                invigilator_2: values.invigilator_2,
                invigilator_3: values.invigilator_3,
                invigilator_4: values.invigilator_4,
                date: dayjs(values.date).format('YYYY-MM-DD'),
            };
            return axiosClient.put("/exam/" + id, examScheduleData).then(response => {
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
            await examApi.getListExams({ page: 1, limit: 10000 }).then((res) => {
                console.log(res);
                setCategory(res.data);
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
            await examApi.deleteExam(id).then(response => {
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
                const response = await examApi.getDetailExam(id);
                setId(id);
                form2.setFieldsValue({
                    subject: response.data.subject,
                    room: response.data.room,
                    invigilator_1: response.data.invigilator_1,
                    invigilator_2: response.data.invigilator_2,
                    invigilator_3: response.data.invigilator_3,
                    invigilator_4: response.data.invigilator_4,
                    date: dayjs(response.date)

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
            const res = await examApi.searchExams(name);
            setCategory(res.data);
        } catch (error) {
            console.log('search to fetch category list:' + error);
        }
    }

    const handleViewDetails = (id) => {
        history.push(`/details-schedule/${id}`);
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'exam_id',
            key: 'exam_id',
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
            title: 'Giám thị 1',
            dataIndex: 'invigilator_1',
            key: 'invigilator_1',
            render: (invigilator) => invigilator ? `Giám thị ${invigilator}` : '-',
        },
        {
            title: 'Giám thị 2',
            dataIndex: 'invigilator_2',
            key: 'invigilator_2',
            render: (invigilator) => invigilator ? `Giám thị ${invigilator}` : '-',
        },
        {
            title: 'Giám thị 3',
            dataIndex: 'invigilator_3',
            key: 'invigilator_3',
            render: (invigilator) => invigilator ? `Giám thị ${invigilator}` : '-',
        },
        {
            title: 'Giám thị 4',
            dataIndex: 'invigilator_4',
            key: 'invigilator_4',
            render: (invigilator) => invigilator ? `Giám thị ${invigilator}` : '-',
        },
        {
            title: 'Ngày thi',
            dataIndex: 'date',
            key: 'date',
            render: (date) => moment(date).format('YYYY-MM-DD'),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (createdAt) => moment(createdAt).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (updatedAt) => moment(updatedAt).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        style={{ width: 150, borderRadius: 15, height: 30, marginBottom: 10 }}
                        onClick={() => handleViewDetails(record.exam_id)}
                    >
                        {"Xem chi tiết"}
                    </Button>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        style={{ width: 150, borderRadius: 15, height: 30, marginBottom: 10 }}
                        onClick={() => handleEditCategory(record.exam_id)}
                    >
                        Chỉnh sửa
                    </Button>

                    <Popconfirm
                        title="Bạn có chắc chắn xóa lịch thi này?"
                        onConfirm={() => handleDeleteCategory(record.exam_id)}
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
        },
    ];


    const [teacherList, setTeacherList] = useState();

    useEffect(() => {
        (async () => {
            try {
                await examApi.getListExams({ page: 1, limit: 10000 }).then((res) => {
                    console.log(res);
                    setCategory(res.data);
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

                            <Form.Item
                                name="data"
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
                                name="invigilator_1"
                                label="Giám thị 1"
                                style={{ marginBottom: 10 }}
                            >
                                <Select placeholder="Chọn giám thị">
                                    {teacherList?.map((item) => (
                                        <Option key={item.id} value={item.id}>
                                            {item.username}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="invigilator_2"
                                label="Giám thị 2"
                                style={{ marginBottom: 10 }}
                            >
                                <Select placeholder="Chọn giám thị">
                                    {teacherList?.map((item) => (
                                        <Option key={item.id} value={item.id}>
                                            {item.username}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="invigilator_3"
                                label="Giám thị 3"
                                style={{ marginBottom: 10 }}
                            >
                                <Select placeholder="Chọn giám thị">
                                    {teacherList?.map((item) => (
                                        <Option key={item.id} value={item.id}>
                                            {item.username}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="invigilator_4"
                                label="Giám thị 4"
                                style={{ marginBottom: 10 }}
                            >
                                <Select placeholder="Chọn giám thị">
                                    {teacherList?.map((item) => (
                                        <Option key={item.id} value={item.id}>
                                            {item.username}
                                        </Option>
                                    ))}
                                </Select>
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

                            <Form.Item
                                name="data"
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
                                name="invigilator_1"
                                label="Giám thị 1"
                                style={{ marginBottom: 10 }}
                            >
                                <Select placeholder="Chọn giám thị">
                                    {teacherList?.map((item) => (
                                        <Option key={item.id} value={item.id}>
                                            {item.username}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="invigilator_2"
                                label="Giám thị 2"
                                style={{ marginBottom: 10 }}
                            >
                                <Select placeholder="Chọn giám thị">
                                    {teacherList?.map((item) => (
                                        <Option key={item.id} value={item.id}>
                                            {item.username}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="invigilator_3"
                                label="Giám thị 3"
                                style={{ marginBottom: 10 }}
                            >
                                <Select placeholder="Chọn giám thị">
                                    {teacherList?.map((item) => (
                                        <Option key={item.id} value={item.id}>
                                            {item.username}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="invigilator_4"
                                label="Giám thị 4"
                                style={{ marginBottom: 10 }}
                            >
                                <Select placeholder="Chọn giám thị">
                                    {teacherList?.map((item) => (
                                        <Option key={item.id} value={item.id}>
                                            {item.username}
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

export default ScheduleList;