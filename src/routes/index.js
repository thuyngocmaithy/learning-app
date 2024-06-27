import config from '../config';

// Pages
import Home from '../pages/Home';
import AllCourse from '../pages/AllCourse';
import LearningProgress from '../pages/LearningProgress';
import ResearchProjects from '../pages/ResearchProjects';
import TrackProgress from '../pages/TrackProgress';
import Graduation from '../pages/Graduation';
import InfoProjectJoin from '../pages/InfoProjectJoin';
import Thesis from '../pages/Thesis';
import LoginForm from '../pages/Login';
//Không đăng nhập vẫn vào được
const publicRoutes = [
    { path: config.routes.Login , component : LoginForm , layout : null} ,
    { path: config.routes.Home, component: Home },
    { path: config.routes.AllCourse, component: AllCourse },
    { path: config.routes.LearningProgress, component: LearningProgress },
    { path: config.routes.Graduation, component: Graduation },
    { path: config.routes.TrackProgress, component: TrackProgress },
    { path: config.routes.ResearchProjects, component: ResearchProjects },
    { path: config.routes.InfoProjectJoin, component: InfoProjectJoin },
    { path: config.routes.InfoThesisJoin, component: InfoProjectJoin, thesis: true },
    { path: config.routes.Thesis, component: Thesis },
];

//Không đăng nhập => chuyển login
const privateRoutes = [];

export { publicRoutes, privateRoutes };
