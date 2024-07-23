<template>
  <b-dropdown :text="buttonText" class="m-2">
    <b-dropdown-form>
      <div class="d-flex mb-2">
        <b-form-input v-model="searchQuery" :placeholder="searchPlaceholder" class="pr-4" />
        <span class="remove-query" v-b-tooltip.hover title="Clear query" icon @click="clearSearch">
          &times;
          <span class="sr-only">Clear search</span>
        </span>
      </div>
      <div style="max-height: 200px; overflow-y: auto;">
        <template v-if="filteredItems.length">
          <b-form-checkbox v-for="item in filteredItems" :key="item.value" :checked="isSelected(item.value)"
            @change="toggleSelection(item.value)">
            {{ item.label }}
          </b-form-checkbox>
        </template>
        <p v-else class="text-muted">
          {{ noResultsText }}
        </p>
      </div>
    </b-dropdown-form>
  </b-dropdown>
</template>

<script>
export default {
  name: 'DropdownCheckboxSearch',
  props: {
    items: {
      type: Array,
      required: true
    },
    value: {
      type: Array,
      default: () => []
    },
    searchPlaceholder: {
      type: String,
      default: 'Search...'
    },
    defaultButtonText: {
      type: String,
      default: 'All networks'
    },
    noResultsText: {
      type: String,
      default: 'No matching options found'
    }
  },
  data() {
    return {
      searchQuery: '',
      localSelected: this.value
    };
  },
  computed: {
    filteredItems() {
      return this.items.filter(item =>
        item.label.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    buttonText() {
      const selectedCount = this.localSelected.length
      const optionsCount = this.items.length
      return selectedCount === 0 ? `${this.defaultButtonText} (${optionsCount})` : `Networks (${selectedCount})`;
    }
  },
  watch: {
    value(newValue) {
      this.localSelected = newValue;
    }
  },
  methods: {
    isSelected(value) {
      return this.localSelected.includes(value);
    },
    toggleSelection(value) {
      if (this.isSelected(value)) {
        this.localSelected = this.localSelected.filter(itemValue => itemValue !== value);
      } else {
        this.localSelected = [...this.localSelected, value];
      }
      this.$emit('input', this.localSelected);
    },
    clearSearch() {
      this.searchQuery = '';
    }
  }
};
</script>

<style lang="scss">
.remove-query {
  line-height: 15px;
  position: absolute;
  right: 25px;
  padding: 10px;

  &:hover {
    cursor: pointer;
    color: var(--redstone-red-color)
  }
}
</style>