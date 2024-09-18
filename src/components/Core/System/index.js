import classNames from 'classnames/bind';
import styles from './System.module.scss';
import { Avatar, List } from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import { getImageAccount } from '../../../services/userService';
import Toolbar from '../Toolbar';
import FollowerUpdate from '../../FormUpdate/FollowerUpdate';
import { AccountLoginContext } from '../../../context/AccountLoginContext';

const cx = classNames.bind(styles);

function System({ dataInfoSystem, dataFollower }) {
    const [processedFollower, setProcessedFollower] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const { userId } = useContext(AccountLoginContext)

    useEffect(() => {
        // const handleListFollower = async () => {
        //     const accessToken = JSON.parse(localStorage.getItem('userLogin')).token;

        //     const promises = dataFollower.map(async (item) => {
        //         const responseImage = await getImageAccount(accessToken, item.user?.userId);
        //         const image = responseImage.data.data.thong_tin_sinh_vien.image;
        //         return { title: item.user.fullname, image: image };
        //     });

        //     const processed = await Promise.all(promises);
        //     setProcessedFollower(processed)
        // }
        const handleListFollower = async () => {
            const promises = dataFollower.map(async (item) => {
                return { title: item.user.fullname, image: item.user.avatar };
            });

            const processed = await Promise.all(promises);
            setProcessedFollower(processed)
        }
        handleListFollower();
    }, [dataFollower])

    const followerUpdateMemoized = useMemo(() => {
        return (
            <FollowerUpdate
                title={'người theo dõi'}
                isUpdate={false}
                showModal={showModal}
                setShowModal={setShowModal}
            />
        );
    }, [showModal]);


    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-system')}>
                <div className={cx('container-title')}>
                    <h3>Thông tin hệ thống:</h3>
                </div>
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
                <div className={cx('container-title')}>
                    <h3>Danh sách người theo dõi:</h3>
                    <Toolbar type={'Tạo mới'} onClick={() => setShowModal(true)}></Toolbar>
                </div>
                <div className={cx('container-follower-detail')}>
                    <List
                        itemLayout="horizontal"
                        dataSource={processedFollower}
                        renderItem={(item, index) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar src={`data:image/jpeg;base64,${item.image}`} size={'large'} />}
                                    title={item.title}
                                />
                            </List.Item>
                        )}
                    />
                </div>
            </div>
            {followerUpdateMemoized}
        </div>
    );
}

export default System;
