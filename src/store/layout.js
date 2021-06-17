export default {
  namespaced: true,
  state: {
    showSidebar: false,
    sidebarActiveElement: null,
    chatOpen: false,
    chatNotificationIcon: false,
    chatNotificationPopover: false,
    showSearchInputInHeader: false,
    searchTerm: '',
  },
  mutations: {
    toggleSidebar(state) {
      state.showSidebar = !state.showSidebar;
    },
    switchSidebar(state, value) {
      if (value) {
        state.showSidebar = value;
      }
    },
    handleSwipe(state, e) {
      if ('ontouchstart' in window) {
        if (e.direction === 4) {
          state.showSidebar = true;
        }

        if (e.direction === 2 && state.showSidebar) {
          state.showSidebar = false;
        }
      }
    },
    changeSidebarActive(state, index) {
      state.sidebarActiveElement = index;
    },
    setSearchInputVisibilityInHeader(state, visibility) {
      state.showSearchInputInHeader = visibility;
    },
    updateSearchTerm(state, searchTerm) {
      state.searchTerm = searchTerm;
    },
  },
  actions: {
    toggleSidebar({ commit }) {
      commit('toggleSidebar');
    },
    switchSidebar({ commit }, value) {
      commit('switchSidebar', value);
    },
    handleSwipe({ commit }, e) {
      commit('handleSwipe', e);
    },
    changeSidebarActive({ commit }, index) {
      commit('changeSidebarActive', index);
    },
    setSearchInputVisibilityInHeader({ commit }, visibility) {
      commit('setSearchInputVisibilityInHeader', visibility);
    },
    updateSearchTerm({ commit }, searchTerm) {
      commit('updateSearchTerm', searchTerm);
    },
  },
};
