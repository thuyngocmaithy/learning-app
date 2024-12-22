import { Result } from "antd";
import classNames from "classnames/bind";
import styles from "./ResultCustomAnt.module.scss"

const cx = classNames.bind(styles)

function ResultCustomAnt({ tile = "Không có quyền truy cập" }) {
    return <div className={cx("wrapper")}>
        <Result
            status="warning"
            title={tile}
            style={{ fontWeight: "600" }}
        // extra={
        //     <Button type="primary" key="console">
        //         Go Console
        //     </Button>
        // }
        />
    </div>
}

export default ResultCustomAnt;