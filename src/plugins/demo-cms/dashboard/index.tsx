import { defineDashboardExtension } from '@vendure/dashboard';
import { pageList } from './page-list';
import { pageDetail } from './page-detail';

export default defineDashboardExtension({
    routes: [
        pageList,
        pageDetail,
    ],
});