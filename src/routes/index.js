import config from '../config';

// Pages
import Home from '../pages/Home';
import CourseWillOpen from '../pages/CourseWillOpen';
import AllCourse from '../pages/AllCourse';
import LearningProgress from '../pages/LearningProgress';
import Score from '../pages/Score';

//Không đăng nhập vẫn vào được
const publicRoutes = [
    { path: config.routes.home, component: Home },
    { path: config.routes.coursewillopen, component: CourseWillOpen },
    { path: config.routes.allcourse, component: AllCourse },
    { path: config.routes.learningprogress, component: LearningProgress },
    { path: config.routes.score, component: Score },
];

//Không đăng nhập => chuyển login
const privateRoutes = [];

export { publicRoutes, privateRoutes };
