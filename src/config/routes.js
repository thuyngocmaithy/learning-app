const routes = {
    // SHARED
    Login: '/Login',

    // STUDENT
    Dashboard: '/',
    DanhSachHocPhan: '/DanhSachHocPhan',
    DiemTotNghiep: '/DiemTotNghiep',
    TienDoHocPhan: '/TienDoHocPhan',
    NghienCuuKhoaHoc: '/NghienCuuKhoaHoc',
    DeTaiNCKHThamGia: '/NghienCuuKhoaHoc/DeTaiNCKHThamGia',
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
    NghienCuuKhoaHoc_Department: '/Department/NghiepVu/NghienCuuKhoaHoc',
    DeTaiNCKHThamGia_Department: '/Department/NghiepVu/NghienCuuKhoaHoc/DeTaiNCKHThamGia',
    KhoaLuanThamGia_Department: '/Department/NghiepVu/KhoaLuan/KhoaLuanThamGia',
    KhoaLuan_Department: '/Department/NghiepVu/KhoaLuan',
    ThucTap_Department: '/Department/NghiepVu/ThucTap',
    NhomDeTaiNCKH: '/Department/NghiepVu/NhomDeTaiNCKH',

    // THIẾT LẬP
    KhungCTDT: '/Department/ThietLap/KhungCTDT',
    PhanQuyenChucNang: '/Department/ThietLap/PhanQuyenChucNang',
    TaiKhoan: '/Department/ThietLap/TaiKhoan',
};

export default routes;
