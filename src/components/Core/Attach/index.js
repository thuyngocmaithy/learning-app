import TableCustomAnt from '../../Core/TableCustomAnt';

function Attach({ columns, data }) {
    return (
        <div>
            <TableCustomAnt
                columns={columns}
                data={data}
            />
        </div>
    );
}

export default Attach;
