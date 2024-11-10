const routes = {
    // SHARED
    Login: '/',

    // STUDENT
    Dashboard: '/Dashboard',
    DanhSachHocPhan: '/DanhSachHocPhan',
    DiemTotNghiep: '/DiemTotNghiep',
    TienDoHocPhan: '/TienDoHocPhan',
    NhomDeTaiNCKH: '/NhomDeTaiNCKH',
    DeTaiNCKH: '/DeTaiNCKH',
    DeTaiNCKHThamGia: '/DeTaiNCKH/DeTaiNCKHThamGia',
    KhoaLuanThamGia: '/KhoaLuan/KhoaLuanThamGia',
    KhoaLuan: '/KhoaLuan',
    ThucTap: '/ThucTap',
    ThongTinThucTap: '/ThucTap/:idThucTap',
    ChuanDauRa: '/ChuanDauRa',

    // NGHIỆP VỤ
    ThietLap: '/ThietLap',
    NghiepVu: '/NghiepVu',
    Dashboard_Department: '/Department/Dashboard',
    MoHocPhan: '/Department/NghiepVu/MoHocPhan',
    DeTaiNCKHThamGia_Department: '/Department/NghiepVu/DeTaiNCKH/DeTaiNCKHThamGia',
    DeTaiNCKH_Department: '/Department/NghiepVu/DeTaiNCKH',
    KhoaLuanThamGia_Department: '/Department/NghiepVu/KhoaLuan/KhoaLuanThamGia',
    KhoaLuan_Department: '/Department/NghiepVu/KhoaLuan',
    ThucTap_Department: '/Department/NghiepVu/ThucTap',
    NhomDeTaiNCKH_Department: '/Department/NghiepVu/NhomDeTaiNCKH',

    // THIẾT LẬP
    KhungCTDT: '/Department/ThietLap/KhungCTDT',
    ThanhPhanKhungDT: '/Department/ThietLap/ThanhPhanKhungDT',
    PhanQuyenChucNang: '/Department/ThietLap/PhanQuyenChucNang',
    TaiKhoan: '/Department/ThietLap/TaiKhoan',
    NguoiDung: '/Department/ThietLap/NguoiDung',
    HocKy: '/Department/ThietLap/HocKy',
    ChuKy: '/Department/ThietLap/ChuKy',
    MonHoc: '/Department/ThietLap/MonHoc',
    Khoa: '/Department/ThietLap/Khoa',
    ChuyenNganh: '/Department/ThietLap/ChuyenNganh',
    KhoaChuyenNganh: '/Department/ThietLap/KhoaChuyenNganh',

};

export default routes;
