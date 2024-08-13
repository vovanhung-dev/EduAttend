import { CheckCircleOutlined, CopyOutlined, HomeOutlined, PlusOutlined, StopOutlined, UserOutlined, UploadOutlined, CameraOutlined } from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout';
import { BackTop, Breadcrumb, Button, Modal, Form, Card, Col, Input, Popconfirm, Row, Space, Spin, Table, Tag, notification, message, Select, Upload, Radio } from 'antd';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import userApi from "../../apis/userApi";
import "./accountManagement.css";
import axiosClient from '../../apis/axiosClient';
import AWS from 'aws-sdk';

const { Option } = Select;

const AccountManagement = () => {

    const [user, setUser] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [selectedInput, setSelectedInput] = useState();
    const [form] = Form.useForm();
    const [imageOption, setImageOption] = useState('upload');

    const history = useHistory();

    const titleCase = (str) => {
        var splitStr = str?.toLowerCase().split(' ');
        for (var i = 0; i < splitStr.length; i++) {
            // You do not need to check if i is larger than splitStr length, as your for does that for you
            // Assign it back to the array
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        // Directly return the joined string
        return splitStr.join(' ');
    }

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'index',
            render: (value, item, index) => (
                (page - 1) * 10 + (index + 1)
            ),
        },
        {
            title: 'Ảnh đại diện',
            key: 'image',
            dataIndex: 'image',
            render: (image) => (
                image ? (
                    <img src={image} alt="User Avatar" style={{ width: 50, height: 50, borderRadius: '50%' }} />
                ) : (
                    <span>Không có ảnh</span>
                )
            ),
        },
        {
            title: 'Họ và tên',
            dataIndex: 'username',
            key: 'username',
            render: (text, record) => (
                <Space size="middle">
                    {
                        text == null || text == undefined ? "" :
                            <p style={{ margin: 0 }}>{titleCase(text)}</p>
                    }

                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Mã số người dùng',
            dataIndex: 'student_id',
            key: 'student_id',
        },
        {
            title: 'Phân quyền',
            dataIndex: 'role',
            key: 'role',
            width: '12%',
            render: (text, record) => (
                <Space size="middle">
                    {
                        text === "isAdmin" ?
                            <Tag color="blue" key={text} style={{ width: 120, textAlign: "center" }} icon={<CopyOutlined />}>
                                Quản lý
                            </Tag> : text === "isStudent" ?
                                <Tag color="green" key={text} style={{ width: 120, textAlign: "center" }} icon={<CheckCircleOutlined />}>
                                    Sinh viên
                                </Tag> : text === "isTeacher" ?
                                    <Tag color="geekblue" key={text} style={{ width: 120, textAlign: "center" }} icon={<UserOutlined />}>
                                        Giảng viên
                                    </Tag> : null
                    }
                </Space>
            ),
        },

        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => (
                <Space size="middle">
                    {

                        text === "actived" ?
                            <Tag color="green" key={text} style={{ width: 80, textAlign: "center" }}>
                                Hoạt động
                            </Tag> : text == "newer" ? <Tag color="blue" key={text} style={{ width: 80, textAlign: "center" }}>
                                Newer
                            </Tag>

                                : <Tag color="default" key={text} style={{ width: 80, textAlign: "center" }}>
                                    Chặn
                                </Tag>
                    }

                </Space>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <div>
                    <Row style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        {record.status !== "actived" ?
                            <Popconfirm
                                title="Bạn muốn mở chặn tài khoản này?"
                                onConfirm={() => handleUnBanAccount(record)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button
                                    size="small"
                                    icon={<CheckCircleOutlined />}
                                    style={{ width: 160, borderRadius: 15, height: 30, marginBottom: 6 }}
                                >
                                    Mở chặn tài khoản
                                </Button>
                            </Popconfirm>
                            :
                            <Popconfirm
                                title="Bạn muốn chặn tài khoản này?"
                                onConfirm={() => handleBanAccount(record)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button
                                    size="small"
                                    icon={<StopOutlined />}
                                    style={{ width: 160, borderRadius: 15, height: 30, marginBottom: 6 }}
                                >
                                    Chặn tài khoản
                                </Button>
                            </Popconfirm>
                        }
                        <Button
                            size="small"
                            icon={<CheckCircleOutlined />}
                            style={{ width: 160, borderRadius: 15, height: 30, marginBottom: 6 }}
                            onClick={() => showChangeRoleModal(record)}
                        >
                            Thay đổi quyền
                        </Button>
                        <Button
                            size="small"
                            icon={<UserOutlined />}
                            style={{ width: 160, borderRadius: 15, height: 30, marginBottom: 6 }}
                            onClick={() => showEditModal(record)}
                        >
                            Sửa
                        </Button>
                        <Popconfirm
                            title="Bạn muốn xóa tài khoản này?"
                            onConfirm={() => handleDeleteAccount(record)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button
                                size="small"
                                icon={<StopOutlined />}
                                style={{ width: 160, borderRadius: 15, height: 30, marginBottom: 6 }}
                            >
                                Xóa
                            </Button>
                        </Popconfirm>
                    </Row>
                </div>
            ),
        }

    ];

    const s3 = new AWS.S3({
        region: 'ap-southeast-2',
        accessKeyId: 'AKIAZQ3DR2KZG7ZGRQHV',
        secretAccessKey: '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',
    });

    const uploadToS3 = async (file, studentId, username) => {
        const params = {
            Bucket: 'zappa-60fsmljw6',
            Key: `${studentId}-${username}`,
            Body: file,
            ContentType: file.type,
        };

        return s3.upload(params).promise();
    };

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [form2] = Form.useForm();

    const showEditModal = (record) => {
        const initialFormValues = {
            ...record,
            image: record.image ? [{ url: record.image }] : [],
        };

        console.log(initialFormValues)

        setSelectedUser(initialFormValues);
        form2.setFieldsValue(initialFormValues);
        setIsEditModalVisible(true);
    };

    const handleEditOk = async () => {
        try {
            const values = await form2.validateFields();
            console.log(values)
            const updatedUser = { ...selectedUser, ...values };
            if (values.image && values.image[0] && values.image[0].originFileObj) {
                const uploadResult = await uploadToS3(values.image[0].originFileObj, values.student_id, values.username);
                updatedUser.image = uploadResult.Location;
            }
            await userApi.updateUser(updatedUser.id, updatedUser);
            notification["success"]({
                message: `Thông báo`,
                description: 'Cập nhật tài khoản thành công',
            });
            handleListUser();
            setIsEditModalVisible(false);
        } catch (error) {
            notification["error"]({
                message: `Thông báo`,
                description: 'Cập nhật tài khoản thất bại',
            });
        }
    };

    const handleEditCancel = () => {
        setIsEditModalVisible(false);
    };

    const handleDeleteAccount = async (record) => {
        try {
            const res = await userApi.deleteUser(record.id);
            if(res === "Cannot delete user, as they are referenced in other records"){
                notification["error"]({
                    message: `Thông báo`,
                    description: 'Không thể xóa tài khoản, vì đang liên kết với bảng khác!',
                });
            }else{

                notification["success"]({
                    message: `Thông báo`,
                    description: 'Xóa tài khoản thành công',
                });
            }
            handleListUser();
        } catch (error) {
            notification["error"]({
                message: `Thông báo`,
                description: 'Xóa tài khoản thất bại',
            });
        }
    };

    const [isModalVisible2, setIsModalVisible2] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const showChangeRoleModal = (record) => {
        setSelectedRecord(record);
        setIsModalVisible2(true);
    };

    const handleOk = async () => {
        try {
            const params = {
                "role": selectedRole,
            }
            try {
                await userApi.unBanAccount(params, selectedRecord.id).then(response => {
                    if (response.message === "Email already exists") {
                        notification["error"]({
                            message: `Thông báo`,
                            description:
                                'Cập nhật quyền thất bại',

                        });
                    }
                    else {
                        notification["success"]({
                            message: `Thông báo`,
                            description:
                                'Cập nhật quyền thành công',

                        });
                        handleListUser();
                    }
                }
                );

            } catch (error) {
                console.log('Failed to fetch event list:' + error);
            }
            setIsModalVisible2(false);
            form.resetFields();
        } catch (error) {
            notification.error({ message: 'Failed to update role' });
        }
    };

    const handleCancel2 = () => {
        setIsModalVisible2(false);
        form.resetFields();
    };


    const handleListUser = async () => {
        try {
            const response = await userApi.listUserByAdmin({ page: 1, limit: 1000 });
            console.log(response);
            setUser(response.data);
            setLoading(false);
        } catch (error) {
            console.log('Failed to fetch event list:' + error);
        }
    }

    const handleUnBanAccount = async (data) => {
        const params = {
            "username": data.username,
            "email": data.email,
            "phone": data.phone,
            "password": data.password,
            "role": data.role,
            "status": "actived"
        }
        try {
            await userApi.unBanAccount(params, data.id).then(response => {
                if (response.message === "Email already exists") {
                    notification["error"]({
                        message: `Thông báo`,
                        description:
                            'Mở khóa thất bại',

                    });
                }
                else {
                    notification["success"]({
                        message: `Thông báo`,
                        description:
                            'Mở khóa thành công',

                    });
                    handleListUser();
                }
            }
            );

        } catch (error) {
            console.log('Failed to fetch event list:' + error);
        }
    }

    const handleBanAccount = async (data) => {
        console.log(data);
        const params = {
            "username": data.username,
            "email": data.email,
            "phone": data.phone,
            "password": data.password,
            "role": data.role,
            "status": "noactive"
        }
        try {
            await userApi.banAccount(params, data.id).then(response => {
                if (response === undefined) {
                    notification["error"]({
                        message: `Thông báo`,
                        description:
                            'Chặn thất bại',

                    });
                }
                else {
                    notification["success"]({
                        message: `Thông báo`,
                        description:
                            'Chặn thành công',

                    });
                    handleListUser();
                }
            }
            );

        } catch (error) {
            console.log('Failed to fetch event list:' + error);
        }
    }

    const handleFilterEmail = async (email) => {
        try {
            const response = await userApi.searchUser(email);
            setUser(response.data);
        } catch (error) {
            console.log('search to fetch user list:' + error);
        }
    }

    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const accountCreate = async (values) => {
        try {
            const formatData = {
                "username": values.name,
                "email": values.email,
                "phone": values.phone,
                "password": values.password,
                "role": values.role,
                "student_id": values.student_id,
                "status": "actived",
                "image": ""
            }

            if (values.image && values.image[0] && values.image[0].originFileObj) {
                const uploadResult = await uploadToS3(values.image[0].originFileObj, values.student_id, values.name);
                formatData.image = uploadResult.Location;
            }

            await axiosClient.post("/user", formatData)
                .then(response => {
                    console.log(response)
                    if (response == "User with this phone number already exists") {
                        return message.error('Số điện thoại không được trùng');
                    }

                    if (response == "User with this email already exists") {
                        return message.error('Email không được trùng');
                    }

                    if (response == "User already exists") {
                        return message.error('Tài khoản đã tổn tại');
                    } else
                        if (response.message == "Validation failed: Email has already been taken") {
                            message.error('Email has already been taken');
                        } else
                            if (response.message == "Validation failed: Phone has already been taken") {
                                message.error('Validation failed: Phone has already been taken');
                            } else
                                if (response == undefined) {
                                    notification["error"]({
                                        message: `Thông báo`,
                                        description:
                                            'Tạo tài khoản thất bại',

                                    });
                                }
                                else {
                                    notification["success"]({
                                        message: `Thông báo`,
                                        description:
                                            'Tạo tài khoản thành công',
                                    });
                                    form.resetFields();
                                    handleList();
                                    history.push("/account-management");
                                }
                }
                );

            setIsModalVisible(false);

        } catch (error) {
            throw error;
        }
        setTimeout(function () {
            setLoading(false);
        }, 1000);
    }

    const handleCapture = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // Set the dimensions of the canvas and video based on the modal width
        const modalWidth = 500; // Width of the modal (adjust as needed)
        const aspectRatio = 4 / 3; // Typical aspect ratio for webcam
        const videoHeight = modalWidth / aspectRatio;

        canvas.width = modalWidth;
        canvas.height = videoHeight;

        // Display modal with live video feed
        Modal.confirm({
            title: 'Chụp ảnh',
            content: (
                <video
                    ref={(vid) => vid && (vid.srcObject = stream)}
                    autoPlay
                    style={{ width: '100%', height: 'auto' }} // Set video to fill modal width
                />
            ),
            width: modalWidth, // Set modal width
            onOk() {
                // Capture the image from video feed
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
                        form.setFieldsValue({
                            image: [{ originFileObj: file }],
                        });
                    }
                    stream.getTracks().forEach((track) => track.stop()); // Stop the camera
                }, 'image/jpeg');
            },
            onCancel() {
                stream.getTracks().forEach((track) => track.stop()); // Stop the camera
            },
        });
    };


    const CancelCreateRecruitment = () => {
        setIsModalVisible(false);
        form.resetFields();
        history.push("/account-management");
    }

    const handleList = () => {
        (async () => {
            try {
                const response = await userApi.listUserByAdmin({ page: 1, limit: 1000 });
                console.log(response);
                setUser(response.data);
                setLoading(false);
            } catch (error) {
                console.log('Failed to fetch user list:' + error);
            }
        })();
    }

    useEffect(() => {
        handleList();
        window.scrollTo(0, 0);

    }, [])

    const [selectedRole, setSelectedRole] = useState(null);


    return (
        <div>
            <Spin spinning={loading}>
                <div style={{ marginTop: 20, marginLeft: 24 }}>
                    <Breadcrumb>
                        <Breadcrumb.Item href="">
                            <HomeOutlined />
                        </Breadcrumb.Item>
                        <Breadcrumb.Item href="">
                            <UserOutlined />
                            <span>Quản lý tài khoản</span>
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>

                <Modal title="Thay đổi quyền" visible={isModalVisible2} onOk={handleOk} onCancel={handleCancel2}>
                    <Select
                        placeholder="Chọn phân quyền"
                        style={{ width: '100%' }}
                        onChange={(value) => setSelectedRole(value)}
                    >
                        <Option value="isAdmin">Admin</Option>
                        <Option value="isStudent">Sinh viên</Option>
                        <Option value="isTeacher">Giảng viên</Option>
                    </Select>
                </Modal>
                <div id="account">
                    <div id="account_container">
                        <PageHeader
                            subTitle=""
                            style={{ fontSize: 14, paddingTop: 20, paddingBottom: 20 }}
                        >
                            <Row>
                                <Col span="12">
                                    <Input
                                        placeholder="Tìm kiếm theo email"
                                        allowClear
                                        style={{ width: 300 }}
                                        onChange={handleFilterEmail}
                                        value={selectedInput}
                                    />
                                </Col>
                                <Col span="12">
                                    <Row justify="end">
                                        <Button style={{ marginLeft: 10 }} icon={<PlusOutlined />} size="middle" onClick={showModal}>{"Tạo tài khoản"}</Button>
                                    </Row>
                                </Col>
                            </Row>

                        </PageHeader>
                    </div>
                </div>
                <div style={{ marginTop: 20, marginRight: 5 }}>
                    <div id="account">
                        <div id="account_container">
                            <Card title="Quản lý tài khoản" bordered={false} >
                                <Table columns={columns} dataSource={user} pagination={{ position: ['bottomCenter'] }}
                                />
                            </Card>
                        </div>
                    </div>
                </div>

                <Modal
                    title="Thêm tài khoản"
                    visible={isModalVisible}
                    onCancel={handleCancel}
                    footer={null}
                >
                    <Form
                        form={form}
                        onFinish={accountCreate}
                        name="accountCreate"
                        layout="vertical"
                        initialValues={{
                            residence: ['zhejiang', 'hangzhou', 'xihu'],
                            prefix: '86',
                        }}
                        scrollToFirstError
                    >
                        <Form.Item
                            name="name"
                            label="Tên đăng nhập"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên!',
                                },
                                { max: 100, message: 'Tên tối đa 100 ký tự' },
                                { min: 5, message: 'Tên ít nhất 5 ký tự' },
                            ]
                            }
                            style={{ marginBottom: 10 }}
                        >
                            <Input placeholder="Tên" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            hasFeedback
                            rules={[
                                {
                                    type: 'email',
                                    message: 'Email không hợp lệ!',
                                },
                                {
                                    required: true,
                                    message: 'Vui lòng nhập email!',
                                },
                            ]}
                            style={{ marginBottom: 10 }}
                        >
                            <Input placeholder="Email" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập password!',
                                },
                                { max: 20, message: 'Mật khẩu tối đa 20 ký tự' },
                                { min: 6, message: 'Mật khẩu ít nhất 5 ký tự' },
                            ]
                            }
                            style={{ marginBottom: 10 }}
                        >
                            <Input.Password placeholder="Mật khẩu" />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập số điện thoại!',
                                },
                                {
                                    pattern: /^[0-9]{10}$/,
                                    message: "Số điện thoại phải có 10 chữ số và chỉ chứa số",
                                },
                            ]}
                            style={{ marginBottom: 10 }}
                        >

                            <Input placeholder="Số điện thoại" />
                        </Form.Item>

                        <Form.Item
                            name="role"
                            label="Phân quyền"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn phân quyền!',
                                },
                            ]}
                            style={{ marginBottom: 10 }}
                        >
                            <Select placeholder="Chọn phân quyền">
                                <Option value="isAdmin">Admin</Option>
                                <Option value="isStudent">Sinh viên</Option>
                                <Option value="isTeacher">Giảng viên</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="student_id"
                            label="Mã số người dùng"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mã số sinh viên!',
                                },
                                { max: 50, message: 'Mã số sinh viên tối đa 50 ký tự' },
                            ]}
                            style={{ marginBottom: 10 }}
                        >
                            <Input placeholder="Mã số sinh viên" />
                        </Form.Item>

                        <Form.Item
                            label="Chọn phương thức nhập ảnh"
                            style={{ marginBottom: 10 }}
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập chọn phương thức nhập ảnh!',
                                },
                            ]}
                        >
                            <Radio.Group
                                value={imageOption}
                                onChange={(e) => setImageOption(e.target.value)}
                            >
                                <Radio value="upload">Tải ảnh lên</Radio>
                                <Radio value="capture">Chụp ảnh</Radio>
                            </Radio.Group>
                        </Form.Item>

                        {imageOption === 'upload' && (
                            <Form.Item
                                name="image"
                                label="Ảnh đại diện"
                                valuePropName="fileList"
                                getValueFromEvent={(e) => Array.isArray(e) ? e : e && e.fileList}
                                style={{ marginBottom: 10 }}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập chọn ảnh đại diện!',
                                    },
                                ]}
                            >
                                <Upload name="image" listType="picture" maxCount={1}>
                                    <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
                                </Upload>
                            </Form.Item>
                        )}

                        {imageOption === 'capture' && (
                            <Form.Item
                                label="Chụp ảnh"
                                style={{ marginBottom: 10 }}
                            >
                                <Button
                                    icon={<CameraOutlined />}
                                    onClick={() => handleCapture(form.getFieldValue('student_id'), form.getFieldValue('name'))}
                                >
                                    Chụp ảnh
                                </Button>
                            </Form.Item>
                        )}

                        <Form.Item >
                            <Button style={{ background: "#FF8000", color: '#FFFFFF', float: 'right', marginTop: 20, marginLeft: 8 }} htmlType="submit">
                                Hoàn thành
                            </Button>
                            <Button style={{ background: "#FF8000", color: '#FFFFFF', float: 'right', marginTop: 20 }} onClick={CancelCreateRecruitment}>
                                Hủy
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title="Sửa tài khoản"
                    visible={isEditModalVisible}
                    onOk={handleEditOk}
                    onCancel={handleEditCancel}
                >
                    <Form form={form2} layout="vertical" initialValues={selectedUser}>
                        <Form.Item
                            name="username"
                            label="Tên đăng nhập"
                            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="role"
                            label="Phân quyền"
                            rules={[{ required: true, message: 'Vui lòng chọn phân quyền!' }]}
                        >
                            <Select>
                                <Option value="isAdmin">Admin</Option>
                                <Option value="isStudent">Sinh viên</Option>
                                <Option value="isTeacher">Giảng viên</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="student_id"
                            label="Mã số người dùng"
                            rules={[{ required: true, message: 'Vui lòng nhập mã số sinh viên!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Chọn phương thức nhập ảnh"
                            style={{ marginBottom: 10 }}
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập chọn phương thức nhập ảnh!',
                                },
                            ]}
                        >
                            <Radio.Group
                                value={imageOption}
                                onChange={(e) => setImageOption(e.target.value)}
                            >
                                <Radio value="upload">Tải ảnh lên</Radio>
                                <Radio value="capture">Chụp ảnh</Radio>
                            </Radio.Group>
                        </Form.Item>

                        {imageOption === 'upload' && (
                            <Form.Item
                                name="image"
                                label="Ảnh đại diện"
                                valuePropName="fileList"
                                getValueFromEvent={(e) => Array.isArray(e) ? e : e && e.fileList}
                                style={{ marginBottom: 10 }}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập chọn ảnh đại diện!',
                                    },
                                ]}
                            >
                                <Upload name="image" listType="picture" maxCount={1} >
                                    <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
                                </Upload>
                            </Form.Item>
                        )}

                        {imageOption === 'capture' && (
                            <Form.Item
                                label="Chụp ảnh"
                                style={{ marginBottom: 10 }}
                            >
                                <Button
                                    icon={<CameraOutlined />}
                                    onClick={() => handleCapture(form.getFieldValue('student_id'), form.getFieldValue('name'))}
                                >
                                    Chụp ảnh
                                </Button>
                            </Form.Item>
                        )}

                    </Form>
                </Modal>

                <BackTop style={{ textAlign: 'right' }} />
            </Spin>
        </div>
    )
}

export default AccountManagement;