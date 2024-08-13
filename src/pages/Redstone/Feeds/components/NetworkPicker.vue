<template>
  <div class="crypto-dropdown-container">
    <b-dropdown ref="dropdown" @shown="onDropdownShown" class="dropdown crypto-dropdown" :text="buttonText" multiple>
      <div class="search-input-container">
        <b-form-input
          ref="searchInput"
          variant="danger"
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          class="pr-4"
        ></b-form-input>
      </div>
      <b-dropdown-form>
        <b-form-checkbox-group v-model="tempSelected" class="crypto-checkbox-group" stacked>
          <b-form-checkbox
            class="crypto-checkbox-list"
            variant="danger"
            v-for="item in sortedFilteredItems"
            :key="item.value"
            :value="item.value"
          >
            <span class="network-name">{{ item.label }}</span>
          </b-form-checkbox>
        </b-form-checkbox-group>
        <span class="no-results" v-if="sortedFilteredItems.length === 0">{{ noResultsText }}</span>
      </b-dropdown-form>
      <div v-if="hasChanges" class="confirm-button-container">
        <b-button @click="confirmChanges" variant="primary" class="confirm-button">Confirm Changes</b-button>
      </div>
      <div v-else-if="value.length > 0" class="confirm-button-container">
        <b-button @click="resetChanges" variant="primary" class="reset-button">Reset Changes</b-button>
      </div>
    </b-dropdown>
  </div>
</template>

<script>
import { BDropdown, BDropdownForm, BFormCheckboxGroup, BFormCheckbox, BFormInput, BButton } from 'bootstrap-vue'

export default {
  name: 'DropdownCheckboxSearch',
  components: {
    BDropdown,
    BDropdownForm,
    BFormCheckboxGroup,
    BFormCheckbox,
    BFormInput,
    BButton,
  },
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
      tempSelected: [],
    };
  },
  created(){
    this.initializeTempSelection()
  },
  computed: {
    filteredItems() {
      return this.items.filter(item =>
        item.label.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    sortedFilteredItems() {
      return [...this.filteredItems].sort((a, b) => {
        const aSelected = this.value.includes(a.value);
        const bSelected = this.value.includes(b.value);
        if (aSelected === bSelected) {
          return a.label.localeCompare(b.label);
        }
        return aSelected ? -1 : 1;
      });
    },
    buttonText() {
      const selectedCount = this.value.length;
      const optionsCount = this.items.length;
      return selectedCount === 0 ? `${this.defaultButtonText} (${optionsCount})` : `Networks (${selectedCount})`;
    },
    hasChanges() {
      return !this.arraysEqual(this.tempSelected, this.value);
    }
  },
  methods: {
    initializeTempSelection() {
      this.tempSelected = [...this.value];
    },
    clearSearch() {
      this.searchQuery = '';
    },
    confirmChanges() {
      this.$emit('input', this.tempSelected)
      this.closeDropdown()
    },
    resetChanges() {
      this.$emit('input', [])
      this.closeDropdown()
    },
    closeDropdown() {
      this.$refs.dropdown.hide();
    },
    onDropdownShown() {
      this.initializeTempSelection();
      this.$nextTick(() => {
        this.$refs.searchInput.focus();
      });
    },
    arraysEqual(arr1, arr2) {
      if (arr1.length !== arr2.length) return false;
      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
      }
      return true;
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
  font-size: 14px;
  font-weight: 300;
}

.crypto-dropdown-container {
  position: relative;
  z-index: 999;
}

.dropdown {
  margin: 0 !important;

  ul {
    min-width: 250px;
  }

  button {
    padding: 10px 18px;
    font-size: 14px;
    background: #fff;
    border: 2px solid #e4e4e4;

    &:hover {
      background: #fff;
      color: #1a1414;
    }
  }
}

.crypto-dropdown {
  width: 100%;

  .b-dropdown-form {
    padding: 0;
    max-height: 300px;
    overflow-y: auto;
  }

  ul {
    width: 100%;
    left: 0;
    top: 100% !important;
    transform: none !important;
  }

  .crypto-checkbox-list {
    border-bottom: 1px solid rgb(228, 228, 228);
    margin: 5px 0;
    padding: 8px 10px;
  }

  .no-results {
    text-align: center;
    display: block;
    width: 100%;
    padding: 15px;
    color: gray;
  }

  .confirm-button-container {
    position: sticky;
    bottom: 0;
    background: #fff;
    padding: 10px;
    border-top: 1px solid #e4e4e4;
    text-align: center;
  }

  .confirm-button {
    width: 100%;
    background-color: var(--redstone-red-color);
    border-color: var(--redstone-red-color);

    &:hover, &:focus {
      background-color: darken(#FD627A, 10%);
      border-color: darken(#FD627A, 10%);
    }
  }
}

.search-input-container {
  position: sticky;
  top: 0px;
  background: #fff;
  z-index: 2;
  .form-control {
    border: none;
    border-bottom: 1px solid rgb(192, 192, 192);
    border-radius: 0;
    padding: 20px;

    &:active,&:focus {
      border-color: var(--redstone-red-color);
    }
  }
}

.dropdown-menu {
  padding: 0 !important;
}

.dropdown.show {
  button {
    background: var(--redstone-red-color) !important;
    border: 2px solid darken(#FD627A, $amount: 15) !important;
  }
}
</style>