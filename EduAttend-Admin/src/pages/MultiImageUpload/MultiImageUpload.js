import React, { useState, useEffect } from 'react';
import { Upload, Button, notification, Breadcrumb, Table, Spin, Card, Row, Col, Divider, Input, Popconfirm } from 'antd';
import { UploadOutlined, HomeOutlined, UserOutlined, FileImageOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import AWS from 'aws-sdk';

const MultiImageUpload = () => {
    const [fileList, setFileList] = useState([]);
    const [s3Files, setS3Files] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    const s3 = new AWS.S3({
        region: 'ap-southeast-2',
        accessKeyId: 'AKIAZQ3DR2KZG7ZGRQHV',
        secretAccessKey: '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',
    });

    const listS3Files = async () => {
        setLoading(true);
        try {
            const params = {
                Bucket: 'zappa-60fsmljw6',
            };
            const data = await s3.listObjectsV2(params).promise();
            const files = data.Contents.map(file => ({
                key: file.Key,
                name: file.Key,
                lastModified: file.LastModified.toLocaleString(),
                size: (file.Size / 1024).toFixed(2) + ' KB',
                url: `https://zappa-60fsmljw6.s3.ap-southeast-2.amazonaws.com/${file.Key}`,
            }));
            setS3Files(files);
        } catch (error) {
            notification.error({
                message: 'Error Listing Files',
                description: 'There was an error retrieving the files from S3.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        listS3Files();
    }, []);

    const uploadToS3 = async (file) => {
        const params = {
            Bucket: 'zappa-60fsmljw6',
            Key: file.name,
            Body: file,
            ContentType: file.type,
        };

        return s3.upload(params).promise();
    };

    const handleUpload = async () => {
        try {
            const uploadPromises = fileList.map(file => uploadToS3(file.originFileObj));
            await Promise.all(uploadPromises);
            notification.success({
                message: 'Upload Successful',
                description: 'All images have been uploaded successfully.',
            });
            setFileList([]);
            listS3Files();
        } catch (error) {
            notification.error({
                message: 'Upload Failed',
                description: 'There was an error uploading the images.',
            });
        }
    };

    const deleteFromS3 = async (key) => {
        setLoading(true);
        try {
            const params = {
                Bucket: 'zappa-60fsmljw6',
                Key: key,
            };
            await s3.deleteObject(params).promise();
            notification.success({
                message: 'Delete Successful',
                description: 'The file has been deleted successfully.',
            });
            listS3Files();
        } catch (error) {
            notification.error({
                message: 'Delete Failed',
                description: 'There was an error deleting the file.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    const filteredFiles = s3Files.filter(file =>
        file.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Preview',
            dataIndex: 'url',
            key: 'preview',
            render: (url) => <img src={url} alt="" style={{ maxWidth: '100px' }} />,
        },
        {
            title: 'File Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Last Modified',
            dataIndex: 'lastModified',
            key: 'lastModified',
        },
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
        },
        // {
        //     title: 'Action',
        //     key: 'action',
        //     render: (_, record) => (
        //         <Popconfirm
        //             title="Are you sure you want to delete this file?"
        //             onConfirm={() => deleteFromS3(record.key)}
        //             okText="Yes"
        //             cancelText="No"
        //         >
        //             <Button icon={<DeleteOutlined />} danger />
        //         </Popconfirm>
        //     ),
        // },
    ];

    return (
        <Card style={{ margin: '24px', padding: '24px', borderRadius: '8px' }}>
            <Breadcrumb style={{ marginBottom: 20 }}>
                <Breadcrumb.Item href="">
                    <HomeOutlined />
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <UserOutlined />
                    <span>Tải ảnh lên S3</span>
                </Breadcrumb.Item>
            </Breadcrumb>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Upload Images" bordered={false}>
                        <Upload
                            multiple
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            beforeUpload={() => false}
                            style={{ marginBottom: 16 }}
                        >
                            <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
                        </Upload>
                        <Button
                            type="primary"
                            onClick={handleUpload}
                            disabled={fileList.length === 0}
                            icon={<UploadOutlined />}
                            style={{marginTop: 10}}
                        >
                            Tải lên S3
                        </Button>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Danh sách các tệp trên S3" bordered={false}>
                        <Input
                            placeholder="Tìm kiếm tệp..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={handleSearch}
                            style={{ marginBottom: 16 }}
                        />
                        {loading ? (
                            <Spin size="large" style={{ display: 'block', margin: 'auto' }} />
                        ) : (
                            <Table
                                columns={columns}
                                dataSource={filteredFiles}
                                pagination={{ pageSize: 5 }}
                                rowKey="key"
                                bordered
                            />
                        )}
                    </Card>
                </Col>
            </Row>
            <Divider style={{ margin: '40px 0' }} />
            <Row justify="center">
                <Col>
                    <Button type="link" href="https://aws.amazon.com/s3/" target="_blank" icon={<FileImageOutlined />}>
                        Learn more about Amazon S3
                    </Button>
                </Col>
            </Row>
        </Card>
    );
};

export default MultiImageUpload;
