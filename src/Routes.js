import Vue from 'vue';
import Router from 'vue-router';

import Layout from '@/components/Layout/Layout';
import ErrorPage from '@/pages/Error/Error';

// Redstone
import Tokens from "@/pages/Redstone/Tokens/Tokens";
import Token from "@/pages/Redstone/Token/Token";
import Sources from "@/pages/Redstone/Sources/Sources";
import Source from "@/pages/Redstone/Source/Source";
import Providers from "@/pages/Redstone/Providers/Providers";
import Provider from "@/pages/Redstone/Provider/Provider";

// Store
import store from "./store";

Vue.use(Router);

const router = new Router({
  routes: [
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
          path: 'sources',
          name: 'SourcesPage',
          component: Sources,
        },
        {
          path: 'source/:sourceId',
          name: 'SourcePage',
          component: Source,
        },
        {
          path: 'providers',
          name: 'ProvidersPage',
          component: Providers,
          meta: {
            showSearchInputInNavbar: true,
          },
        },
        {
          path: 'provider/:id',
          name: 'ProviderPage',
          component: Provider,
        },
      ],
    },
  ],
  scrollBehavior: () => {
    document.getElementsByClassName('sing-dashboard')[0].scrollIntoView();
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
