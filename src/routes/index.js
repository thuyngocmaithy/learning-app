import config from '../config';

// Pages
import Dashboard from '../pages/Dashboard';
import DanhSachHocPhan from '../pages/DanhSachHocPhan';
import TienDoHocTap from '../pages/TienDoHocTap';
import DuAnNghienCuu from '../pages/DuAnNghienCuu';
import TienDoHocPhan from '../pages/TienDoHocPhan';
import DiemTotNghiep from '../pages/DiemTotNghiep';
import DuAnThamGia from '../pages/DuAnThamGia';
import KhoaLuan from '../pages/KhoaLuan';
import ThucTap from '../pages/ThucTap';
import ThongTinThucTap from '../pages/ThongTinThucTap';

//Không đăng nhập vẫn vào được
const publicRoutes = [
    { path: config.routes.Dashboard, component: Dashboard },
    { path: config.routes.DanhSachHocPhan, component: DanhSachHocPhan },
    { path: config.routes.TienDoHocTap, component: TienDoHocTap },
    { path: config.routes.DiemTotNghiep, component: DiemTotNghiep },
    { path: config.routes.TienDoHocPhan, component: TienDoHocPhan },
    { path: config.routes.DuAnNghienCuu, component: DuAnNghienCuu },
    { path: config.routes.DuAnThamGia, component: DuAnThamGia },
    { path: config.routes.KhoaLuanThamGia, component: DuAnThamGia, thesis: true },
    { path: config.routes.KhoaLuan, component: KhoaLuan },
    { path: config.routes.ThucTap, component: ThucTap },
    { path: config.routes.ThongTinThucTap, component: ThongTinThucTap, layout: null },
];

//Không đăng nhập => chuyển login
const privateRoutes = [];

export { publicRoutes, privateRoutes };
