<template>
  <div>
    <div class="mb-lg">
      <b-row>
        <b-col md="6" xl="4" lg="4" sm="6" xs="12" v-for="(token, index) in tokens" :key="index">
          <div class="pb-xlg" @click="$router.push('/app/token/' + token.symbol)">
            <Widget class="mb-0 token-card">
              <div class="token-details">
                <div class="token-logo">
                  <img v-if="token.logoURI" :src="token.logoURI" style="max-height: 30px; max-width: 30px;">
                  <span class="no-token-emoji" v-else>🤔</span>
                </div>
                
                <h4 class="token-name">
                  {{ getTokenName(token) }}
                </h4>
                <h2
                  style="position:absolute; right:20px; top: 22px; font-size: 16px;">
                  <span v-if="token.price">
                    {{ token.price | price }}
                  </span>
                  <vue-loaders-ball-beat
                    v-else
                    color="var(--redstone-red-color)"
                    scale="0.5"
                  ></vue-loaders-ball-beat>
                </h2>
              </div>
            </Widget>
          </div>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import Widget from "@/components/Widget/Widget";

export default {
  name: 'Tokens',

  props: {
    tokens: Array,
  },

  methods: {
    getTokenName(token) {
      if (token.name.length > 10) {
        return token.symbol;
      } else {
        return token.name;
      }
    }
  },

  components: {
    Widget,
  },
}
</script>

<style lang="scss" scoped>

.token-card {
  min-height: 60px;
  cursor: pointer;
  transition: all 0.5s ease;

  &:hover {
    transform: scale(1.1);
  }

  .token-details {
    display: grid;
    align-items: center;
    grid-template-columns: 40px auto 80px;

    .no-token-emoji {
      font-size: 20px;
    }

    .token-name {
      margin-bottom: 0px;
      margin-left: 10px;
      font-size: 18px;
    }
  }
}

</style>