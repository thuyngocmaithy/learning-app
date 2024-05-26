import classNames from 'classnames/bind';
import styles from './Follower.module.scss';
import { Avatar, List } from 'antd';

const cx = classNames.bind(styles);

function Follower({ data }) {
    return (
        <div className={cx('container-follower')}>
            <List
                itemLayout="horizontal"
                dataSource={data}
                renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                            title={item.title}
                        />
                    </List.Item>
                )}
            />
        </div>
    );
}

export default Follower;
