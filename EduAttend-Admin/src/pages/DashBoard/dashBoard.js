import {
    ContactsTwoTone,
    DashboardOutlined,
    EnvironmentTwoTone,
    HomeOutlined,
    NotificationTwoTone,
    ProfileTwoTone
} from '@ant-design/icons';
import {
    BackTop,
    Breadcrumb,
    Card,
    Col,
    Row,
    Spin
} from 'antd';
import React, { useEffect, useState } from 'react';
import userApi from '../../apis/userApi';
import "./dashBoard.css";


const DashBoard = () => {
    const [statisticList, setStatisticList] = useState([]);
    const [totalResult, setTotalResult] = useState([]);
    const [service, setService] = useState([]);
    const [booking, setBooking] = useState([]);

    const [loading, setLoading] = useState(true);
    const [total, setTotalList] = useState();
    const [area, setArea] = useState(null);
    const [userData, setUserData] = useState([]);


    useEffect(() => {
        (async () => {
            try {

                const response = await userApi.getProfile();
                console.log(response);
                setUserData(response.user);
                await userApi.listUserByAdmin().then((res) => {
                    console.log(res);
                    setStatisticList(res.data);
                    setLoading(false);
                });



            } catch (error) {
                console.log('Failed to fetch event list:' + error);
            }
        })();
    }, [])
    return (
        <div>
            <Spin spinning={false}>
                <div className='container'>
                    <div style={{ marginTop: 20 }}>
                        <Breadcrumb>
                            <Breadcrumb.Item href="">
                                <HomeOutlined />
                            </Breadcrumb.Item>
                            <Breadcrumb.Item href="">
                                <DashboardOutlined />
                                <span>DashBoard</span>
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                    {userData?.role == "isAdmin" ?
                        <Row gutter={12} style={{ marginTop: 20 }}>
                            <Col span={6}>
                                <Card className="card_total" bordered={false}>
                                    <div className='card_number'>
                                        <div>
                                            <div className='number_total'>{statisticList?.length || 0}</div>
                                            <div className='title_total'>Số thành viên</div>
                                        </div>
                                        <div>
                                            <ContactsTwoTone style={{ fontSize: 48 }} />
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card className="card_total" bordered={false}>
                                    <div className='card_number'>
                                        <div>
                                            <div className='number_total'>{total?.length || 0}</div>
                                            <div className='title_total'>Tổng sinh viên</div>
                                        </div>
                                        <div>
                                            <NotificationTwoTone style={{ fontSize: 48 }} />
                                        </div>
                                    </div>
                                </Card>
                            </Col>

                            <Col span={6}>
                                <Card className="card_total" bordered={false}>
                                    <div className='card_number'>
                                        <div>
                                            <div className='number_total'>{area?.length || 0}</div>
                                            <div className='title_total'>Tổng số lớp</div>
                                        </div>
                                        <div>
                                            <EnvironmentTwoTone style={{ fontSize: 48 }} />
                                        </div>
                                    </div>
                                </Card>
                            </Col>

                            
                            <Col span={6}>
                                <Card className="card_total" bordered={false}>
                                    <div className='card_number'>
                                        <div>
                                            <div className='number_total'>{service?.length || 0}</div>
                                            <div className='title_total'>Tổng lịch thi</div>
                                        </div>
                                        <div>
                                            <ProfileTwoTone style={{ fontSize: 48 }} />
                                        </div>
                                    </div>
                                </Card>
                            </Col>

                            
                        </Row> :

                        <Row gutter={12} style={{ marginTop: 20 }}>
                            <Col span={6}>
                                <Card className="card_total" bordered={false}>
                                    <div className='card_number'>
                                        <div>
                                            <div className='number_total'>
                                                {Number(totalResult?.userServicesRevenue)?.toLocaleString('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }) || '0 VND'}
                                            </div>
                                            <div className='title_total'>Tổng giá trị dịch vụ</div>
                                        </div>
                                        <div>
                                            <ContactsTwoTone style={{ fontSize: 48 }} />
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card className="card_total" bordered={false}>
                                    <div className='card_number'>
                                        <div>
                                            <div className='number_total'>{totalResult?.userServicesCount}</div>
                                            <div className='title_total'>Tổng dịch vụ</div>
                                        </div>
                                        <div>
                                            <NotificationTwoTone style={{ fontSize: 48 }} />
                                        </div>
                                    </div>
                                </Card>
                            </Col>

                            <Col span={6}>
                                <Card className="card_total" bordered={false}>
                                    <div className='card_number'>
                                        <div>
                                            <div className='number_total'>{totalResult?.userCampgroundsCount}</div>
                                            <div className='title_total'>Tổng khu cắm trại</div>
                                        </div>
                                        <div>
                                            <EnvironmentTwoTone style={{ fontSize: 48 }} />
                                        </div>
                                    </div>
                                </Card>
                            </Col>

                            <Col span={6}>
                                <Card className="card_total" bordered={false}>
                                    <div className='card_number'>
                                        <div>
                                            <div className='number_total'>{booking?.length}</div>
                                            <div className='title_total'>Tổng số đặt vé</div>
                                        </div>
                                        <div>
                                            <ProfileTwoTone style={{ fontSize: 48 }} />
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    }
                </div>
                <BackTop style={{ textAlign: 'right' }} />
            </Spin>
        </div >
    )
}

export default DashBoard;