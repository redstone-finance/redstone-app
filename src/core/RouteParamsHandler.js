export class RouteParamsHandler {
  constructor(router, options = {}) {
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
      perPage: query[perPageParam] ? parseInt(query[perPageParam]) : 32,
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

    if (params.searchTerm) {
      query[searchParam] = params.searchTerm;
      delete query[cryptosParam];
      delete query[networksParam];
    } else {
      delete query[searchParam];
      if (params.selectedCryptos?.length > 0) {
        query[cryptosParam] = params.selectedCryptos.join(",");
      } else {
        delete query[cryptosParam];
      }
      if (params.selectedNetworks?.length > 0) {
        query[networksParam] = params.selectedNetworks.join(",");
      } else {
        delete query[networksParam];
      }
    }

    query[pageParam] = params.currentPage.toString();
    query[sortByParam] = params.sortBy;
    query[sortDescParam] = params.sortDesc.toString();
    query[perPageParam] = params.perPage.toString();

    this.router.replace({ query }).catch((err) => {
      if (err.name !== "NavigationDuplicated") {
        throw err;
      }
    });
  }

  setInitialLoadComplete() {
    this.isInitialLoad = false;
  }
}
