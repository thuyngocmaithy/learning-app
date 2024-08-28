// Tạo một context từ @ant-design/icons
const requireIcon = require.context('@ant-design/icons', false, /\.js$/);

const listIcon = {};

requireIcon.keys().forEach((key) => {
    const iconName = key.replace('./', '').replace('.js', '');
    listIcon[iconName] = requireIcon(key).default;
});

export default listIcon;
