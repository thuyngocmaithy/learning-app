import classNames from 'classnames/bind';
import styles from './System.module.scss';
import { Avatar, List } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import Toolbar from '../Toolbar';
import FollowerUpdate from '../../FormUpdate/FollowerUpdate';
import noImage from '../../../assets/images/no-image.png';
import { CloseOutlined } from '@ant-design/icons';
import { deleteFollowerDetail } from '../../../services/followerDetailService';
import { message } from '../../../hooks/useAntdApp';
import { useConfirm } from '../../../hooks/useConfirm';

const cx = classNames.bind(styles);

function System({ dataInfoSystem, dataFollower, reLoad }) {
    const { deleteConfirm } = useConfirm();
    const [processedFollower, setProcessedFollower] = useState([]);
    const followerCancelRef = useRef(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const handleListFollower = async () => {

            const promises = dataFollower.map(async (item) => {
                return { id: item.id, title: item.user.fullname, image: item.user.avatar };
            });

            const processed = await Promise.all(promises);
            setProcessedFollower(processed)
        }
        if (dataFollower)
            handleListFollower();
    }, [dataFollower])

    const handleRemoveFollower = async () => {
        try {
            await deleteFollowerDetail(followerCancelRef.current);
            message.success("Xóa người theo dõi thành công");

        } catch (error) {
            console.error(`Lỗi xóa người theo dõi: ${error}`);
        }
        finally {
            followerCancelRef.current = null;
            reLoad();
        }
    }

    const followerUpdateMemoized = useMemo(() => {
        return (
            <FollowerUpdate
                title={'người theo dõi'}
                isUpdate={false}
                showModal={showModal}
                setShowModal={setShowModal}
                reLoad={reLoad}
            />
        );
    }, [reLoad, showModal]);


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
                        renderItem={(item) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={
                                        <Avatar
                                            src={item.image
                                                ? `data:image/jpeg;base64,${item.image}`
                                                : noImage}
                                            size={'large'}
                                        />}
                                    title={
                                        <div className={cx('user-follower')}>
                                            <p>{item.title}</p>
                                            <CloseOutlined
                                                onClick={() => {
                                                    followerCancelRef.current = item.id;
                                                    setTimeout(() => deleteConfirm('người theo dõi', handleRemoveFollower, false), 0)
                                                }}
                                            />
                                        </div>
                                    }
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
