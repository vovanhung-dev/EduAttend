import React, { Suspense, lazy } from "react";
import { Layout } from 'antd';
import { withRouter } from "react-router";
import Footer from '../components/layout/footer/footer';
import Header from '../components/layout/header/header';
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom";

import NotFound from '../components/notFound/notFound';
import Sidebar from '../components/layout/sidebar/sidebar';
import LoadingScreen from '../components/loading/loadingScreen';
import PrivateRoute from '../components/PrivateRoute';
import PublicRoute from '../components/PublicRoute';

const { Content } = Layout;

const Login = lazy(() => {
    return Promise.all([
        import('../pages/Login/login'),
        new Promise(resolve => setTimeout(resolve, 0))
    ])
        .then(([moduleExports]) => moduleExports);
});

const AccountManagement = lazy(() => {
    return Promise.all([
        import('../pages/AccountManagement/accountManagement'),
        new Promise(resolve => setTimeout(resolve, 0))
    ])
        .then(([moduleExports]) => moduleExports);
});

const ChangePassword = lazy(() => {
    return Promise.all([
        import('../pages/ChangePassword/changePassword'),
        new Promise(resolve => setTimeout(resolve, 0))
    ])
        .then(([moduleExports]) => moduleExports);
});

const Profile = lazy(() => {
    return Promise.all([
        import('../pages/Profile/profile'),
        new Promise(resolve => setTimeout(resolve, 0))
    ])
        .then(([moduleExports]) => moduleExports);
});

const ResetPassword = lazy(() => {
    return Promise.all([
        import('../pages/ResetPassword/resetPassword'),
        new Promise(resolve => setTimeout(resolve, 0))
    ])
        .then(([moduleExports]) => moduleExports);
});

const DashBoard = lazy(() => {
    return Promise.all([
        import('../pages/DashBoard/dashBoard'),
        new Promise(resolve => setTimeout(resolve, 0))
    ])
        .then(([moduleExports]) => moduleExports);
});


const Register = lazy(() => {
    return Promise.all([
        import('../pages/Register/register'),
        new Promise(resolve => setTimeout(resolve, 0))
    ])
        .then(([moduleExports]) => moduleExports);
});

const ScheduleDetails = lazy(() => {
    return Promise.all([
        import('../pages/ScheduleDetails/scheduleDetails'),
        new Promise(resolve => setTimeout(resolve, 0))
    ])
        .then(([moduleExports]) => moduleExports);
});

const ScheduleList = lazy(() => {
    return Promise.all([
        import('../pages/ScheduleList/scheduleList'),
        new Promise(resolve => setTimeout(resolve, 0))
    ])
        .then(([moduleExports]) => moduleExports);
});

const ImageS3 = lazy(() => {
    return Promise.all([
        import('../pages/MultiImageUpload/MultiImageUpload'),
        new Promise(resolve => setTimeout(resolve, 0))
    ])
        .then(([moduleExports]) => moduleExports);
});

const RouterURL = withRouter(({ location }) => {


    const LoginContainer = () => (
        <div>
            <PublicRoute exact path="/">
                <Suspense fallback={<LoadingScreen />}>
                    <Login />
                </Suspense>
            </PublicRoute>
            <PublicRoute exact path="/login">
                <Login />
            </PublicRoute>
            <PublicRoute exact path="/reset-password/:id">
                <ResetPassword />
            </PublicRoute>
            <PublicRoute exact path="/register">
                <Register />
            </PublicRoute>
        </div>
    )

    const DefaultContainer = () => (
        <PrivateRoute>
            <Layout style={{ minHeight: '100vh' }}>
                <Sidebar />
                <Layout >
                    <Header />
                    <Content style={{ marginLeft: 230, width: 'calc(100% - 230px)', marginTop: 55 }}>
                        <PrivateRoute exact path="/account-management">
                            <Suspense fallback={<LoadingScreen />}>
                                <AccountManagement />
                            </Suspense>
                        </PrivateRoute>

                        <PrivateRoute exact path="/profile">
                            <Suspense fallback={<LoadingScreen />}>
                                <Profile />
                            </Suspense>
                        </PrivateRoute>

                        <PrivateRoute exact path="/change-password/:id">
                            <Suspense fallback={<LoadingScreen />}>
                                <ChangePassword />
                            </Suspense>
                        </PrivateRoute>

                        <PrivateRoute exact path="/dash-board">
                            <Suspense fallback={<LoadingScreen />}>
                                <DashBoard />
                            </Suspense>
                        </PrivateRoute>


                        <PrivateRoute exact path="/details-schedule/:id">
                            <Suspense fallback={<LoadingScreen />}>
                                <ScheduleDetails />
                            </Suspense>
                        </PrivateRoute>

                        
                        <PrivateRoute exact path="/schedule-list">
                            <Suspense fallback={<LoadingScreen />}>
                                <ScheduleList />
                            </Suspense>
                        </PrivateRoute>

                        <PrivateRoute exact path="/image-s3">
                            <Suspense fallback={<LoadingScreen />}>
                                <ImageS3 />
                            </Suspense>
                        </PrivateRoute>
                        
                        
                        <PrivateRoute exact path="/notfound">
                            <NotFound />
                        </PrivateRoute>
                    </Content>
                    <Footer />
                </Layout>
            </Layout>
        </PrivateRoute >
    )

    return (
        <div>
            <Router>
                <Switch>
                    <Route exact path="/">
                        <LoginContainer />
                    </Route>

                    <Route exact path="/login">
                        <LoginContainer />
                    </Route>

                    <Route exact path="/reset-password/:id">
                        <LoginContainer />
                    </Route>

                    <Route exact path="/profile">
                        <DefaultContainer />
                    </Route>

                    <Route exact path="/change-password/:id">
                        <DefaultContainer />
                    </Route>
                    
                    <Route exact path="/class-list">
                        <DefaultContainer />
                    </Route>
                   
                    <Route exact path="/dash-board">
                        <DefaultContainer />
                    </Route>

                    <Route exact path="/details-schedule/:id">
                        <DefaultContainer />
                    </Route>

                    <Route exact path="/account-management">
                        <DefaultContainer />
                    </Route>
        
                    <Route exact path="/dash-board">
                        <DefaultContainer />
                    </Route>

                    <Route exact path="/schedule-list">
                        <DefaultContainer />
                    </Route>

                    <Route exact path="/image-s3">
                        <DefaultContainer />
                    </Route>

                    <Route exact path="/register">
                        <LoginContainer />
                    </Route>
                    <Route>
                        <NotFound />
                    </Route>
                </Switch>
            </Router>
        </div>
    )
})

export default RouterURL;
