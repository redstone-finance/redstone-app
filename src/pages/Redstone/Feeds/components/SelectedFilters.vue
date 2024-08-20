<template>
  <div class="selected-filters-container">
    <div class="selected-filters-flex">
      <div
        v-for="filter in filters"
        :key="filter.key"
        class="selected-filters__item"
        @click="removeFilter(filter)"
      >
        <img
          :src="filter.imageUrl"
          :title="`Click to remove filter: ${filter.name}`"
          :alt="filter.name"
          class="selected-filters__icon"
        />
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "SelectedFiltersList",
    props: {
      filters: {
        type: Array,
        required: true,
      },
    },
    methods: {
      removeFilter(filter) {
        this.$emit("remove", filter.key);
      },
    },
  };
</script>

<style scoped>
  .selected-filters-container {
  width: 100%;
}

.selected-filters-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.selected-filters__item {
  flex: 0 0 auto;
  cursor: pointer;
  position: relative;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.selected-filters__icon {
  max-width: 70%;
  max-height: 70%;
  object-fit: contain;
  border-radius: 30px;
}
</style>
