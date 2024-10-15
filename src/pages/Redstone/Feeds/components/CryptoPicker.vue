<template>
  <div class="crypto-picker">
    <SearchableMultiselectDropdown
      :items="formattedItems"
      :value="value"
      @input="handleInput"
      button-text-all="All Cryptos"
      button-text-selected="Selected Cryptos"
    />
  </div>
</template>

<script>2
import SearchableMultiselectDropdown from '@/components/DropdownPicker/DropdownPicker.vue';

export default {
  name: 'CryptoPicker',
  components: {
    SearchableMultiselectDropdown
  },
  props: {
    items: {
      type: Array,
      required: true
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    formattedItems() {
      return this.items.map(item => ({
        value: item.token,
        text: item.token,
        image: item.logoURI
      }));
    }
  },
  methods: {
    handleInput(selectedItems) {
      this.$emit('input', selectedItems);
    }
  }
};
</script>