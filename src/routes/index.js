import config from '../config';

// Pages
import Dashboard from '../pages/Student/Dashboard';
import DanhSachHocPhan from '../pages/Student/DanhSachHocPhan';
import NghienCuuKhoaHoc from '../pages/Student/NghienCuuKhoaHoc';
import TienDoHocPhan from '../pages/Student/TienDoHocPhan';
import DiemTotNghiep from '../pages/Student/DiemTotNghiep';
import DeTaiNCKHThamGia from '../pages/Student/DeTaiNCKHThamGia';
import KhoaLuan from '../pages/Student/KhoaLuan';
import ThucTap from '../pages/Student/ThucTap';
import ThongTinThucTap from '../pages/Student/ThongTinThucTap';
import ChuanDauRa from '../pages/Student/ChuanDauRa';
import MoHocPhan from '../pages/Department/NghiepVu/MoHocPhan';

// DEPARTMENT
import Dashboard_Department from '../pages/Department/NghiepVu/Dashboard';
import KhungCTDT from '../pages/Department/ThietLap/KhungCTDT';
import KhoaLuan_Department from '../pages/Department/NghiepVu/KhoaLuan';
import NhomDeTaiNCKH from '../pages/Department/NghiepVu/NhomDeTaiNCKH';

// THIẾT LẬP
import PhanQuyenChucNang_Department from '../pages/Department/ThietLap/PhanQuyenChucNang';
import TaiKhoan_Department from '../pages/Department/ThietLap/TaiKhoan';

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
    { path: config.routes.NghienCuuKhoaHoc, component: NghienCuuKhoaHoc },
    { path: config.routes.DeTaiNCKHThamGia, component: DeTaiNCKHThamGia, urlDepend: "NghienCuuKhoaHoc" },
    { path: config.routes.KhoaLuanThamGia, component: DeTaiNCKHThamGia, thesis: true, urlDepend: "KhoaLuan" },
    { path: config.routes.KhoaLuan, component: KhoaLuan },
    { path: config.routes.ThucTap, component: ThucTap },
    { path: config.routes.ThongTinThucTap, component: ThongTinThucTap, layout: null, urlDepend: "ThucTap" },
    { path: config.routes.ChuanDauRa, component: ChuanDauRa },

    // NGHIỆP VỤ
    { path: config.routes.Dashboard_Department, component: Dashboard_Department, layout: DepartmentLayout },
    { path: config.routes.MoHocPhan, component: MoHocPhan, layout: DepartmentLayout },
    { path: config.routes.DeTaiNCKHThamGia_Department, component: DeTaiNCKHThamGia, layout: DepartmentLayout, urlDepend: "NhomDeTaiNCKH" },
    { path: config.routes.KhoaLuanThamGia_Department, component: DeTaiNCKHThamGia, thesis: true, layout: DepartmentLayout },
    { path: config.routes.KhoaLuan_Department, component: KhoaLuan_Department, layout: DepartmentLayout },
    { path: config.routes.NhomDeTaiNCKH, component: NhomDeTaiNCKH, layout: DepartmentLayout },

    // THIẾT LẬP
    { path: config.routes.KhungCTDT, component: KhungCTDT, layout: DepartmentLayout },
    { path: config.routes.PhanQuyenChucNang, component: PhanQuyenChucNang_Department, layout: DepartmentLayout },
    { path: config.routes.TaiKhoan, component: TaiKhoan_Department, layout: DepartmentLayout },
];

//Không đăng nhập vẫn vào được
const publicRoutes = [
    // SHARED
    { path: config.routes.Login, component: LoginForm, layout: null },
];

export { publicRoutes, privateRoutes };
