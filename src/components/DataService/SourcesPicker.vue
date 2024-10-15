<template>
  <div class="crypto-picker">
    <SearchableMultiselectDropdown
      :items="formattedItems"
      :value="value"
      @input="handleInput"
      button-text-all="All Sources"
      button-text-selected="Selected sources"
    />
  </div>
</template>

<script>
  2;
  import SearchableMultiselectDropdown from "@/components/DropdownPicker/DropdownPicker.vue";

  export default {
    name: "CryptoPicker",
    components: {
      SearchableMultiselectDropdown,
    },
    props: {
      items: {
        type: Array,
        required: true,
      },
      tokens: {
        type: Array,
        required: true,
      },
      value: {
        type: Array,
        default: () => [],
      },
    },
    computed: {
      formattedItems() {
        const tokens = this.tokens;
        const tokenSources = new Set(
          tokens.flatMap((token) =>
            token.source?.map((source) => source.name.split("-")[0])
          )
        );

        const mappedItems = this.items
          .filter((item) => {
            const itemSource = item.id.split("-")[0];
            return tokenSources.has(itemSource);
          })
          .map((item) => {
            const idParts = item.id.split("-");
            const value = idParts[0];
            return {
              value,
              text: value,
              image: item.logoURI,
            };
          });

        const uniqueItems = Array.from(
          mappedItems
            .reduce((map, item) => {
              if (!map.has(item.value) && item.value !== "custom") {
                map.set(item.value, item);
              }
              return map;
            }, new Map())
            .values()
        );

        return uniqueItems;
      },
    },
    methods: {
      handleInput(selectedItems) {
        this.$emit("input", selectedItems);
      },
    },
  };
</script>
