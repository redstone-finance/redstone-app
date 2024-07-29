<template>
  <div class="crypto-dropdown-container">
    <b-dropdown class="dropdown crypto-dropdown" :text="buttonText" multiple>
      <div class="search-input-container">
        <b-form-input variant="danger" v-model="searchQuery" placeholder="Search..." class="pr-4"></b-form-input>
      </div>
      <b-dropdown-form>
        <b-form-checkbox-group class="crypto-checkbox-group" v-model="internalSelectedCryptos" stacked>
          <b-form-checkbox class="crypto-checkbox" variant="danger" v-for="crypto in filteredCryptoImageData"
            :key="crypto.token" :value="crypto.token">
           <div class="crypto-name">
            <b-img :title="crypto.name" :src="getImageUrl(crypto.imageName)" :alt="crypto.name" width="20" height="20"
              class="mr-1" />
            <span :title="crypto.name">{{ crypto.token }}</span>
           </div>
          </b-form-checkbox>
        </b-form-checkbox-group>
        <span class="no-results" v-if="filteredCryptoImageData.length === 0">No results found</span>
      </b-dropdown-form>
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
} from 'bootstrap-vue'

export default {
  name: 'CryptoMultiselectDropdown',
  components: {
    BDropdown,
    BDropdownForm,
    BFormCheckboxGroup,
    BFormCheckbox,
    BImg,
    BFormInput,
  },
  props: {
    items: {
      type: Array,
      default: () => []
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchQuery: '',
    }
  },
  computed: {
    buttonText() {
      const selectedCount = this.value.length
      const optionsCount = this.items.length
      return selectedCount === 0 ? `All currencies (${optionsCount})` : `Currencies (${selectedCount})`;
    },
    internalSelectedCryptos: {
      get() {
        return this.value
      },
      set(newValue) {
        this.$emit('input', newValue)
      }
    },
    filteredCryptoImageData() {
      if (!this.searchQuery) {
        return this.items;
      }
      const query = this.searchQuery.toLowerCase();
      return this.items.filter(crypto =>
        crypto.token.toLowerCase().includes(query) ||
        crypto.name.toLowerCase().includes(query)
      );
    }
  },
  methods: {
    uncheck(token) {
      const updatedSelection = this.internalSelectedCryptos.filter(crypto => crypto !== token)
      this.$emit('input', updatedSelection)
    },
    getImageUrl(imageName) {
      return `/logos/${imageName}`
    },
    getCryptoByToken(token) {
      return this.items.find(crypto => crypto.token === token) || { name: token, imageName: '' }
    }
  }
}
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
    padding: 20px;

    &:active,&:focus {
      border-color: var(--redstone-red-color);
    }
  }
}
.dropdown-menu{
  padding: 0 !important;
}

.crypto-dropdown-container {
  position: relative;
  z-index: 999;
}

.dropdown.show {
  button {
    background: var(--redstone-red-color) !important;
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
  }

  ul {
    width: 100%;
    height: 350px;
    overflow: scroll;
    left: 0;
    top: 100% !important;
    transform: none !important;
  }

  label {
    margin-left: 20px;
    &:focus,&:active{
      &::before{
        border-color: var(--redstone-red-color) !important;
      }
    }
    &::before, &::after{
      width: 15px;
      height: 15px;
    }
  }

  input:checked + label{
    &::before{
      background-color: var(--redstone-red-color) !important;
      border-color: var(--redstone-red-color) !important;
    }
  }

  .crypto-checkbox {
    border-bottom: 1px solid rgb(228, 228, 228);
    margin: 5px 0;
    padding: 8px 10px;
  }
  .no-results{
    text-align: center;
    display: block;
    width: 100%;
    padding: 15px;
    color: gray;
  }
}
</style>