import TableCustomAnt from '../../Core/TableCustomAnt';

function Attach({ columns, data, selectedRowKeys, setSelectedRowKeys }) {
    return (
        <div>
            <TableCustomAnt
                columns={columns}
                data={data}
                selectedRowKeys={selectedRowKeys}
                setSelectedRowKeys={setSelectedRowKeys}
                keyIdChange={"filename"}
            />
        </div>
    );
}

export default Attach;
