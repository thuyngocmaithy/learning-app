import { memo, useState, useEffect } from 'react';
import FormItem from '../../Core/FormItem';
import Detail from '../../Core/Detail';
import classNames from 'classnames/bind';
import styles from './ThanhPhanKhungDTDetail.module.scss';
import TableCustomAnt from '../../Core/TableCustomAnt';
import { getWheresubject_studyFrameComp } from '../../../services/subject_studyFrameCompService';

const cx = classNames.bind(styles);

const ThanhPhanKhungDTDetail = memo(function ThanhPhanKhungDTDetail({
    title,
    showModal,
    setShowModal,
}) {
    const [listSubject, setListSubject] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false



    // Hàm để đóng modal và cập nhật trạng thái showModalAdd thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };

    useEffect(() => {
        // fetch danh sách các môn học thuộc khối kiến thức
        const fetchSubjectOfFC = async () => {
            try {
                const response = await getWheresubject_studyFrameComp({
                    studyFrameComponent: showModal.frameComponentId,
                })

                if (response.status === 200) {
                    const subjects = response.data.data.map((item, index) => {
                        return {
                            key: `detail-${item.subject.subjectId}`, // Ensure this is unique
                            subjectId: item.subject.subjectId,
                            subjectName: item.subject.subjectName,
                            creditHourSubject: item.subject.creditHour,
                            subjectBeforeId: item.subject.subjectBefore?.subjectId,
                        };
                    });
                    setListSubject(subjects);
                }
                else {
                    setListSubject([])
                }
            } catch (error) {
                console.error('ThanhPhanKhungDTDetail - fetchSubjectOfFC - error:', error);

            }
            finally {
                setIsLoading(false);
            }
        }
        if (showModal) {
            fetchSubjectOfFC();
        }
    }, [showModal]);


    const columns = [
        {
            dataIndex: 'subjectId',
            title: 'Mã HP',
            width: "70px",
            align: 'center'
        },
        {
            dataIndex: 'subjectName',
            title: 'Tên học phần',
        },
        {
            dataIndex: 'creditHourSubject',
            title: 'Số tín chỉ',
            width: "80px",
            align: 'center'
        },
        {
            dataIndex: 'subjectBeforeId',
            title: 'Mã HP trước',
            width: "100px",
            align: 'center'
        },
    ];


    return (
        <Detail
            title={title}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            className={cx('wrapper-modal-detail')}
        >
            <div className={cx('container-detail')}>
                <div>
                    <FormItem label={'Mã khối kiến thức'} className={cx("form-item")}>
                        <p>{showModal.frameComponentId}</p>
                    </FormItem>
                    <FormItem label={'Tên khối kiến thức'}>
                        <p>{showModal.frameComponentName}</p>
                    </FormItem>
                    <FormItem label={'Mô tả'}>
                        <p>{showModal.description}</p>
                    </FormItem>
                    <FormItem label={'Chuyên ngành'}>
                        <p>{showModal.major ? showModal.major.majorName : ''}</p>
                    </FormItem>
                    <FormItem label={'Số tín chỉ'}>
                        <p>{showModal.creditHour}</p>
                    </FormItem>
                </div>
                <div>
                    <TableCustomAnt
                        height={'400px'}
                        columns={columns}
                        data={listSubject}
                        loading={isLoading}
                        size={"small"}
                        keyIdChange={"subjectId"}
                        isHaveRowSelection={false}
                        width='500px'
                    />
                </div>
            </div>
        </Detail>
    );
});

export default ThanhPhanKhungDTDetail;
