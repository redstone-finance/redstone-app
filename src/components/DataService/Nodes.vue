<template>
  <div>
    <b-row class="justify-content-center">
      <b-col
        cols="12"
        class="widget-col"
        v-for="(node, index) in nodes"
        :key="index"
      >
        <a class="widget-wrapper node-wrapper" :href="node.url" target="_blank">
          <Widget class="node-card">
            <div class="node-details">
              <div class="node-logo">
                <img v-if="node.logo" :src="node.logo" />
              </div>
              <h6 class="node-name">
                {{ node.name }}
              </h6>
              <div class="node-description">
                {{ node.description }}
              </div>
              <div class="node-column">
                <div>
                  <label>EVM address</label>
                </div>
                <div
                  @click="(event) => copyToClipboard(event, node.evmAddress)"
                >
                  {{ shortenEvmAddress(node.evmAddress) }}
                  <i
                    class="fa fa-copy copy-icon"
                    v-b-tooltip.hover
                    title="Copy to clipboard"
                  />
                </div>
              </div>

              <!-- Hidden ip addresses temporarily -->
              <!-- <div class="node-column">
                <div>
                  <label>IP address</label>
                </div>
                {{ node.ipAddress }}
              </div> -->
            </div>
          </Widget>
        </a>
      </b-col>
    </b-row>
    <b-row v-if="!nodes" class="justify-content-center">
      <b-col v-for="n in 4" :key="n" cols="12">
        <div class="preloader node-card-preloader"></div>
      </b-col>
    </b-row>
    <b-row v-if="nodes && nodes.length == 0" class="justify-content-center">
      No results matching criteria
    </b-row>
  </div>
</template>

<script>
  export default {
    name: "Nodes",

    props: {
      nodes: [],
    },

    methods: {
      shortenEvmAddress(evmAddress) {
        return `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`;
      },
      async copyToClipboard(event, evmAddress) {
        event.preventDefault();
        await navigator.clipboard.writeText(evmAddress);
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import "~@/styles/app";
.node-wrapper {
  text-decoration: none;
}

.node-card {
  cursor: pointer;
  transition: all 0.5s ease;

  &:hover {
    transform: scale(1.03);
  }
}

.node-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: $gray-750;

  .node-name {
    margin-bottom: 0;
    font-weight: $font-weight-semi-bold;
    font-size: $font-size-larger;
    flex: 0 0 20%;
    color: var(--redstone-dark-blue-color);
  }

  .node-description {
    margin-bottom: 0;
    flex: 0 0 35%;
    font-family: Poppins;
    font-size: $font-size-mini;
    font-weight: $font-weight-thin;
    font-style: italic;
  }

  .node-column {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .label {
    font-size: 12px;
    border-bottom: none;
    color: var(--sidebar-item-active);
  }

  .copy-icon {
    margin-left: 8px;
    color: var(--redstone-red-color);

    &:hover {
      color: $gray-750;
    }
  }

  .node-logo {
    flex: 0 0 5%;

    img {
      width: 50px;
    }
  }
}
</style>
