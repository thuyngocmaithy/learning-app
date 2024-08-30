const routes = {
    // SHARED
    Login: '/Login',

    // STUDENT
    Dashboard: '/',
    DanhSachHocPhan: '/DanhSachHocPhan',
    DiemTotNghiep: '/DiemTotNghiep',
    TienDoHocPhan: '/TienDoHocPhan',
    DuAnNghienCuu: '/DuAnNghienCuu',
    DuAnThamGia: '/DuAnNghienCuu/DuAnThamGia',
    KhoaLuanThamGia: '/KhoaLuan/KhoaLuanThamGia',
    KhoaLuan: '/KhoaLuan',
    ThucTap: '/ThucTap',
    ThongTinThucTap: '/ThucTap/:idThucTap',
    ChuanDauRa: '/ChuanDauRa',

    // DEPARTMENT
    Dashboard_Department: '/Department',
    MoHocPhan: '/Department/NghiepVu/MoHocPhan',
    DuAnNghienCuu_Department: '/Department/NghiepVu/DuAnNghienCuu',
    DuAnThamGia_Department: '/Department/NghiepVu/DuAnNghienCuu/DuAnThamGia',
    KhoaLuanThamGia_Department: '/Department/NghiepVu/KhoaLuan/KhoaLuanThamGia',
    KhoaLuan_Department: '/Department/NghiepVu/KhoaLuan',

    // THIẾT LẬP
    KhungCTDT: '/Department/ThietLap/KhungCTDT',
    PhanQuyenChucNang: '/Department/ThietLap/PhanQuyenChucNang',
};

export default routes;
