import { Col, Divider, Form, Modal, Row } from "antd";
import classNames from "classnames/bind";
import styles from "./UserInfo.module.scss"
import { useCallback, useContext, useEffect, useState } from "react";
import { AccountLoginContext } from "../../context/AccountLoginContext";
import FormItem from "../Core/FormItem";
import { getUserById } from "../../services/userService";
import { format } from "date-fns";
import Image from "../Core/Image";
import teacher from "../../assets/images/teacher.png"

const cx = classNames.bind(styles);

function UserInfo({ showModal, onClose }) {
    const [open, setOpen] = useState(false);
    const { userId, permission } = useContext(AccountLoginContext)
    const [userInfo, setUserInfo] = useState(null);


    useEffect(() => {
        if (showModal !== open) {
            setOpen(showModal);
        }
        console.log(open);
    }, [showModal]);

    const handleCancel = useCallback(() => {
        setOpen(false);
        if (onClose) onClose();
    }, [onClose]);

    // Lấy thông tin user
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await getUserById(userId);
                console.log(response);
                if (response.message === "success") {
                    setUserInfo(response.data);
                }

            } catch (error) {

            }
        }
        if (userId) {
            fetchUserInfo();
        }
    }, [userId])

    return <Modal
        className={cx('modal-user-info')}
        centered
        open={open}
        title={'Thông tin người dùng'}
        onCancel={handleCancel}
        footer={null}
        width={permission === "SINHVIEN" ? "900px" : "600px"}
    >
        {console.log(permission)}
        {permission === "SINHVIEN"
            ? <div className={cx('wrapper-info-student')}>
                <Divider orientation="left">
                    Thông tin sinh viên
                </Divider>
                <div className={cx('container-info-user')}>
                    <Form>
                        <Row gutter={[0, 0]}>
                            <Col span={12}>
                                <FormItem label={'Mã SV'}>
                                    <p>{userInfo?.userId}</p>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label={'Họ và tên'}>
                                    <p>{userInfo?.fullname}</p>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label={'Ngày sinh'}>
                                    <p>{userInfo?.dateOfBirth && format(userInfo?.dateOfBirth, 'dd/MM/yyyy')}</p>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label={'Giới tính'}>
                                    <p>{userInfo?.sex}</p>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label={'Điện thoại'}>
                                    <p>{userInfo?.phone}</p>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label={'Số CMND/ CCCD'}>
                                    <p>{userInfo?.cccd}</p>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label={'Email'}>
                                    <p>{userInfo?.email}</p>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label={'Nơi sinh'}>
                                    <p>{userInfo?.placeOfBirth}</p>
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                    <div className={cx('avt')}>
                        <Image src={`data:image/jpeg;base64,${userInfo?.avatar}`} className={cx('image-avt')} />
                    </div>
                </div>
                <Divider orientation="left">
                    Thông tin khóa học
                </Divider>
                <div className={cx('container-info-course')}>
                    <Form>
                        <FormItem label={'Lớp'}>
                            <p>{userInfo?.class}</p>
                        </FormItem>
                        <FormItem label={'Ngành'}>
                            <p>{userInfo && userInfo?.faculty?.facultyName}</p>
                        </FormItem>
                        <FormItem label={'Chuyên ngành'}>
                            <p>{userInfo && userInfo?.major?.majorName}</p>
                        </FormItem>
                        <FormItem label={'Bậc hệ đào tạo'}>
                            <p>{userInfo?.bac_he_dao_tao}</p>
                        </FormItem>
                        <FormItem label={'Niên khóa'}>
                            <p>{userInfo?.nien_khoa}</p>
                        </FormItem>
                    </Form>
                </div>
            </div>
            :
            <div className={cx('wrapper-info-teacher')}>
                <Divider orientation="left">
                    Thông tin giảng viên
                </Divider>
                <div className={cx('container-info-user')}>
                    <Form>
                        <FormItem label={'Mã CBGD'}>
                            <p>{userInfo?.userId}</p>
                        </FormItem>
                        <FormItem label={'Họ và tên'}>
                            <p>{userInfo && userInfo?.fullname}</p>
                        </FormItem>
                        <FormItem label={'Điện thoại'}>
                            <p>{userInfo && userInfo?.phone}</p>
                        </FormItem>
                        <FormItem label={'Email'}>
                            <p>{userInfo?.email}</p>
                        </FormItem>
                    </Form>
                    <div className={cx('avt')}>
                        <Image src={teacher} className={cx('image-avt')} />
                    </div>
                </div>
            </div>
        }

    </Modal>;
}

export default UserInfo;