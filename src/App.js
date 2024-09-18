import { Fragment, useContext, useEffect, useState } from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { privateRoutes, publicRoutes } from './routes';
import MainLayout from './layouts';
import { AccountLoginContext } from './context/AccountLoginContext';
import config from './config';
import ResultCustomAnt from './components/Core/ResultCustomAnt';
import { Spin } from 'antd';
import { getWhere } from './services/permissionFeatureService';

function App() {
    const { userId, permission } = useContext(AccountLoginContext);
    const [listFeature, setListFeature] = useState([]);
    const [isLoading, setIsLoading] = useState(true)

    const findKeyByValue = (obj, value) => {
        return Object.keys(obj).find(key => obj[key] === value);
    };


    const getListFeature = async () => {
        try {
            console.log(permission);

            const response = await getWhere({ permission: permission });
            if (response.status === 'success') {
                setListFeature((prevListFeature) => [
                    ...prevListFeature,
                    ...response.data.map((item) => item.feature),
                ]);

            }


        } catch (error) {
            console.log(error);
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
        <Router>
            <div className="App">
                <Routes>
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
                                if (listFeature.some(data => data.keyRoute === key)) {
                                    element = <Layout>{route.thesis ? <Page thesis={true} /> : <Page />}</Layout>;
                                } else {
                                    // Kiểm tra điều kiện phụ thuộc URL
                                    if (route.urlDepend && listFeature.some(data => data.keyRoute === route.urlDepend)) {
                                        element = <Layout>{route.thesis ? <Page thesis={true} /> : <Page />}</Layout>;
                                    } else {
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
        </Router>
    );
}

export default App;
