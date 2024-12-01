import config from ".";
import { getUserById } from "../services/userService";

const notifications = {
    getNCKHNotification: async (operation, data, fromUser, listUserReceived = [], content) => {
        const messages = {
            // Gửi thông báo tạo cho giảng viên hướng dẫn
            create: `Đề tài NCKH ${data.scientificResearchId} đã được giảng viên ${fromUser.fullname} tạo`,
            // Gửi thông báo đăng ký của sinh viên cho giảng viên
            registerForInstructor: `Sinh viên ${fromUser.fullname} đăng ký tham gia đề tài NCKH ${data.scientificResearchId}`,
            // Gửi thông báo sinh viên đăng ký cho thành viên cùng nhóm
            registerWithMembers: `Sinh viên ${fromUser.fullname} đăng ký tham gia đề tài NCKH ${data.scientificResearchId}, với sự tham gia của bạn`,
            // Gửi thông báo duyệt cho sinh viên được duyệt
            approveForStudent: `Bạn được duyệt tham gia đề tài NCKH ${data.scientificResearchId}`,
            // Gửi thông báo duyệt cho giảng viên hướng dẫn nếu ngành duyệt
            approveForInstructor: (studentName) => `Giảng viên ${fromUser.fullname} đã duyệt đăng ký của sinh viên ${studentName} tham gia đề tài NCKH ${data.scientificResearchId}`,
            // Gửi thông báo add người theo dõi
            follow: `Bạn được thêm theo dõi đề tài NCKH ${data.scientificResearchId}`,
            // Gửi thông báo ghi chú cho người theo dõi
            note: `${fromUser.fullname} vừa ghi chú đề tài NCKH ${data.scientificResearchId}`
        };

        let notifications = [];

        switch (operation) {
            case 'create':
                if (data.instructor && data.instructor.userId !== fromUser) {
                    notifications.push({
                        title: messages.create,
                        type: 'info',
                        url: `${config.routes.DeTaiNCKH_Department}?SRGId=${data.scientificResearchGroup.scientificResearchGroupId}`,
                        toUsers: [data.instructor.userId],
                        createUser: fromUser,
                    });
                }
                break;
            case 'register':
                // Thông báo cho GV hướng dẫn
                notifications.push({
                    title: messages.registerForInstructor,
                    type: 'warning',
                    url: `${config.routes.DeTaiNCKH_Department}?SRGId=${data.scientificResearchGroup.scientificResearchGroupId}`,
                    toUsers: [data.instructor.userId],
                    createUser: fromUser,
                });

                // Thông báo cho thành viên tham gia
                if (listUserReceived.length > 0) {
                    const notificationsToAdd = await Promise.all(
                        listUserReceived.map(async (member) => {
                            try {
                                // Lấy thông tin người dùng từ member.userId
                                const toUsers = await getUserById(member.userId);

                                // Kiểm tra nếu không tìm thấy người dùng
                                if (!toUsers) {
                                    console.error(`Không tìm thấy người dùng với userId: ${member.userId}`);
                                    return null;  // Nếu không tìm thấy, trả về null để không tạo thông báo
                                }

                                // Tạo thông báo cho thành viên
                                return {
                                    title: messages.registerWithMembers,
                                    type: 'warning',
                                    url: `${config.routes.DeTaiNCKH}?SRGId=${data.scientificResearchGroup.scientificResearchGroupId}&tabIndex=2`,
                                    toUsers: toUsers.data,  // Dữ liệu người nhận thông báo
                                    createUser: fromUser,  // Người tạo thông báo
                                };
                            } catch (error) {
                                console.error(`Không thể lấy thông tin người dùng với userId: ${member.userId}`, error);
                                return null;  // Nếu có lỗi khi lấy thông tin, trả về null
                            }
                        })
                    );

                    // Lọc bỏ các giá trị null (nếu có lỗi trong việc lấy thông tin người dùng)
                    const validNotifications = notificationsToAdd.filter(notification => notification !== null);

                    // Thêm tất cả thông báo hợp lệ vào danh sách notifications
                    notifications.push(...validNotifications);
                }
                break;

            case 'approve':
                // Thông báo cho sinh viên được duyệt
                // Lọc bỏ người gửi ra khỏi danh sách người nhận
                const filteredListApprove = listUserReceived.filter((member) => member.userId !== fromUser.userId);

                // Thông báo cho sinh viên được duyệt
                if (filteredListApprove.length > 0) {
                    try {
                        // Lấy thông tin người dùng từ các member.userId
                        const toUsers = filteredListApprove.map((member) => member.userId);

                        // Kiểm tra nếu có người dùng hợp lệ để gửi thông báo
                        if (toUsers.length > 0) {
                            // Tạo thông báo chung cho tất cả người dùng
                            const notification = {
                                title: messages.approveForStudent,
                                type: 'success',
                                url: `${config.routes.DeTaiNCKHThamGia}?scientificResearch=${data.scientificResearchId}`,
                                toUsers: toUsers,  // Dữ liệu người nhận thông báo
                                createUser: fromUser,  // Người tạo thông báo
                            };

                            // Thêm thông báo vào danh sách thông báo
                            notifications.push(notification);
                        }
                    } catch (error) {
                        console.error('Lỗi khi tạo thông báo cho nhiều người dùng', error);
                    }
                }

                // Thêm thông báo cho instructor
                if (data.instructor && data.instructor.userId !== fromUser.userId) {
                    notifications.push({
                        title: messages.approveForInstructor(data.userId),
                        type: 'success',
                        url: `${config.routes.DeTaiNCKHThamGia}?scientificResearch=${data.scientificResearchId}`,
                        toUsers: [data.instructor.userId],
                        createUser: fromUser,
                    });
                }
                break;
            case 'follow':
                notifications.push({
                    title: messages.follow,
                    type: 'info',
                    url: `${config.routes.DeTaiNCKHThamGia}?scientificResearch=${data.scientificResearchId}`,
                    toUsers: data.toUsers,
                    createUser: fromUser,
                });
                break;

            case 'note':
                // Lọc bỏ người gửi ra khỏi danh sách người nhận
                const filteredList = listUserReceived.filter((member) => member.userId !== fromUser.userId);

                // Thông báo cho sinh viên được duyệt
                if (filteredList.length > 0) {
                    try {
                        // Lấy thông tin người dùng từ các member.userId
                        const toUsers = filteredList.map((member) => member.userId);

                        // Kiểm tra nếu có người dùng hợp lệ để gửi thông báo
                        if (toUsers.length > 0) {
                            // Tạo thông báo chung cho tất cả người dùng
                            const notification = {
                                title: messages.note,
                                content: content,
                                type: 'warning',
                                url: `${config.routes.DeTaiNCKHThamGia}?scientificResearch=${data.scientificResearchId}&tabIndex=2`,
                                toUsers: toUsers,  // Dữ liệu người nhận thông báo
                                createUser: fromUser,  // Người tạo thông báo
                            };

                            // Thêm thông báo vào danh sách thông báo
                            notifications.push(notification);
                        }
                    } catch (error) {
                        console.error('Lỗi khi tạo thông báo cho nhiều người dùng', error);
                    }
                }
                break;


            default:
                break;
        }

        return notifications;
    },

    getKhoaLuanNotification: async (operation, data, fromUser, listUserReceived = [], content) => {
        const messages = {
            // Gửi thông báo tạo cho giảng viên hướng dẫn
            create: `Đề tài khóa luận ${data.thesisId} đã được giảng viên ${fromUser.fullname} tạo`,
            // Gửi thông báo đăng ký của sinh viên cho giảng viên
            registerForInstructor: `Sinh viên ${fromUser.fullname} đăng ký tham gia đề tài khóa luận ${data.thesisId}`,
            // Gửi thông báo sinh viên đăng ký cho thành viên cùng nhóm
            registerWithMembers: `Sinh viên ${fromUser.fullname} đăng ký tham gia đề tài khóa luận ${data.thesisId}, với sự tham gia của bạn`,
            // Gửi thông báo duyệt cho sinh viên được duyệt
            approveForStudent: `Bạn được duyệt tham gia đề tài khóa luận ${data.thesisId}`,
            // Gửi thông báo duyệt cho giảng viên hướng dẫn nếu ngành duyệt
            approveForInstructor: (studentName) => `Giảng viên ${fromUser.fullname} đã duyệt đăng ký của sinh viên ${studentName} tham gia đề tài khóa luận ${data.thesisId}`,
            // Gửi thông báo add người theo dõi
            follow: `Bạn được thêm theo dõi đề tài khóa luận ${data.thesisId}`,
            // Gửi thông báo ghi chú cho người theo dõi
            note: `${fromUser.fullname} vừa ghi chú đề tài khóa luận ${data.thesisId}`
        };

        let notifications = [];

        switch (operation) {
            case 'create':
                if (data.instructor && data.instructor.userId !== fromUser) {
                    notifications.push({
                        title: messages.create,
                        type: 'info',
                        url: `${config.routes.DeTaiKhoaLuan_Department}?ThesiGroupId=${data.thesisGroup.thesisGroupId}`,
                        toUsers: [data.instructor.userId],
                        createUser: fromUser,
                    });
                }
                break;
            case 'register':
                // Thông báo cho GV hướng dẫn
                notifications.push({
                    title: messages.registerForInstructor,
                    type: 'warning',
                    url: `${config.routes.DeTaiKhoaLuan_Department}?ThesiGroupId=${data.thesisGroup.thesisGroupId}`,
                    toUsers: [data.instructor.userId],
                    createUser: fromUser,
                });

                // Thông báo cho thành viên tham gia
                if (listUserReceived.length > 0) {
                    try {
                        // Lấy thông tin người dùng từ tất cả các member.userId
                        const toUsers = listUserReceived.map((member) => member.userId);

                        // Kiểm tra nếu có người dùng hợp lệ
                        if (toUsers.length > 0) {
                            // Tạo thông báo chung cho tất cả người dùng
                            const notification = {
                                title: messages.registerWithMembers,
                                type: 'warning',
                                url: `${config.routes.DeTaiKhoaLuan}?ThesiGroupId=${data.thesisGroup.thesisGroupId}&tabIndex=2`,
                                toUsers: toUsers,  // Dữ liệu người nhận thông báo
                                createUser: fromUser,  // Người tạo thông báo
                            };

                            // Thêm thông báo vào danh sách notifications
                            notifications.push(notification);
                        }
                    } catch (error) {
                        console.error('Lỗi khi tạo thông báo cho nhiều người dùng', error);
                    }
                }


                break;

            case 'approve':
                // Thông báo cho người theo dõi
                // Thông báo cho các thành viên tham gia
                if (listUserReceived.length > 0) {
                    try {
                        // Lấy thông tin người dùng từ tất cả các member.userId
                        const toUsers = listUserReceived.map((member) => member.userId);

                        // Kiểm tra nếu có người dùng hợp lệ
                        if (toUsers.length > 0) {
                            // Tạo thông báo chung cho tất cả người dùng
                            const notification = {
                                title: messages.approveForStudent,
                                type: 'success',
                                url: `${config.routes.DeTaiKhoaLuanThamGia}?thesis=${data.thesisId}`,
                                toUsers: toUsers,  // Dữ liệu người nhận thông báo
                                createUser: fromUser,  // Người tạo thông báo
                            };

                            // Thêm thông báo vào danh sách notifications
                            notifications.push(notification);
                        }
                    } catch (error) {
                        console.error('Lỗi khi tạo thông báo cho nhiều người dùng', error);
                    }
                }


                // Thêm thông báo cho instructor
                if (data.instructor && data.instructor.userId !== fromUser.userId) {
                    notifications.push({
                        title: messages.approveForInstructor(data.userId),
                        type: 'success',
                        url: `${config.routes.DeTaiKhoaLuanThamGia}?thesis=${data.thesisId}`,
                        toUsers: [data.instructor.userId],
                        createUser: fromUser,
                    });
                }
                break;
            case 'follow':
                notifications.push({
                    title: messages.follow,
                    type: 'info',
                    url: `${config.routes.DeTaiKhoaLuanThamGia}?thesis=${data.thesisId}`,
                    toUsers: data.toUsers,
                    createUser: fromUser,
                });
                break;

            case 'note':
                // Lọc bỏ người gửi ra khỏi danh sách người nhận
                const filteredList = listUserReceived.filter((member) => member.userId !== fromUser.userId);

                // Thông báo cho người theo dõi
                if (filteredList.length > 0) {
                    try {
                        // Lấy thông tin người dùng từ tất cả các member.userId
                        const toUsers = filteredList.map((member) => member.userId);

                        // Kiểm tra nếu có người dùng hợp lệ
                        if (toUsers.length > 0) {
                            // Tạo một thông báo chung cho tất cả người dùng
                            const notification = {
                                title: messages.note,
                                content: content, // Nội dung thông báo
                                type: 'warning',  // Loại thông báo
                                url: `${config.routes.DeTaiKhoaLuanThamGia}?thesis=${data.thesisId}&tabIndex=2`,
                                toUsers: toUsers, // Người nhận thông báo
                                createUser: fromUser, // Người tạo thông báo
                            };

                            // Thêm thông báo vào danh sách notifications
                            notifications.push(notification);
                        }
                    } catch (error) {
                        console.error('Lỗi khi tạo thông báo cho nhiều người dùng', error);
                    }
                }

                break;

            default:
                break;
        }

        return notifications;

    },
};
export default notifications;