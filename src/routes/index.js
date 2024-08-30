import config from '../config';

// Pages
import Dashboard from '../pages/Student/Dashboard';
import DanhSachHocPhan from '../pages/Student/DanhSachHocPhan';
import DuAnNghienCuu from '../pages/Student/DuAnNghienCuu';
import TienDoHocPhan from '../pages/Student/TienDoHocPhan';
import DiemTotNghiep from '../pages/Student/DiemTotNghiep';
import DuAnThamGia from '../pages/Student/DuAnThamGia';
import KhoaLuan from '../pages/Student/KhoaLuan';
import ThucTap from '../pages/Student/ThucTap';
import ThongTinThucTap from '../pages/Student/ThongTinThucTap';
import ChuanDauRa from '../pages/Student/ChuanDauRa';
import MoHocPhan from '../pages/Department/NghiepVu/MoHocPhan';

// DEPARTMENT
import Dashboard_Department from '../pages/Department/NghiepVu/Dashboard';
import KhungCTDT from '../pages/Department/ThietLap/KhungCTDT';
import DuAnNghienCuu_Department from '../pages/Department/NghiepVu/DuAnNghienCuu';
import KhoaLuan_Department from '../pages/Department/NghiepVu/KhoaLuan';

// THIẾT LẬP
import PhanQuyenChucNang_Department from '../pages/Department/ThietLap/PhanQuyenChucNang';

// COMMON
import LoginForm from '../pages/Shared/Login';

// LAYOUT
import { DepartmentLayout } from '../layouts';

//Không đăng nhập => chuyển login
const privateRoutes = [
    // STUDENT
    { path: config.routes.Dashboard, component: Dashboard },
    { path: config.routes.DanhSachHocPhan, component: DanhSachHocPhan },
    { path: config.routes.DiemTotNghiep, component: DiemTotNghiep },
    { path: config.routes.TienDoHocPhan, component: TienDoHocPhan },
    { path: config.routes.DuAnNghienCuu, component: DuAnNghienCuu },
    { path: config.routes.DuAnThamGia, component: DuAnThamGia },
    { path: config.routes.KhoaLuanThamGia, component: DuAnThamGia, thesis: true },
    { path: config.routes.KhoaLuan, component: KhoaLuan },
    { path: config.routes.ThucTap, component: ThucTap },
    { path: config.routes.ThongTinThucTap, component: ThongTinThucTap, layout: null, urlDepend: "ThucTap" },
    { path: config.routes.ChuanDauRa, component: ChuanDauRa },

    // DEPARTMENT
    { path: config.routes.Dashboard_Department, component: Dashboard_Department, layout: DepartmentLayout },
    { path: config.routes.MoHocPhan, component: MoHocPhan, layout: DepartmentLayout },
    { path: config.routes.KhungCTDT, component: KhungCTDT, layout: DepartmentLayout },
    { path: config.routes.DuAnNghienCuu_Department, component: DuAnNghienCuu_Department, layout: DepartmentLayout },
    { path: config.routes.DuAnThamGia_Department, component: DuAnThamGia, layout: DepartmentLayout },
    { path: config.routes.KhoaLuanThamGia_Department, component: DuAnThamGia, thesis: true, layout: DepartmentLayout },
    { path: config.routes.KhoaLuan_Department, component: KhoaLuan_Department, layout: DepartmentLayout },

    // THIẾT LẬP
    {
        path: config.routes.PhanQuyenChucNang,
        component: PhanQuyenChucNang_Department,
        layout: DepartmentLayout,
    },
];

//Không đăng nhập vẫn vào được
const publicRoutes = [
    // SHARED
    { path: config.routes.Login, component: LoginForm, layout: null },
];

export { publicRoutes, privateRoutes };
