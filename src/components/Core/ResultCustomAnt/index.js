import { Result } from "antd";
import classNames from "classnames/bind";
import styles from "./ResultCustomAnt.module.scss"

const cx = classNames.bind(styles)

function ResultCustomAnt() {
    return <div className={cx("wrapper")}>
        <Result
            status="warning"
            title="Không có quyền truy cập"
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