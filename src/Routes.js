import Vue from "vue";
import Router from "vue-router";
import Layout from "@/components/Layout/Layout";
import ErrorPage from "@/pages/Error/Error";

// Redstone
import Tokens from "@/pages/Redstone/Tokens/Tokens";
import Token from "@/pages/Redstone/Token/Token";
import Sources from "@/pages/Redstone/Sources/Sources";
import Source from "@/pages/Redstone/Source/Source";
import DataServices from "@/pages/Redstone/DataServices/DataServices";
import DataService from "@/pages/Redstone/DataService/DataService";
import Feeds from "@/pages/Redstone/Feeds/Feeds";
import Feed from "@/pages/Redstone/Feeds/Feed";

// Store
import store from "./store";

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: "/",
      redirect: "/app/tokens/",
    },
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
          path: "feeds",
          name: "Feeds list",
          component: Feeds,
          meta: { showSearchInputInNavbar: true },
        },
        {
          path: 'feeds/:network/:token',
          name: 'SingleFeed',
          component: Feed,
        },
        {
          path: "data-services",
          name: "DataServicesPage",
          component: DataServices,
          meta: {
            showSearchInputInNavbar: true,
          },
        },
        {
          path: "pull-model/:id",
          name: "PullModel",
          component: DataService,
          meta: { showSearchInputInNavbar: true },
          alias: "/app/data-services/:id"
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  const hasTrailingSlash = to.path.endsWith('/');
  const isRoot = to.path === '/';

  if (!hasTrailingSlash && !isRoot) {
    next({ path: `${to.path}/`, query: to.query, hash: to.hash });
  } else {
    if (to.meta.showSearchInputInNavbar) {
      store.dispatch("layout/setSearchInputVisibilityInHeader", true);
    } else {
      store.dispatch("layout/setSearchInputVisibilityInHeader", false);
    }
    next();
  }
});

export default router;