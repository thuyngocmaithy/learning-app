import config from '../config';

// Pages
import Dashboard from '../pages/Student/Dashboard';
import DanhSachHocPhan from '../pages/Student/DanhSachHocPhan';
import TienDoHocTap from '../pages/Student/TienDoHocTap';
import DuAnNghienCuu from '../pages/Student/DuAnNghienCuu';
import TienDoHocPhan from '../pages/Student/TienDoHocPhan';
import DiemTotNghiep from '../pages/Student/DiemTotNghiep';
import DuAnThamGia from '../pages/Student/DuAnThamGia';
import KhoaLuan from '../pages/Student/KhoaLuan';
import ThucTap from '../pages/Student/ThucTap';
import ThongTinThucTap from '../pages/Student/ThongTinThucTap';
import ChuanDauRa from '../pages/Student/ChuanDauRa';
import MoHocPhan from '../pages/Department/MoHocPhan';
import { DepartmentLayout } from '../layouts';
import LoginForm from '../pages/Shared/Login';

//Không đăng nhập vẫn vào được
const publicRoutes = [
    // SHARED
    { path: config.routes.Login, component: LoginForm, layout: null },
    // STUDENT
    { path: config.routes.Login , component : LoginForm , layout : null} ,
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
    { path: config.routes.ChuanDauRa, component: ChuanDauRa },

    // DEPARTMENT
    { path: config.routes.MoHocPhan, component: MoHocPhan, layout: DepartmentLayout },
];

//Không đăng nhập => chuyển login
const privateRoutes = [];

export { publicRoutes, privateRoutes };
