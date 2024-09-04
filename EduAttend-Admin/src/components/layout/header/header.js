import { NotificationTwoTone } from '@ant-design/icons';
import { Col, List, Modal, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import userApi from "../../../apis/userApi";
import MenuDropdown from "../../DropdownMenu/dropdownMenu";
import "./header.css";

function Topbar() {

  const [notification, setNotification] = useState([]);
  const [visible, setVisible] = useState(false);
  const [visiblePopover, setVisiblePopover] = useState(false);
  const [titleNotification, setTitleNotification] = useState('');
  const [contentNotification, setContentNotification] = useState('');

  const handleNotification = (valuesContent, valuesTitile) => {
    setVisible(true);
    setVisiblePopover(visible !== visible)
    setContentNotification(valuesContent);
    setTitleNotification(valuesTitile);
  }

  const handleOk = () => {
    setVisible(false);
  }


  const content = (
    <div>
      {notification.map((values, index) => {
        return (
          <div>
            <List.Item style={{ padding: 0, margin: 0 }}>
              <List.Item.Meta
                style={{ width: 250, margin: 0 }}
                avatar={<NotificationTwoTone style={{ fontSize: '20px', color: '#08c' }} />}
                title={<a onClick={() => handleNotification(values.content, values.title)}>{values.title}</a>}
                description={<p className="fixLine" dangerouslySetInnerHTML={{ __html: values.content }}></p>}
              />
            </List.Item>
          </div>
        )
      })}
    </div>
  );



  useEffect(() => {
    (async () => {
      try {
        const response = await userApi.pingRole();
        console.log(response.role);
      } catch (error) {
        console.log('Failed to fetch event list:' + error);
      }
    })();
  }, [])

  return (
    <div
      className="header"
      style={{ background: "#FFFFFF", padding: 0, margin: 0 }}
    >
      <div >
        <Row className="header" style={{ background: "#FFFFFF", top: 0, position: 'fixed', left: 0, display: 'flex', width: '100%', padding: 0, zIndex: 2, justifyContent: 'center', alignItems: 'center' }}>
          <Col span={10}>
            <div style={{ position: 'relative', display: 'flex', paddingTop: 3, paddingBottom: 3, alignItems: "center", marginLeft: 8 }}>
              <Row
                justify="center"
              >
                <Col style={{ paddingLeft: 10 }}>
                  <a href="#">
                    <img style={{ height: 60, objectFit: 'contain' }} className="logo" alt="" src="https://www.haui.edu.vn/dnn/web/haui/assets/images/logo-ngang.png?v=1.2" />
                  </a>
                </Col>
              </Row>
            </div>
          </Col>
          <Col span={6} offset={8}>
            <div style={{ display: 'flex', padding: 5, justifyContent: 'center', flexDirection: 'row', float: 'right', alignItems: "center", marginRight: 48 }}>
              <Row>
                <MenuDropdown key="image" />
              </Row>
              <Row>
              </Row>
            </div>
          </Col>
        </Row>
        <Modal
          title={titleNotification}
          visible={visible}
          onOk={handleOk}
          onCancel={handleOk}
          cancelButtonProps={{ style: { display: 'none' } }}
        >
          <p dangerouslySetInnerHTML={{ __html: contentNotification }} ></p>
        </Modal>
      </div>
    </div >
  );
}

export default Topbar;