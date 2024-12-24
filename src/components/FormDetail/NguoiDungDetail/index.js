import { memo } from 'react';
import moment from 'moment';
import FormItem from '../../Core/FormItem';
import Detail from '../../Core/Detail';
import classNames from 'classnames/bind';
import styles from './NguoiDung.module.scss';
import { Col, Form, Row } from 'antd';
import Image from '../../Core/Image';

const cx = classNames.bind(styles);

export const NguoiDungDetail = memo(function NguoiDungDetail({ title, showModal, setShowModal }) {
    const isModalVisible = showModal !== false;

    const handleCloseModal = () => {
        if (isModalVisible) {
            setShowModal(false);
        }
    };

    return (
        <Detail
            title={title}
            showModal={isModalVisible}
            onClose={handleCloseModal}
            className={cx('wrapper-modal-detail')}
        >
            <Form>
                <Image src={`data:image/jpeg;base64,${showModal?.avatar || null}`} className={cx('image-avt')} />
                <div className={cx('container-detail')}>
                    <Row gutter={24}>
                        <Col span={12}>
                            <FormItem label={'Chức danh'}>
                                <p>{showModal?.isStudent ? 'Sinh viên' : 'Giảng viên'}</p>
                            </FormItem>
                            <FormItem label={'Họ tên'} name="fullname">
                                <p>{showModal?.fullname || ''}</p>
                            </FormItem>
                            <FormItem label={'Email'} name="email">
                                <p>{showModal?.email || ''}</p>
                            </FormItem>
                            <FormItem label={'Nơi sinh'} name="placeOfBirth">
                                <p>{showModal?.placeOfBirth || ''}</p>
                            </FormItem>
                            <FormItem label={'Ngành'} name="major">
                                <p>{showModal?.major?.majorName || ''}</p>
                            </FormItem>
                            <FormItem label={'Số căn cước công dân'} name="cccd">
                                <p>{showModal?.cccd || ''}</p>
                            </FormItem>
                            <FormItem label={'Bậc hệ đào tạo'} name="bac_he_dao_tao">
                                <p>{showModal?.bac_he_dao_tao || ''}</p>
                            </FormItem>
                            {!showModal?.isStudent && (
                                <FormItem label={'Học vị'} name="hocvi">
                                    <p>{showModal?.hoc_vi || ''}</p>
                                </FormItem>
                            )}
                        </Col>
                        <Col span={12}>
                            <FormItem label={'Mã người dùng'} name="userId">
                                <p>{showModal?.userId || ''}</p>
                            </FormItem>
                            <FormItem label={'Giới tính'} name="sex">
                                <p>{showModal?.sex || ''}</p>
                            </FormItem>
                            <FormItem label={'Ngày sinh'} name="dateOfBirth">
                                <p>{showModal?.dateOfBirth ? moment(showModal.dateOfBirth).format('DD-MM-YYYY') : ''}</p>
                            </FormItem>

                            <FormItem label={'Số điện thoại'} name="phone">
                                <p>{showModal?.phone || ''}</p>
                            </FormItem>
                            <FormItem label={'Chuyên ngành'} name="major">
                                <p>{showModal?.major?.majorName || ''}</p>
                            </FormItem>
                            <FormItem label={'Khối'} name="major">
                                <p>{showModal?.khoi || ''}</p>
                            </FormItem>
                            <FormItem label={'Niên khoá'} name="nien_khoa">
                                <p>{showModal?.nien_khoa || ''}</p>
                            </FormItem>
                            {showModal?.isActive ? (
                                <FormItem label={'Trạng thái'} name="isActive">
                                    <p>Hoạt động</p>
                                </FormItem>
                            ) : (
                                <FormItem label={'Trạng thái'} name="isActive">
                                    <p>Ngưng hoạt động</p>
                                </FormItem>
                            )}

                        </Col>
                    </Row>
                </div>
            </Form >
        </Detail >
    );
});
