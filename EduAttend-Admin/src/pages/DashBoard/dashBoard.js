import {
    DashboardOutlined,
    HomeOutlined
} from '@ant-design/icons';
import {
    BackTop,
    Breadcrumb,
    Spin,
    Statistic,
    Row,
    Col,
    Card
} from 'antd';
import React, { useEffect, useState } from 'react';
import dashBoardApi from '../../apis/dashBoardApi';
import "./dashBoard.css";

const DashBoard = () => {
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            setLoading(true);
            try {
                const response = await dashBoardApi.getAssetStatistics();
                setStatistics(response); 
            } catch (error) {
                console.error('Lỗi khi tải thống kê tài sản:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, []);

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
                                <DashboardOutlined />
                                <span>Bảng thống kê</span>
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                    
                    <Row gutter={16} style={{ marginTop: 20 }}>
                        {statistics && (
                            <>
                                <Col span={8}>
                                    <Card title="Tham gia của học sinh">
                                        {statistics.studentParticipation.map(item => (
                                            <p key={item.exam_id}>
                                                {item.subject}: {item.student_count}
                                            </p>
                                        ))}
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card title="Số kỳ thi">
                                        {statistics.examsCount.map(item => (
                                            <Statistic
                                                key={item.total_exams}
                                                title="Tổng số kỳ thi"
                                                value={item.total_exams}
                                            />
                                        ))}
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card title="Số tài khoản">
                                        {statistics.accountsCount.map(item => (
                                            <Statistic
                                                key={item.total_accounts}
                                                title="Tổng số tài khoản"
                                                value={item.total_accounts}
                                            />
                                        ))}
                                    </Card>
                                </Col>
                            </>
                        )}
                    </Row>
                </div>
                <BackTop style={{ textAlign: 'right' }} />
            </Spin>
        </div>
    )
}

export default DashBoard;
