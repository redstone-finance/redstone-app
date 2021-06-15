<template>
  <div>
    <div class="mb-lg">
      <b-row>
        <b-col xl="4" lg="6" md="12" sm="12" xs="12" class="py-1 py-md-2" v-for="(token, index) in tokens" :key="index">
          <div class="pb-xlg" @click="$router.push('/app/token/' + token.symbol)">
            <Widget class="mb-0 token-card">
              <b-row class="token-details">
                <b-col cols="2" class="token-logo">
                  <img v-if="token.logoURI" :src="token.logoURI">
                  <span class="no-token-emoji" v-else>🤔</span>
                </b-col>
                
                <b-col 
                cols="5" 
                sm="4" 
                md="6"
                class="h4 token-title pr-0">
                  {{ getTokenName(token) }}
                  <br>
                  <div class="token-name">
                  {{ token.name != getTokenName(token) ? token.name : ""}}
                  </div>
                </b-col>
                <b-col
                  cols="5"
                  sm="6"
                  md="4"
                  class="token-price pl-0">
                  <span v-if="token.price">
                    {{ token.price | price }}
                  </span>
                  <vue-loaders-ball-beat
                    v-else
                    color="var(--redstone-red-color)"
                    scale="0.5"
                  ></vue-loaders-ball-beat>
                </b-col>
              </b-row>
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
  min-height: 65px;
  cursor: pointer;
  transition: all 0.5s ease;

  &:hover {
    transform: scale(1.1);
  }

  .token-details {
    display: flex;
    align-items: center;
    grid-template-columns: 40px auto 80px;

    .no-token-emoji {
      font-size: 20px;
    }

    .token-logo img {
      width: 30px;
      max-width: 30px;
      height: 30px;
      max-height: 30px;
    }

    .token-title {
      margin-bottom: 0px;
      font-size: 18px;
      white-space: nowrap;

      .token-name {
        font-size: 12px; 
        color: gray;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    .token-price {
      font-size: 16px;
      text-align: right;
    }
  }
}

</style>
