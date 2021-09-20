<template>
  <div class="sources-wrapper">
    <div class="mb-lg">
      <b-row>
        <b-col
          xxl="3" xl="4" lg="6" md="12" sm="12" xs="12"
          v-for="(source, index) in sources" :key="index"
        >
          <div class="mb-4" @click="$router.push('/app/source/' + source.id)">
            <Widget class="mb-0 source-card">
              <div class="source-details">
                <div class="source-logo">
                  <img :src="source.logoURI" :alt="source.id + '-logo'" />
                </div>
                <div class="source-name">
                  {{ source.id }}
                </div>
                <div class="see-more">
                  See more
                  <i class="fa fa-angle-right" />
                </div>
              </div>
            </Widget>
          </div>
          
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import sources from "redstone-node/dist/src/config/sources.json";

export default {
  data() {
    return {};
  },

  computed: {
    sources() {
      return Object.entries(sources).map(([id, details]) => ({
        id,
        ...details,
      }));
    },
  }
}
</script>

<style lang="scss" src="./Sources.scss" scoped />
