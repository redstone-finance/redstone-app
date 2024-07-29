<template>
  <div class="crypto-dropdown-container">
    <b-dropdown class="dropdown crypto-dropdown" :text="buttonText" multiple>
      <div class="search-input-container">
        <b-form-input variant="danger" v-model="searchQuery" placeholder="Search..." class="pr-4"></b-form-input>
      </div>
      <b-dropdown-form>
        <b-form-checkbox-group v-model="localSelected" class="crypto-checkbox-group" stacked>
          <b-form-checkbox
            class="crypto-checkbox"
            variant="danger"
            v-for="item in filteredItems"
            :key="item.value"
            :value="item.value"
          >
            <span class="network-name">{{ item.label }}</span>
          </b-form-checkbox>
        </b-form-checkbox-group>
        <span class="no-results" v-if="filteredItems.length === 0">{{ noResultsText }}</span>
      </b-dropdown-form>
    </b-dropdown>
  </div>
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
      const selectedCount = this.localSelected.length;
      const optionsCount = this.items.length;
      return selectedCount === 0 ? `${this.defaultButtonText} (${optionsCount})` : `Networks (${selectedCount})`;
    }
  },
  watch: {
    value(newValue) {
      this.localSelected = newValue;
    },
    localSelected(newValue) {
      this.$emit('input', newValue);
    }
  },
  methods: {
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

.network-name {
  position: relative;
  top: 3px;
}
</style>