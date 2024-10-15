<template>
  <div class="multiselect-dropdown-container">
    <b-dropdown
      ref="dropdown"
      @shown="onDropdownShown"
      class="dropdown multiselect-dropdown"
      :text="buttonText"
      multiple
    >
      <div class="search-input-container">
        <b-form-input
          ref="searchInput"
          v-model="searchQuery"
          placeholder="Search..."
          class="pr-4"
        ></b-form-input>
      </div>
      <b-dropdown-form>
        <b-form-checkbox-group
          class="checkbox-group"
          v-model="tempSelectedItems"
          stacked
        >
          <b-form-checkbox
            class="checkbox-list-item"
            v-for="item in filteredItems"
            :key="item.value"
            :value="item.value"
          >
            <div class="item-content">
              <b-img
                v-if="item.image"
                :src="item.image"
                :alt="item.text"
                width="20"
                height="20"
                class="mr-2"
              />
              <span class="item-text" :title="item.text">{{ item.text }}</span>
            </div>
          </b-form-checkbox>
        </b-form-checkbox-group>
        <span class="no-results" v-if="filteredItems.length === 0"
          >No results found</span
        >
      </b-dropdown-form>
      <div v-if="hasChanges" class="confirm-button-container">
        <b-button
          @click="confirmChanges"
          variant="primary"
          class="confirm-button"
        >
          Apply ({{ tempSelectedItems.length }})
        </b-button>
      </div>
      <div v-else-if="value.length > 0" class="confirm-button-container">
        <b-button @click="resetChanges" variant="primary" class="reset-button">
          Reset ({{ tempSelectedItems.length }})
        </b-button>
      </div>
    </b-dropdown>
  </div>
</template>

<script>
  export default {
    name: "SearchableMultiselectDropdown",
    props: {
      items: {
        type: Array,
        default: () => [],
      },
      value: {
        type: Array,
        default: () => [],
      },
      buttonTextAll: {
        type: String,
        default: "All Items",
      },
      buttonTextSelected: {
        type: String,
        default: "Selected Items",
      },
    },
    data() {
      return {
        searchQuery: "",
        tempSelectedItems: [],
      };
    },
    computed: {
      buttonText() {
        const selectedCount = this.value.length;
        const optionsCount = this.items.length;
        return selectedCount === 0
          ? `${this.buttonTextAll} (${optionsCount})`
          : `${this.buttonTextSelected} (${selectedCount})`;
      },
      filteredItems() {
        if (!this.searchQuery) {
          return this.items;
        }
        const query = this.searchQuery.toLowerCase();
        return this.items.filter((item) =>
          item.text.toLowerCase().includes(query)
        );
      },
      hasChanges() {
        return !this.arraysEqual(this.tempSelectedItems, this.value);
      },
    },
    created() {
      this.initializeTempSelection();
    },
    watch: {
      value: {
        handler(newValue) {
          this.tempSelectedItems = [...newValue];
        },
        immediate: true,
      },
    },
    methods: {
      initializeTempSelection() {
        this.tempSelectedItems = [...this.value];
      },
      confirmChanges() {
        this.$emit("input", this.tempSelectedItems);
        this.closeDropdown();
      },
      resetChanges() {
        this.$emit("input", []);
        this.closeDropdown();
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
      },
    },
  };
</script>

<style scoped lang="scss">
  .multiselect-dropdown-container {
    position: relative;
    z-index: 999;

    .dropdown.show {
      ::v-deep button {
        background: #fd627a;
        border: 2px solid darken(#fd627a, 15%) !important;
      }
    }

    .dropdown {
      margin: 0 !important;
      width: 100%;

      ::v-deep ul {
        min-width: 300px !important;
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

    .multiselect-dropdown {
      .custom-control {
        margin: 0 !important;
        line-height: 2rem;

        &:hover {
          background-color: rgb(243, 243, 243);
        }

        * {
          cursor: pointer;
        }
      }

      .custom-control-label {
        width: calc(100% - 30px) !important;
      }

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

      ::v-deep label {
        padding-left: 10px;
        margin-left: 20px;

        &:focus,
        &:active {
          &::before {
            border-color: #fd627a !important;
          }
        }

        &::before,
        &::after {
          width: 20px;
          height: 20px;
        }
      }

      ::v-deep input:checked + label {
        &::before {
          background-color: #fd627a !important;
          border-color: #fd627a !important;
        }
      }

      .checkbox-list-item {
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

        button {
          width: 100%;
        }
      }

      .confirm-button {
        width: 100%;
        background-color: #fd627a;
        border-color: #fd627a;

        &:hover,
        &:focus {
          background-color: darken(#fd627a, 10%);
          border-color: darken(#fd627a, 10%);
          color: #fff;
        }
      }
    }

    .dropdown.show button.reset-button {
      width: 100%;
      background: #fff !important;
      color: #fd627a !important;
      border-color: #fd627a;

      &:hover,
      &:focus {
        background-color: darken(#fd627a, 10%);
        border-color: darken(#fd627a, 10%);
        color: #fff;
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
      padding: 25px 20px !important;
      font-style: italic;

      &:active,
      &:focus {
        border-color: #fd627a;
      }
    }
  }

  .item-content {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 300;

    .item-text {
      flex-grow: 1;
    }
  }
</style>
