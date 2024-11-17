import React, { memo } from 'react';
import moment from 'moment';
import FormItem from '../../Core/FormItem';
import Detail from '../../Core/Detail';
import classNames from 'classnames/bind';
import styles from './NguoiDung.module.scss';
import { Form, Steps } from 'antd';

const cx = classNames.bind(styles);

export const NguoiDungDetail = memo(function NguoiDungDetail({ title, showModal, setShowModal }) {
    const isModalVisible = showModal !== false;
    const [currentStep, setCurrentStep] = React.useState(0);

    const handleCloseModal = () => {
        if (isModalVisible) {
            setShowModal(false);
        }
    };

    const handleStepChange = (step) => {
        setCurrentStep(step);
    };

    return (
        <Detail
            title={title}
            showModal={isModalVisible}
            onClose={handleCloseModal}
            className={cx('wrapper-modal-detail')}
        >
            <Steps current={currentStep} onChange={handleStepChange}>
                <Steps.Step title="Thông tin cá nhân" />
                <Steps.Step title="Thông tin khóa học" />
                <Steps.Step title="Thông tin khác" />
            </Steps>
            <Form className={cx('container-detail')}>
                {currentStep === 0 && (
                    <div className={cx('grid-container')}>
                        <div className={cx('grid-item')}>
                            <img
                                src={`data:image/png;base64,${showModal.avatar}`}
                                alt="Avatar"
                                className={cx('avatar-image')}
                            />
                            <FormItem label={'Mã người dùng'} name="userId">
                                <p>{showModal?.userId || ''}</p>
                            </FormItem>
                            <FormItem label={'Họ tên'} name="fullname">
                                <p>{showModal?.fullname || ''}</p>
                            </FormItem>
                            <FormItem label={'Email'} name="email">
                                <p>{showModal?.email || ''}</p>
                            </FormItem>

                        </div>
                        <div className={cx('grid-item')}>
                            <FormItem label={'Số căn cước công dân'} name="cccd">
                                <p>{showModal?.cccd || ''}</p>
                            </FormItem>
                            <FormItem label={'Ngày sinh'} name="dateOfBirth">
                                <p>{showModal?.dateOfBirth ? moment(showModal.dateOfBirth).format('DD-MM-YYYY') : ''}</p>
                            </FormItem>
                            <FormItem label={'Nơi sinh'} name="placeOfBirth">
                                <p>{showModal?.placeOfBirth || ''}</p>
                            </FormItem>
                            <FormItem label={'Số điện thoại'} name="phone">
                                <p>{showModal?.phone || ''}</p>
                            </FormItem>
                            <FormItem label={'Giới tính'} name="sex">
                                <p>{showModal?.sex || ''}</p>
                            </FormItem>
                        </div>
                    </div>
                )}
                {currentStep === 1 && (
                    <>
                        {showModal?.isStudent ? (
                            <>
                                <FormItem label={'Cố vấn học tập'} name="ho_ten_cvht">
                                    <p>{showModal?.ho_ten_cvht || ''}</p>
                                </FormItem>
                                <FormItem label={'Email cố vấn học tập'} name="email_cvht">
                                    <p>{showModal?.email_cvht || ''}</p>
                                </FormItem>
                                <FormItem label={'Số điện thoại cố vấn'} name="dien_thoai_cvht">
                                    <p>{showModal?.dien_thoai_cvht || ''}</p>
                                </FormItem>
                            </>
                        ) : (
                            <FormItem label={'Học vị'} name="hocvi">
                                <p>{showModal?.hoc_vi || ''}</p>
                            </FormItem>
                        )}
                        <FormItem label={'Lớp'} name="class">
                            <p>{showModal?.class || ''}</p>
                        </FormItem>
                        <FormItem label={'Ngành'} name="faculty">
                            <p>{showModal?.faculty?.facultyName || ''}</p>
                        </FormItem>
                        <FormItem label={'Chuyên ngành'} name="major">
                            <p>{showModal?.major?.majorName || ''}</p>
                        </FormItem>
                        <FormItem label={'Niên khoá'} name="nien_khoa">
                            <p>{showModal?.nien_khoa || ''}</p>
                        </FormItem>
                    </>
                )}
                {currentStep === 2 && (
                    <>
                        {' '}
                        {showModal?.isActive ? (
                            <FormItem label={'Trạng thái'} name="isActive">
                                <p>Hoạt động</p>
                            </FormItem>
                        ) : (
                            <FormItem label={'Trạng thái'} name="isActive">
                                <p>Ngưng hoạt động</p>
                            </FormItem>
                        )}
                        {showModal?.stillStudy ? (
                            <FormItem label={'Trạng thái học tập'} name="stillStudy">
                                <p>Còn học</p>
                            </FormItem>
                        ) : (
                            <FormItem label={'Trạng thái học tập'} name="stillStudy">
                                <p>Ngưng học</p>
                            </FormItem>
                        )}
                        <FormItem label={'Dân tộc'} name="dan_toc">
                            <p>{showModal?.dan_toc || ''}</p>
                        </FormItem>
                        <FormItem label={'Tôn giáo'} name="ton_giao">
                            <p>{showModal?.ton_giao || ''}</p>
                        </FormItem>
                        <FormItem label={'Bậc hệ đào tạo'} name="bac_he_dao_tao">
                            <p>{showModal?.bac_he_dao_tao || ''}</p>
                        </FormItem>
                        <FormItem label={'Khu vực'} name="khu_vuc">
                            <p>{showModal?.khu_vuc || ''}</p>
                        </FormItem>
                    </>
                )}
            </Form>
        </Detail>
    );
});
