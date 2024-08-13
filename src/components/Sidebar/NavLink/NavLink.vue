<template>
  <li
    v-if="!childrenLinks && isHeader"
    :class="{ headerLink: true, className }"
  >
    <router-link v-if="!link.includes('http')" :to="link" class="sidebar-link">
      <span class="icon">
        <i v-if="iconName" :class="fullIconName"></i>
        <img v-if="imgUrl" :src="imgUrl" />
      </span>
      <span v-if="showHeader">{{ header }}</span>
      <sup v-if="label" :class="'text-' + labelColor" class="headerLabel">{{
        label
      }}</sup>
      <b-badge v-if="badge" variant="primary" pill>{{ badge }}</b-badge>
    </router-link>
    <a
      v-if="link.includes('http')"
      :href="link"
      class="sidebar-link"
      target="_blank"
    >
      <span class="icon">
        <i v-if="iconName" :class="fullIconName"></i>
        <img v-if="imgUrl" :src="imgUrl" />
      </span>
      <span v-if="showHeader">{{ header }}</span>
      <sup v-if="label" :class="'text-' + labelColor" class="headerLabel">{{
        label
      }}</sup>
      <b-badge v-if="badge" variant="primary" pill>{{ badge }}</b-badge>
    </a>
  </li>
  <li v-else-if="childrenLinks" :class="{ headerLink: true, className }">
    <div @click="() => togglePanelCollapse(link)">
      <router-link :to="link" event="" class="d-flex sidebar-link">
        <span class="icon">
          <i v-if="iconName" :class="fullIconName"></i>
          <img v-if="imgUrl" :src="imgUrl" />
        </span>
        <span v-if="showHeader">{{ header }}</span>
        <sup
          v-if="label"
          :class="'text-' + labelColor"
          class="ml-1 headerLabel"
          >{{ label }}</sup
        >
        <div :class="{ caretWrapper: true, carretActive: isActive }">
          <i class="fa fa-angle-right" />
        </div>
      </router-link>
    </div>
    <b-collapse :id="'collapse' + index" :visible="isActive">
      <ul class="sub-menu">
        <NavLink
          v-for="link in childrenLinks"
          :activeItem="activeItem"
          :header="link.header"
          :index="link.index"
          :link="link.link"
          :childrenLinks="link.childrenLinks"
          :key="link.link"
        />
      </ul>
    </b-collapse>
  </li>
  <li v-else>
    <router-link :to="index !== 'menu' && link">
      {{ header }}
      <sup v-if="label" :class="'text-' + labelColor" class="headerLabel">{{
        label
      }}</sup>
    </router-link>
  </li>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "NavLink",
  props: {
    badge: { type: String, default: "" },
    header: { type: String, default: "" },
    iconName: { type: String, default: "" },
    c: { type: String, default: "" },
    headerLink: { type: String, default: "" },
    link: { type: String, default: "" },
    childrenLinks: { type: Array, default: null },
    className: { type: String, default: "" },
    isHeader: { type: Boolean, default: false },
    deep: { type: Number, default: 0 },
    activeItem: { type: String, default: "" },
    label: { type: String },
    labelColor: { type: String, default: "warning" },
    index: { type: String },
    imgUrl: { type: String },
  },
  data() {
    return {
      headerLinkWasClicked: true,
    };
  },
  methods: {
    ...mapActions("layout", ["changeSidebarActive"]),
    togglePanelCollapse(link) {
      this.changeSidebarActive(link);
      this.headerLinkWasClicked =
        !this.headerLinkWasClicked || !this.activeItem.includes(this.index);
    },
  },
  computed: {
    fullIconName() {
      return `fi ${this.iconName}`;
    },
    isActive() {
      return (
        this.activeItem &&
        this.activeItem.includes(this.index) &&
        this.headerLinkWasClicked
      );
    },
    ...mapState("layout", {
      showHeader: (state) => !state.sidebarClose || state.sidebarStatic,
    }),
  },
};
</script>

<style src="./NavLink.scss" lang="scss" scoped />
