import Vue from 'vue';
import Router from 'vue-router';

import Layout from '@/components/Layout/Layout';
import Login from '@/pages/Login/Login';
import ErrorPage from '@/pages/Error/Error';
// Core
import TypographyPage from '@/pages/Typography/Typography';

// Tables
import TablesBasicPage from '@/pages/Tables/Basic';

// Maps
import GoogleMapPage from '@/pages/Maps/Google';

// Main
import AnalyticsPage from '@/pages/Dashboard/Dashboard';

// Charts
import ChartsPage from '@/pages/Charts/Charts';

// Ui
import IconsPage from '@/pages/Icons/Icons';
import NotificationsPage from '@/pages/Notifications/Notifications';

// Redstone
import Tokens from "@/pages/Redstone/Tokens/Tokens";
import Token from "@/pages/Redstone/Token/Token";

// Store
import store from "./store";

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/error',
      name: 'Error',
      component: ErrorPage,
    },

    {
      path: '/app',
      name: 'Layout',
      component: Layout,
      children: [
        // Redstone
        {
          path: 'tokens',
          name: 'TokensPage',
          component: Tokens,
          meta: {
            showSearchInputInNavbar: true,
          },
        },
        {
          path: 'token/:symbol',
          name: 'TokenPage',
          component: Token,
        },

        {
          path: 'dashboard',
          name: 'AnalyticsPage',
          component: AnalyticsPage,
        },
        {
          path: 'typography',
          name: 'TypographyPage',
          component: TypographyPage,
        },
        {
          path: 'components/icons',
          name: 'IconsPage',
          component: IconsPage,
        },
        {
          path: 'notifications',
          name: 'NotificationsPage',
          component: NotificationsPage,
        },
        {
          path: 'components/charts',
          name: 'ChartsPage',
          component: ChartsPage,
        },
        {
          path: 'tables',
          name: 'TablesBasicPage',
          component: TablesBasicPage,
        },
        {
          path: 'components/maps',
          name: 'GoogleMapPage',
          component: GoogleMapPage,
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.meta.showSearchInputInNavbar) {
    store.dispatch("layout/setSearchInputVisibilityInHeader", true);
  } else {
    store.dispatch("layout/setSearchInputVisibilityInHeader", false);
  }
  next();
});

export default router;
