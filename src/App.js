import { Fragment, useContext, useEffect, useState, useMemo } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { privateRoutes, publicRoutes } from './routes';
import MainLayout from './layouts';
import { AccountLoginContext } from './context/AccountLoginContext';
import config from './config';
import ResultCustomAnt from './components/Core/ResultCustomAnt';
import { Spin } from 'antd';
import { getWhere } from './services/permissionFeatureService';
import { PermissionDetailContext } from './context/PermissionDetailContext';
import { useAntdApp } from './hooks/useAntdApp';
import { ConnectServerContext } from './context/ConnectServerContext';

function App() {
    useAntdApp();
    const { userId, permission, isTokenExpired, updateUserInfo } = useContext(AccountLoginContext);
    const [listFeature, setListFeature] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { updatePermissionDetails } = useContext(PermissionDetailContext);
    const { connectServer } = useContext(ConnectServerContext);
    const [isLoadFeatured, setIsLoadFeatured] = useState(false);

    useEffect(() => {
        // Kiểm tra Token hết hạn và chuyển hướng nếu cần
        if (isTokenExpired) {
            localStorage.removeItem('userLogin');
            updateUserInfo();
        }
    }, [isTokenExpired, updateUserInfo]);

    useEffect(() => {
        if (!permission && connectServer === 'ok')
            setIsLoading(false);
    }, [permission, connectServer])


    useEffect(() => {
        // Hàm lấy danh sách tính năng
        const getListFeature = async () => {
            setIsLoading(true);
            try {
                const response = await getWhere({ permission: permission });
                if (response.status === 200) {
                    const features = response.data.data.map((item) => ({
                        feature: item.feature,
                        permissionDetail: item.permissionDetail,
                    }));

                    // Kiểm tra xem listFeature có thay đổi không
                    setListFeature((prevListFeature) => {
                        const newFeatures = [...prevListFeature, ...features];
                        if (JSON.stringify(newFeatures) !== JSON.stringify(prevListFeature)) {
                            return newFeatures;
                        }
                        return prevListFeature; // Không cập nhật state nếu dữ liệu không thay đổi
                    });

                    updatePermissionDetails(features);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
                setIsLoadFeatured(true); // Đã load dữ liệu phân quyền
            }
        };
        if (!userId) {
            setIsLoadFeatured(false);
        }
        // Có dữ liệu quyền và chưa load dữ liệu phân quyền
        if (permission && !isLoadFeatured) {
            getListFeature();
        }
    }, [userId, permission, isLoadFeatured, updatePermissionDetails]);

    const findKeyByValue = (obj, value) => {
        return Object.keys(obj).find(key => obj[key] === value);
    };


    // Memoize các `Pages` trong route
    const memoizedPublicRoutes = useMemo(() => {
        return publicRoutes.map((route, index) => {
            let Layout = MainLayout;

            if (route.layout === null) {
                Layout = Fragment;
            } else if (route.layout) {
                Layout = route.layout;
            }

            const Page = route.component;

            const MemoizedPage = route.thesis ? <Page thesis={true} /> : <Page />;
            return (
                <Route
                    key={index}
                    path={route.path}
                    element={<Layout>{MemoizedPage}</Layout>}
                />
            );
        });
    }, []);

    // Memoize các `PrivateRoutes`
    const memoizedPrivateRoutes = useMemo(() => {
        return privateRoutes.map((route, index) => {
            const Layout = route.layout === null ? Fragment : (route.layout || MainLayout);
            const Page = route.component;

            // Lấy keyRoute từ route
            const keyRoute = route.path;
            const key = findKeyByValue(config.routes, keyRoute);

            let element;

            if (userId !== 0) {
                if (permission !== null) {
                    if (isLoadFeatured) {
                        // Kiểm tra quyền truy cập của người dùng
                        const matchedFeature = listFeature.find(data => data.feature.keyRoute === key);
                        if (matchedFeature) {
                            const MemoizedPage = <Page featureId={matchedFeature.feature.featureId} permissionDetail={matchedFeature.permissionDetail} />;
                            element = (
                                <Layout>
                                    {MemoizedPage}
                                </Layout>
                            );
                        } else {
                            // Kiểm tra quyền phụ thuộc URL
                            const matchedFeature = route.urlDepend && listFeature.find(data =>
                                Array.isArray(route.urlDepend)
                                    ? route.urlDepend.some(url => data.feature.keyRoute === url)
                                    : data.feature.keyRoute === route.urlDepend
                            );

                            if (matchedFeature) {
                                const MemoizedPage = <Page featureId={matchedFeature.feature.featureId} permissionDetail={matchedFeature.permissionDetail} />;
                                element = (
                                    <Layout>
                                        {MemoizedPage}
                                    </Layout>
                                );
                            } else {
                                element = <ResultCustomAnt />; // Không có quyền truy cập
                            }
                        }
                    } else {
                        // Đang chờ load listFeature
                        element = <div className="container-loading"><Spin size="large" /></div>;
                    }
                } else {
                    element = <Navigate to={config.routes.Login} replace={true} />;
                }
            } else {
                element = <Navigate to={config.routes.Login} replace={true} />;
            }

            return (
                <Route
                    key={index}
                    path={route.path}
                    element={element}
                />
            );
        });
    }, [listFeature, userId, permission, isLoadFeatured]); // Thêm isLoadFeatured vào dependency



    // Nếu trạng thái là lỗi, hiển thị thông báo lỗi
    if (connectServer === 'error') {
        return <ResultCustomAnt tile='Không thể kết nối đến server. Vui lòng tải lại trang.' />
    }

    // Nếu đang tải, hiển thị Spinner
    if (isLoading || (userId && !isLoadFeatured)) {
        return (
            <div className="container-loading">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="App">
            <Routes>
                {/* Điều hướng đến trang dashboard */}

                {userId && isLoadFeatured && (
                    <>
                        <Route
                            path="/"
                            element={
                                permission === "SINHVIEN"
                                    ? <Navigate to={config.routes.Dashboard} replace />
                                    : permission === "ADMIN"
                                        ? <Navigate to={config.routes.ThongBao} replace />
                                        : <Navigate to={config.routes.Dashboard_Department} replace />
                            }
                        />
                        {console.log(permission === "ADMIN")
                        }
                    </>
                )}

                {memoizedPublicRoutes}
                {memoizedPrivateRoutes}
            </Routes>
        </div>
    );
}

export default App;
