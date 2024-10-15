<template>
  <div class="network-picker">
    <DropdownCheckboxSearch
      :items="formattedItems"
      :value="value"
      @input="handleInput"
      button-text-all="All Networks"
      button-text-selected="Selected Networks"
    />
  </div>
</template>

<script>
import DropdownCheckboxSearch from '@/components/DropdownPicker/DropdownPicker.vue';

export default {
  name: 'NetworkPicker',
  components: {
    DropdownCheckboxSearch
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
        value: item.value,
        text: item.label
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
