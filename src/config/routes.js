const routes = {
    // SHARED
    Login: '/Login',

    // STUDENT
    Dashboard: '/',
    DanhSachHocPhan: '/DanhSachHocPhan',
    DiemTotNghiep: '/DiemTotNghiep',
    TienDoHocPhan: '/TienDoHocPhan',
    NhomDeTaiNCKH: '/NhomDeTaiNCKH',
    DeTaiNCKH: '/NhomDeTaiNCKH/DeTaiNCKH',
    DeTaiNCKHThamGia: '/NhomDeTaiNCKH/DeTaiNCKH/DeTaiNCKHThamGia',
    KhoaLuanThamGia: '/KhoaLuan/KhoaLuanThamGia',
    KhoaLuan: '/KhoaLuan',
    ThucTap: '/ThucTap',
    ThongTinThucTap: '/ThucTap/:idThucTap',
    ChuanDauRa: '/ChuanDauRa',

    // NGHIỆP VỤ
    ThietLap: '/ThietLap',
    NghiepVu: '/NghiepVu',
    Dashboard_Department: '/Department',
    MoHocPhan: '/Department/NghiepVu/MoHocPhan',
    DeTaiNCKHThamGia_Department: '/Department/NghiepVu/NhomDeTaiNCKH/DeTaiNCKH/DeTaiNCKHThamGia',
    DeTaiNCKH_Department: '/Department/NghiepVu/NhomDeTaiNCKH/DeTaiNCKH',
    KhoaLuanThamGia_Department: '/Department/NghiepVu/KhoaLuan/KhoaLuanThamGia',
    KhoaLuan_Department: '/Department/NghiepVu/KhoaLuan',
    ThucTap_Department: '/Department/NghiepVu/ThucTap',
    NhomDeTaiNCKH_Department: '/Department/NghiepVu/NhomDeTaiNCKH',

    // THIẾT LẬP
    KhungCTDT: '/Department/ThietLap/KhungCTDT',
    PhanQuyenChucNang: '/Department/ThietLap/PhanQuyenChucNang',
    TaiKhoan: '/Department/ThietLap/TaiKhoan',
};

export default routes;
