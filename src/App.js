import { Fragment, useContext, useEffect, useState } from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { privateRoutes, publicRoutes } from './routes';
import MainLayout from './layouts';
import { AccountLoginContext } from './context/AccountLoginContext';
import config from './config';
import ResultCustomAnt from './components/Core/ResultCustomAnt';
import { Spin } from 'antd';
import { getWhere } from './services/permissionFeatureService';
import { PermissionDetailContext } from './context/PermissionDetailContext';
import axios from 'axios';

function App() {
    const { userId, permission } = useContext(AccountLoginContext);
    const [listFeature, setListFeature] = useState([]);
    const [isLoading, setIsLoading] = useState(true)
    const { updatePermissionDetails } = useContext(PermissionDetailContext);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');

    useEffect(() => {
        const checkDatabaseStatus = async () => {
            try {
                const response = await axios.get('https://learning-app-nodejs.vercel.app/status');
                setStatus(response.data.status);
            } catch (error) {
                console.error('Error checking database status:', error);
                setStatus('error');
            } finally {
                setLoading(false);
            }
        };

        checkDatabaseStatus();
    }, []);

    if (loading) {
        return <div className='loading-container'>
            <Spin size="large" />
        </div>;
    }

    if (status === 'error') {
        return <div className='loading-container'>Vui lòng tải lại trang</div>;
    }


    const findKeyByValue = (obj, value) => {
        return Object.keys(obj).find(key => obj[key] === value);
    };


    const getListFeature = async () => {
        try {
            const response = await getWhere({ permission: permission });
            if (response.status === 200) {
                const features = response.data.data.map((item) => ({
                    feature: item.feature,
                    permissionDetail: item.permissionDetail,
                }));
                setListFeature((prevListFeature) => [
                    ...prevListFeature,
                    ...features
                ]);

                updatePermissionDetails(features);

            }
        } catch (error) {
            console.error(error);
        }
        finally {
            setIsLoading(false)
        }
    };

    useEffect(() => {
        setIsLoading(true);
        getListFeature();
    }, [permission]);

    return isLoading ? (
        <div className={('container-loading')}>
            <Spin size="large" />
        </div>
    ) : (
        <div className="App">
            <Routes>
                {/* Điều hướng đến trang dashboard */}
                {
                    userId &&
                    <Route
                        path="/"
                        element={permission === "SINHVIEN"
                            ? <Navigate to={config.routes.Dashboard} replace />
                            : <Navigate to={config.routes.Dashboard_Department} replace />
                        }
                    />
                }

                {publicRoutes.map((route, index) => {
                    let Layout = MainLayout;

                    if (route.layout === null) {
                        Layout = Fragment;
                    } else if (route.layout) {
                        Layout = route.layout;
                    }

                    const Page = route.component;
                    return (
                        <Route
                            key={index}
                            path={route.path}
                            element={<Layout>{route.thesis ? <Page thesis={true} /> : <Page />}</Layout>}
                        />
                    );
                })}

                {/* Duyệt qua danh sách các route riêng tư và tạo Route component */}
                {privateRoutes.map((route, index) => {
                    // Xác định layout cho route
                    const Layout = route.layout === null ? Fragment : (route.layout || MainLayout);
                    const Page = route.component;

                    // Lấy keyRoute từ route
                    const keyRoute = route.path;
                    // Tìm key tương ứng với keyRoute trong cấu hình
                    const key = findKeyByValue(config.routes, keyRoute);

                    // Kiểm tra quyền truy cập của người dùng
                    let element;

                    if (userId !== 0) {
                        if (permission !== null) {
                            // Kiểm tra xem keyRoute có trong danh sách các tính năng được phép không
                            const matchedFeature = listFeature.find(data => data.feature.keyRoute === key);
                            if (matchedFeature) {
                                element = (
                                    <Layout>
                                        {route.thesis
                                            ? <Page thesis={true} featureId={matchedFeature.feature.featureId} permissionDetail={matchedFeature.permissionDetail} />
                                            : <Page featureId={matchedFeature.feature.featureId} permissionDetail={matchedFeature.permissionDetail} />}
                                    </Layout>
                                );
                            }
                            else {
                                // Kiểm tra điều kiện phụ thuộc URL
                                const matchedFeature = route.urlDepend && listFeature.find(data => data.feature.keyRoute === route.urlDepend);

                                if (matchedFeature) {
                                    // Nếu tìm thấy phần tử phù hợp, tạo phần tử Layout chứa Page
                                    element = (
                                        <Layout>
                                            {route.thesis
                                                ? <Page thesis={true} featureId={matchedFeature.feature.featureId} permissionDetail={matchedFeature.permissionDetail} /> // Nếu có thesis, truyền tham số thesis
                                                : <Page featureId={matchedFeature.feature.featureId} permissionDetail={matchedFeature.permissionDetail} />
                                            }
                                        </Layout>
                                    );
                                }
                                else {
                                    // Nếu không có quyền, hiển thị thông báo Không có quyền truy cập
                                    element = <ResultCustomAnt />;
                                }
                            }
                        } else {
                            // Nếu không có permission, chuyển hướng đến trang đăng nhập
                            element = <Navigate to={config.routes.Login} replace={true} />;
                        }
                    } else {
                        // Nếu người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
                        element = <Navigate to={config.routes.Login} replace={true} />;
                    }

                    return (
                        <Route
                            key={index}
                            path={route.path}
                            element={element}
                        />
                    );
                })}
            </Routes>
        </div>
    );
}

export default App;
