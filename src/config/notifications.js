import config from ".";
import { getUserById } from "../services/userService";

const notifications = {
    getNCKHNotification: async (operation, data, fromUser, listUserReceived = []) => {
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
                        toUser: data.instructor,
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
                    toUser: data.instructor,
                    createUser: fromUser,
                });

                // Thông báo cho thành viên tham gia
                if (listUserReceived.length > 0) {
                    const notificationsToAdd = await Promise.all(
                        listUserReceived.map(async (member) => {
                            const toUser = await getUserById(member.userId);
                            return {
                                title: messages.registerWithMembers,
                                type: 'warning',
                                url: `${config.routes.DeTaiNCKH}?SRGId=${data.scientificResearchGroup.scientificResearchGroupId}&tabIndex=2`,
                                toUser: toUser.data,
                                createUser: fromUser,
                            };
                        })
                    );
                    // Thêm tất cả thông báo vào danh sách notifications
                    notifications.push(...notificationsToAdd);
                }

                break;

            case 'approve':
                // Thông báo cho sinh viên được duyệt
                if (listUserReceived.length > 0) {
                    const notificationsToAdd = await Promise.all(
                        listUserReceived.map(async (member) => {
                            const toUser = await getUserById(member.userId);
                            return {
                                title: messages.approveForStudent,
                                type: 'success',
                                url: `${config.routes.DeTaiNCKHThamGia}?scientificResearch=${data.scientificResearchId}`,
                                toUser: toUser.data,
                                createUser: fromUser,
                            };
                        })
                    );

                    // Thêm tất cả thông báo vào danh sách notifications
                    notifications.push(...notificationsToAdd);
                }

                // Thêm thông báo cho instructor
                if (data.instructor && data.instructor.userId !== fromUser.userId) {
                    notifications.push({
                        title: messages.approveForInstructor(data.userId),
                        type: 'success',
                        url: `${config.routes.DeTaiNCKHThamGia}?scientificResearch=${data.scientificResearchId}`,
                        toUser: data.instructor,
                        createUser: fromUser,
                    });
                }
                break;
            case 'follow':
                notifications.push({
                    title: messages.follow,
                    type: 'info',
                    url: `${config.routes.DeTaiNCKHThamGia}?scientificResearch=${data.scientificResearchId}`,
                    toUser: data.toUser,
                    createUser: fromUser,
                });
                break;

            case 'note':
                // Lọc bỏ người gửi ra khỏi danh sách người nhận
                const filteredList = listUserReceived.filter((member) => member.userId !== fromUser.userId);
                // Thông báo cho sinh viên được duyệt
                if (filteredList.length > 0) {
                    const notificationsToAdd = await Promise.all(
                        filteredList.map(async (member) => {
                            const toUser = await getUserById(member.userId);
                            return {
                                title: messages.note,
                                type: 'warning',
                                url: `${config.routes.DeTaiNCKHThamGia}?scientificResearch=${data.scientificResearchId}&tabIndex=2`,
                                toUser: toUser.data,
                                createUser: fromUser,
                            };
                        })
                    );

                    // Thêm tất cả thông báo vào danh sách notifications
                    notifications.push(...notificationsToAdd);
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
                        toUser: data.instructor,
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
                    toUser: data.instructor,
                    createUser: fromUser,
                });

                // Thông báo cho thành viên tham gia
                if (listUserReceived.length > 0) {
                    const notificationsToAdd = await Promise.all(
                        listUserReceived.map(async (member) => {
                            const toUser = await getUserById(member.userId);
                            return {
                                title: messages.registerWithMembers,
                                type: 'warning',
                                url: `${config.routes.DeTaiKhoaLuan}?ThesiGroupId=${data.thesisGroup.thesisGroupId}&tabIndex=2`,
                                toUser: toUser.data,
                                createUser: fromUser,
                            };
                        })
                    );
                    // Thêm tất cả thông báo vào danh sách notifications
                    notifications.push(...notificationsToAdd);
                }

                break;

            case 'approve':
                // Thông báo cho người theo dõi
                if (listUserReceived.length > 0) {
                    const notificationsToAdd = await Promise.all(
                        listUserReceived.map(async (member) => {
                            const toUser = await getUserById(member.userId);
                            return {
                                title: messages.approveForStudent,
                                type: 'success',
                                url: `${config.routes.DeTaiKhoaLuanThamGia}?thesis=${data.thesisId}`,
                                toUser: toUser.data,
                                createUser: fromUser,
                            };
                        })
                    );

                    // Thêm tất cả thông báo vào danh sách notifications
                    notifications.push(...notificationsToAdd);
                }

                // Thêm thông báo cho instructor
                if (data.instructor && data.instructor.userId !== fromUser.userId) {
                    notifications.push({
                        title: messages.approveForInstructor(data.userId),
                        type: 'success',
                        url: `${config.routes.DeTaiKhoaLuanThamGia}?thesis=${data.thesisId}`,
                        toUser: data.instructor,
                        createUser: fromUser,
                    });
                }
                break;
            case 'follow':
                notifications.push({
                    title: messages.follow,
                    type: 'info',
                    url: `${config.routes.DeTaiKhoaLuanThamGia}?thesis=${data.thesisId}`,
                    toUser: data.toUser,
                    createUser: fromUser,
                });
                break;

            case 'note':
                // Lọc bỏ người gửi ra khỏi danh sách người nhận
                const filteredList = listUserReceived.filter((member) => member.userId !== fromUser.userId);
                // Thông báo cho người theo dõi
                if (filteredList.length > 0) {
                    const notificationsToAdd = await Promise.all(
                        filteredList.map(async (member) => {
                            const toUser = await getUserById(member.userId);
                            return {
                                title: messages.note,
                                content: content,
                                type: 'warning',
                                url: `${config.routes.DeTaiKhoaLuanThamGia}?thesis=${data.thesisId}&tabIndex=2`,
                                toUser: toUser.data,
                                createUser: fromUser,
                            };
                        })
                    );

                    // Thêm tất cả thông báo vào danh sách notifications
                    notifications.push(...notificationsToAdd);
                }
                break;

            default:
                break;
        }

        return notifications;

    },
};
export default notifications;