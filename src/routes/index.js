import config from '../config';

// Pages
import Dashboard from '../pages/Student/Dashboard';
import DanhSachHocPhan from '../pages/Student/DanhSachHocPhan';
import NhomDeTaiNCKH from '../pages/Student/NhomDeTaiNCKH';
import DeTaiNCKH from '../pages/Student/DeTaiNCKH';
import DiemTotNghiep from '../pages/Student/DiemTotNghiep';
import NhomDeTaiKhoaLuan from '../pages/Student/NhomDeTaiKhoaLuan';
import DeTaiKhoaLuan from '../pages/Student/DeTaiKhoaLuan';

// DEPARTMENT
import Dashboard_Department from '../pages/Department/NghiepVu/Dashboard';
import NhomDeTaiKhoaLuan_Department from '../pages/Department/NghiepVu/NhomDeTaiKhoaLuan';
import DeTaiKhoaLuan_Department from '../pages/Department/NghiepVu/DeTaiKhoaLuan';
import NhomDeTaiNCKH_Department from '../pages/Department/NghiepVu/NhomDeTaiNCKH';
import DeTaiNCKH_Department from '../pages/Department/NghiepVu/DeTaiNCKH';
import MoHocPhan from '../pages/Department/NghiepVu/MoHocPhan';


// THIẾT LẬP
import PhanQuyenChucNang_Department from '../pages/Department/ThietLap/PhanQuyenChucNang';
import TaiKhoan_Department from '../pages/Department/ThietLap/TaiKhoan';
import NguoiDung_Department from '../pages/Department/ThietLap/NguoiDung';
import HocKyChuKy_Department from '../pages/Department/ThietLap/HocKyChuKy';
import MonHoc from '../pages/Department/ThietLap/MonHoc';
import KhungCTDT from '../pages/Department/ThietLap/KhungCTDT';
import ThanhPhanKhungDT from '../pages/Department/ThietLap/ThanhPhanKhungDT';
import KhoaNganhChuyenNganh from '../pages/Department/ThietLap/KhoaNganhChuyenNganh';
import TrangThai from '../pages/Department/ThietLap/TrangThai';

// COMMON
import LoginForm from '../pages/Shared/Login';
import DeTaiNCKHThamGia from '../pages/Shared/DeTaiNCKHThamGia';
import DeTaiKhoaLuanThamGia from '../pages/Shared/DeTaiKhoaLuanThamGia';
import DanhSachThongBao from '../pages/Shared/DanhSachThongBao';

// LAYOUT
import { DepartmentLayout } from '../layouts';



//Không đăng nhập => chuyển login
const privateRoutes = [
    // STUDENT
    { path: config.routes.Dashboard, component: Dashboard },
    { path: config.routes.DanhSachHocPhan, component: DanhSachHocPhan },
    { path: config.routes.DiemTotNghiep, component: DiemTotNghiep },
    { path: config.routes.NhomDeTaiNCKH, component: NhomDeTaiNCKH },
    { path: config.routes.DeTaiNCKH, component: DeTaiNCKH, urlDepend: "NhomDeTaiNCKH" },
    { path: config.routes.DeTaiNCKHThamGia, component: DeTaiNCKHThamGia, urlDepend: ["NhomDeTaiNCKH", "NhomDeTaiNCKH_Department"] },
    { path: config.routes.NhomDeTaiKhoaLuan, component: NhomDeTaiKhoaLuan },
    { path: config.routes.DeTaiKhoaLuan, component: DeTaiKhoaLuan, urlDepend: "NhomDeTaiKhoaLuan" },
    { path: config.routes.DeTaiKhoaLuanThamGia, component: DeTaiKhoaLuanThamGia, urlDepend: ["NhomDeTaiKhoaLuan", "NhomDeTaiKhoaLuan_Department"] },

    // NGHIỆP VỤ
    { path: config.routes.Dashboard_Department, component: Dashboard_Department, layout: DepartmentLayout },
    { path: config.routes.DeTaiNCKH_Department, component: DeTaiNCKH_Department, layout: DepartmentLayout, urlDepend: "NhomDeTaiNCKH_Department" },
    { path: config.routes.DeTaiKhoaLuan_Department, component: DeTaiKhoaLuan_Department, layout: DepartmentLayout, urlDepend: "NhomDeTaiKhoaLuan_Department" },
    { path: config.routes.NhomDeTaiNCKH_Department, component: NhomDeTaiNCKH_Department, layout: DepartmentLayout },
    { path: config.routes.NhomDeTaiKhoaLuan_Department, component: NhomDeTaiKhoaLuan_Department, layout: DepartmentLayout },
    { path: config.routes.MoHocPhan, component: MoHocPhan, layout: DepartmentLayout },

    // THIẾT LẬP
    { path: config.routes.KhungCTDT, component: KhungCTDT, layout: DepartmentLayout },
    { path: config.routes.PhanQuyenChucNang, component: PhanQuyenChucNang_Department, layout: DepartmentLayout },
    { path: config.routes.TaiKhoan, component: TaiKhoan_Department, layout: DepartmentLayout },
    { path: config.routes.NguoiDung, component: NguoiDung_Department, layout: DepartmentLayout },
    { path: config.routes.HocKy_ChuKy, component: HocKyChuKy_Department, layout: DepartmentLayout },
    { path: config.routes.MonHoc, component: MonHoc, layout: DepartmentLayout },
    { path: config.routes.ThanhPhanKhungDT, component: ThanhPhanKhungDT, layout: DepartmentLayout },
    { path: config.routes.KhoaNganhChuyenNganh, component: KhoaNganhChuyenNganh, layout: DepartmentLayout },
    { path: config.routes.TrangThai, component: TrangThai, layout: DepartmentLayout },

    // DÙNG CHUNG
    { path: config.routes.ThongBao, component: DanhSachThongBao },


];

//Không đăng nhập vẫn vào được
const publicRoutes = [
    // SHARED
    { path: config.routes.Login, component: LoginForm, layout: null },
];

export { publicRoutes, privateRoutes };
