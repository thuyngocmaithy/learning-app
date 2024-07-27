import { Table } from 'antd';

function Attach({ columns, data }) {
    return (
        <div>
            <Table
                columns={columns}
                dataSource={data}
                showSorterTooltip={{
                    target: 'sorter-icon',
                }}
            />
        </div>
    );
}

export default Attach;
