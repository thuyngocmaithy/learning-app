import config from ".";

const notifications = {
    getNCKHNotification: async (operation, data, fromUser, listUserReceived = [], content) => {
        const messages = {
            create: `Đề tài NCKH ${data.scientificResearchId} đã được giảng viên ${fromUser?.fullname} tạo`,
            registerForInstructor: `Sinh viên ${fromUser?.fullname} đăng ký tham gia đề tài NCKH ${data.scientificResearchId}`,
            registerWithMembers: `Sinh viên ${fromUser?.fullname} đăng ký tham gia đề tài NCKH ${data.scientificResearchId}, với sự tham gia của bạn`,
            approveForStudent: `Bạn được duyệt tham gia đề tài NCKH ${data.scientificResearchId}`,
            approveForInstructor: (studentName) => `Giảng viên ${fromUser?.fullname} đã duyệt đăng ký của sinh viên ${studentName} tham gia đề tài NCKH ${data.scientificResearchId}`,
            follow: `Bạn được thêm theo dõi đề tài NCKH ${data.scientificResearchId}`,
            note: `${fromUser?.fullname} vừa ghi chú đề tài NCKH ${data.scientificResearchId}`
        };

        const notifications = [];
        const addNotification = (title, type, url, toUsers, content = null) => {
            if (toUsers.length > 0) {
                notifications.push({
                    title,
                    type,
                    url,
                    toUsers,
                    createUser: fromUser?.userId,
                    ...(content && { content })
                });
            }
        };

        const filteredUsers = listUserReceived.filter((member) => member.userId !== fromUser?.userId);
        const getUrl = (base, tabIndex = null) =>
            `${base}?scientificResearch=${data.scientificResearchId}${tabIndex ? `&tabIndex=${tabIndex}` : ''}`;

        switch (operation) {
            case 'create':
                if (data.instructor?.userId !== fromUser?.userId) {
                    addNotification(
                        messages.create,
                        'info',
                        `${config.routes.DeTaiNCKH_Department}?SRGId=${data.scientificResearchGroup.scientificResearchGroupId}`,
                        [data.instructor.userId]
                    );
                }
                break;

            case 'register':
                addNotification(
                    messages.registerForInstructor,
                    'warning',
                    `${config.routes.DeTaiNCKH_Department}}`,
                    [data.instructor.userId]
                );

                const memberNotifications = listUserReceived.map((member) => (
                    addNotification(
                        messages.registerWithMembers,
                        'warning',
                        getUrl(config.routes.DeTaiNCKH, 2),
                        [member.userId]
                    )
                ));


                notifications.push(...memberNotifications.filter(Boolean));
                break;

            case 'approve':
                addNotification(
                    messages.approveForStudent,
                    'success',
                    getUrl(config.routes.DeTaiNCKHThamGia),
                    filteredUsers.map((member) => member?.userId)
                );

                if (data.instructor?.userId !== fromUser?.userId) {
                    addNotification(
                        messages.approveForInstructor(data.instructor?.userId),
                        'success',
                        getUrl(config.routes.DeTaiNCKHThamGia),
                        [data.instructor.userId]
                    );
                }
                break;

            case 'follow':
                addNotification(
                    messages.follow,
                    'info',
                    getUrl(config.routes.DeTaiNCKHThamGia),
                    data.toUsers.map((item) => item.userId)
                );
                break;

            case 'note':
                addNotification(
                    messages.note,
                    'warning',
                    getUrl(config.routes.DeTaiNCKHThamGia, 2),
                    filteredUsers.map((member) => member.userId),
                    content
                );
                break;

            default:
                break;
        }

        return notifications;
    },

    getNhomNCKHNotification: async (operation, data, fromUser, listUserReceived = []) => {
        const messages = {
            create: `Nhóm đề tài NCKH ${data.scientificResearchGroupId} được giảng viên ${fromUser?.fullname} khởi tạo`,
        };

        const notifications = [];
        const addNotification = (title, type, url, toUsers, content = null) => {
            if (toUsers.length > 0) {
                notifications.push({
                    title,
                    type,
                    url,
                    toUsers,
                    createUser: fromUser?.userId,
                    ...(content && { content })
                });
            }
        };

        const filteredUsers = listUserReceived.filter((member) => member.userId !== fromUser?.userId);

        switch (operation) {
            case 'create':
                addNotification(
                    messages.create,
                    'info',
                    `${config.routes.NhomDeTaiNCKH_Department}`,
                    filteredUsers.map((member) => member.userId)
                );
                break;

            default:
                break;
        }

        return notifications;
    },


    getKhoaLuanNotification: async (operation, data, fromUser, listUserReceived = [], content) => {
        const messages = {
            create: `Đề tài khóa luận ${data.thesisId} đã được giảng viên ${fromUser?.fullname} tạo`,
            registerForInstructor: `Sinh viên ${fromUser?.fullname} đăng ký tham gia đề tài khóa luận ${data.thesisId}`,
            registerWithMembers: `Sinh viên ${fromUser?.fullname} đăng ký tham gia đề tài khóa luận ${data.thesisId}, với sự tham gia của bạn`,
            approveForStudent: `Bạn được duyệt tham gia đề tài khóa luận ${data.thesisId}`,
            approveForInstructor: (studentName) => `Giảng viên ${fromUser?.fullname} đã duyệt đăng ký của sinh viên ${studentName} tham gia đề tài khóa luận ${data.thesisId}`,
            follow: `Bạn được thêm theo dõi đề tài khóa luận ${data.thesisId}`,
            note: `${fromUser?.fullname} vừa ghi chú đề tài khóa luận ${data.thesisId}`
        };

        const notifications = [];

        const addNotification = (title, type, url, toUsers, content = null) => {
            if (toUsers.length > 0) {
                notifications.push({
                    title,
                    type,
                    url,
                    toUsers,
                    createUser: fromUser?.userId,
                    ...(content && { content })
                });
            }
        };

        const filteredUsers = listUserReceived.filter((member) => member.userId !== fromUser?.userId);
        const getUrl = (base, tabIndex = null) =>
            `${base}?thesis=${data.thesisId}${tabIndex ? `&tabIndex=${tabIndex}` : ''}`;

        switch (operation) {
            case 'create':
                if (data.instructor?.userId !== fromUser?.userId) {
                    addNotification(
                        messages.create,
                        'info',
                        `${config.routes.DeTaiKhoaLuan_Department}?ThesisGroupId=${data.thesisGroup.thesisGroupId}`,
                        [data.instructor.userId]
                    );
                }
                break;

            case 'register':
                addNotification(
                    messages.registerForInstructor,
                    'warning',
                    `${config.routes.DeTaiKhoaLuan_Department}?ThesisGroupId=${data.thesisGroup.thesisGroupId}`,
                    [data.instructor.userId]
                );

                listUserReceived.forEach((member) => {
                    addNotification(
                        messages.registerWithMembers,
                        'warning',
                        getUrl(config.routes.DeTaiKhoaLuan, 2),
                        [member.userId]
                    );
                });
                break;

            case 'approve':
                addNotification(
                    messages.approveForStudent,
                    'success',
                    getUrl(config.routes.DeTaiKhoaLuanThamGia),
                    filteredUsers.map((member) => member?.userId)
                );

                if (data.instructor?.userId !== fromUser?.userId) {
                    addNotification(
                        messages.approveForInstructor(data.instructor?.userId),
                        'success',
                        getUrl(config.routes.DeTaiKhoaLuanThamGia),
                        [data.instructor?.userId]
                    );
                }
                break;

            case 'follow':
                addNotification(
                    messages.follow,
                    'info',
                    getUrl(config.routes.DeTaiKhoaLuanThamGia),
                    data.toUsers.map((item) => item.userId)
                );
                break;

            case 'note':
                addNotification(
                    messages.note,
                    'warning',
                    getUrl(config.routes.DeTaiKhoaLuanThamGia, 2),
                    filteredUsers.map((member) => member.userId),
                    content
                );
                break;

            default:
                break;
        }

        return notifications;
    },

    getNhomKhoaLuanNotification: async (operation, data, fromUser, listUserReceived = []) => {
        const messages = {
            create: `Nhóm đề tài khóa luận ${data.thesisGroupId} được giảng viên ${fromUser?.fullname} khởi tạo`,
        };

        const notifications = [];
        const addNotification = (title, type, url, toUsers, content = null) => {
            if (toUsers.length > 0) {
                notifications.push({
                    title,
                    type,
                    url,
                    toUsers,
                    createUser: fromUser?.userId,
                    ...(content && { content })
                });
            }
        };

        const filteredUsers = listUserReceived.filter((member) => member.userId !== fromUser?.userId);

        switch (operation) {
            case 'create':
                addNotification(
                    messages.create,
                    'info',
                    `${config.routes.NhomDeTaiKhoaLuan_Department}`,
                    filteredUsers.map((member) => member.userId)
                );
                break;

            default:
                break;
        }

        return notifications;
    },
};
export default notifications;