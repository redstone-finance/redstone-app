export class RouteParamsHandler {
  constructor(router, options = {}, perPage = 32) {
    this.perPage = perPage;
    this.router = router;
    this.options = {
      cryptosParam: "cryptos",
      networksParam: "networks",
      pageParam: "page",
      sortByParam: "sortBy",
      sortDescParam: "sortDesc",
      perPageParam: "perPage",
      searchParam: "search",
      ...options,
    };
    this.isInitialLoad = true;
  }

  initializeFiltersFromRoute() {
    const query = this.router.currentRoute.query;
    const {
      cryptosParam,
      networksParam,
      pageParam,
      sortByParam,
      sortDescParam,
      perPageParam,
      searchParam,
    } = this.options;

    return {
      selectedCryptos: query[searchParam]
        ? []
        : query[cryptosParam]
          ? query[cryptosParam].split(",")
          : [],
      selectedNetworks: query[searchParam]
        ? []
        : query[networksParam]
          ? query[networksParam].split(",").map(Number)
          : [],
      currentPage: query[pageParam] ? parseInt(query[pageParam]) : 1,
      sortBy: query[sortByParam] || "popularity",
      sortDesc: query[sortDescParam] === "true",
      perPage: query[perPageParam] ? parseInt(query[perPageParam]) : this.perPage,
      searchTerm: query[searchParam] || "",
    };
  }

  updateRouteParams(params) {
    if (this.isInitialLoad) return;

    const query = { ...this.router.currentRoute.query };
    const {
      cryptosParam,
      networksParam,
      pageParam,
      sortByParam,
      sortDescParam,
      perPageParam,
      searchParam,
    } = this.options;

    if (params.searchTerm !== undefined) {
      if (params.searchTerm) {
        query[searchParam] = params.searchTerm;
        delete query[cryptosParam];
        delete query[networksParam];
      } else {
        delete query[searchParam];
      }
    }

    if (params.selectedCryptos !== undefined) {
      if (params.selectedCryptos.length > 0) {
        query[cryptosParam] = params.selectedCryptos.join(",");
      } else {
        delete query[cryptosParam];
      }
    }

    if (params.selectedNetworks !== undefined) {
      if (params.selectedNetworks.length > 0) {
        query[networksParam] = params.selectedNetworks.join(",");
      } else {
        delete query[networksParam];
      }
    }

    if (params.currentPage !== undefined) {
      query[pageParam] = params.currentPage.toString();
    }

    if (params.sortBy !== undefined) {
      query[sortByParam] = params.sortBy;
    }

    if (params.sortDesc !== undefined) {
      query[sortDescParam] = params.sortDesc.toString();
    }

    if (params.perPage !== undefined) {
      query[perPageParam] = params.perPage.toString();
    }

    this.router.replace({ query }).catch((err) => {
      if (err.name !== "NavigationDuplicated") {
        console.warn("Navigation duplicated:", err);
      }
    });
  }

  setInitialLoadComplete() {
    this.isInitialLoad = false;
  }
}