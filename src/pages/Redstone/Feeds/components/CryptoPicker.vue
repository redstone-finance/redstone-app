<template>
  <div class="crypto-dropdown-container">
    <b-dropdown
      ref="dropdown"
      @shown="onDropdownShown"
      class="dropdown crypto-dropdown"
      :text="buttonText"
      multiple
    >
      <div class="search-input-container">
        <b-form-input
          ref="searchInput"
          variant="danger"
          v-model="searchQuery"
          placeholder="Search..."
          class="pr-4"
        ></b-form-input>
      </div>
      <b-dropdown-form>
        <b-form-checkbox-group
          class="crypto-checkbox-group"
          v-model="tempSelectedCryptos"
          stacked
        >
          <b-form-checkbox
            class="crypto-checkbox-list"
            variant="danger"
            v-for="crypto in sortedFilteredCryptoImageData"
            :key="crypto.token"
            :value="crypto.token"
          >
            <div class="crypto-name">
              <b-img
                :title="crypto.name"
                :src="crypto.imageName"
                :alt="crypto.name"
                width="20"
                height="20"
                class="mr-1"
              />
              <span :title="crypto.name">{{ crypto.token }}</span>
            </div>
          </b-form-checkbox>
        </b-form-checkbox-group>
        <span
          class="no-results"
          v-if="sortedFilteredCryptoImageData.length === 0"
          >No results found</span
        >
      </b-dropdown-form>
      <div v-if="hasChanges" class="confirm-button-container">
        <b-button
          @click="confirmChanges"
          variant="primary"
          class="confirm-button"
        >
          <i class="fa fa-icon fa-sliders mr-2"></i>Filter ({{
            tempSelectedCryptos.length
          }})
        </b-button>
      </div>
      <div v-else-if="value.length > 0" class="confirm-button-container">
        <b-button @click="resetChanges" variant="primary" class="reset-button"
          >Reset ({{ tempSelectedCryptos.length }})</b-button
        >
      </div>
    </b-dropdown>
  </div>
</template>

<script>
  import {
    BDropdown,
    BDropdownForm,
    BFormCheckboxGroup,
    BFormCheckbox,
    BImg,
    BFormInput,
    BButton,
  } from "bootstrap-vue";

  export default {
    name: "CryptoMultiselectDropdown",
    components: {
      BDropdown,
      BDropdownForm,
      BFormCheckboxGroup,
      BFormCheckbox,
      BImg,
      BFormInput,
      BButton,
    },
    props: {
      items: {
        type: Array,
        default: () => [],
      },
      value: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        searchQuery: "",
        tempSelectedCryptos: [],
      };
    },
    computed: {
      buttonText() {
        const selectedCount = this.value.length;
        const optionsCount = this.items.length;
        return selectedCount === 0
          ? `All feeds (${optionsCount})`
          : `Feeds (${selectedCount})`;
      },
      filteredCryptoImageData() {
        if (!this.searchQuery) {
          return this.items;
        }
        const query = this.searchQuery.toLowerCase();
        return this.items.filter(
          (crypto) =>
            crypto.token.toLowerCase().includes(query) ||
            crypto.name.toLowerCase().includes(query)
        );
      },
      sortedFilteredCryptoImageData() {
        return [...this.filteredCryptoImageData].sort((a, b) => {
          const aSelected = this.value.includes(a.token);
          const bSelected = this.value.includes(b.token);
          if (aSelected === bSelected) {
            return a.token.localeCompare(b.token);
          }
          return aSelected ? -1 : 1;
        });
      },
      hasChanges() {
        return !this.arraysEqual(this.tempSelectedCryptos, this.value);
      },
    },
    created() {
      this.initializeTempSelection();
    },
    methods: {
      initializeTempSelection() {
        this.tempSelectedCryptos = [...this.value];
      },
      uncheck(token) {
        const index = this.tempSelectedCryptos.indexOf(token);
        if (index > -1) {
          this.tempSelectedCryptos.splice(index, 1);
        }
      },
      getCryptoByToken(token) {
        return (
          this.items.find((crypto) => crypto.token === token) || {
            name: token,
            imageName: "",
          }
        );
      },
      confirmChanges() {
        this.$emit("input", this.tempSelectedCryptos);
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
<style lang="scss">
  .remove-query {
  line-height: 15px;

  &:hover {
    cursor: pointer;
    color: var(--redstone-red-color)
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
      border-color: var(--redstone-red-color);
    }
  }
}

.dropdown-menu {
  padding: 0 !important;
}

.crypto-dropdown-container {
  position: relative;
  z-index: 999;
}

.dropdown.show {
  button {
    background: var(--redstone-red-color);
    border: 2px solid darken(#FD627A, $amount: 15) !important;
  }
}

.crypto-name {
  font-size: 14px;
  font-weight: 300;
}

.dropdown {
  margin: 0 !important;

  ul {
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

.crypto-dropdown {
  width: 100%;

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

  label {
    padding-left: 10px;
    margin-left: 20px;

    &:focus,
    &:active {
      &::before {
        border-color: var(--redstone-red-color) !important;
      }
    }

    &::before,
    &::after {
      width: 20px;
      height: 20px;
    }
  }

  input:checked+label {
    &::before {
      background-color: var(--redstone-red-color) !important;
      border-color: var(--redstone-red-color) !important;
    }
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

    button {
      width: 100%;
    }
  }

  .confirm-button {
    width: 100%;
    background-color: var(--redstone-red-color);
    border-color: var(--redstone-red-color);

    &:hover,
    &:focus {
      background-color: darken(#FD627A, 10%);
      border-color: darken(#FD627A, 10%);
      color: #fff;
    }
  }
}

.dropdown.show button.reset-button {
  width: 100%;
  background: #fff !important;
  color: var(--redstone-red-color) !important;
  border-color: var(--redstone-red-color);

  &:hover,
  &:focus {
    background-color: darken(#FD627A, 10%);
    border-color: darken(#FD627A, 10%);
    color: #fff;
  }
}
</style>
