import Vue from 'vue';
import Router from 'vue-router';
import Layout from '@/components/Layout/Layout';
import ErrorPage from '@/pages/Error/Error';

// Redstone
import Tokens from "@/pages/Redstone/Tokens/Tokens";
import Token from "@/pages/Redstone/Token/Token";
import Sources from "@/pages/Redstone/Sources/Sources";
import Source from "@/pages/Redstone/Source/Source";
import DataServices from "@/pages/Redstone/DataServices/DataServices";
import DataService from "@/pages/Redstone/DataService/DataService";
import Feeds from "@/pages/Redstone/Feeds/Feeds"
import Feed from "@/pages/Redstone/Feeds/Feed"

// Store
import store from "./store";

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: "/error",
      name: "Error",
      component: ErrorPage,
    },
    {
      path: "/app",
      name: "Layout",
      component: Layout,
      children: [
        // Redstone
        {
          path: "tokens",
          name: "TokensPage",
          component: Tokens,
          meta: {
            showSearchInputInNavbar: true,
          },
        },
        {
          path: "token/:symbol",
          name: "TokenPage",
          component: Token,
        },
        {
          path: "sources",
          name: "SourcesPage",
          component: Sources,
        },
        {
          path: "source/:sourceId",
          name: "SourcePage",
          component: Source,
        },
        {
          path: 'feeds',
          name: 'Feeds list',
          component: Feeds,
          meta: {noScroll: true}
        },
        {
          path: 'data-services',
          name: 'DataServicesPage',
          component: DataServices,
          meta: {
            showSearchInputInNavbar: true,
          },
        },
        {
          path: "data-services/:id",
          name: "DataServicePage",
          component: DataService,
        },
      ],
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return { selector: to.hash };
    }
    if (to.matched.some(m => m.meta.noScroll)) {
      return false;
    }
    if (to.name === from.name && to.path === from.path) {
      return false;
    }
    return { x: 0, y: 0 };
  }
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