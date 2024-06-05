import classNames from 'classnames/bind';
import styles from './System.module.scss';
import { Avatar, List } from 'antd';

const cx = classNames.bind(styles);

function System({ dataInfoSystem, dataFollower }) {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-system')}>
                <h3>Thông tin hệ thống:</h3>
                <div className={cx('container-system-detail')}>
                    <List
                        itemLayout="horizontal"
                        dataSource={dataInfoSystem}
                        renderItem={(item, index) => (
                            <List.Item>
                                <List.Item.Meta avatar={<h4>{item.title}</h4>} title={item.description} />
                            </List.Item>
                        )}
                    />
                </div>
            </div>
            <div className={cx('container-follower')}>
                <h3>Danh sách người theo dõi:</h3>
                <div className={cx('container-follower-detail')}>
                    <List
                        itemLayout="horizontal"
                        dataSource={dataFollower}
                        renderItem={(item, index) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                                    title={item.title}
                                />
                            </List.Item>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}

export default System;
