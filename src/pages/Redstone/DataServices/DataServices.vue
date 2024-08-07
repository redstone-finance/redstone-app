<template>
  <div class="providers-wrapper">
    <b-row class="justify-content-center">
      <b-col cols="12" class="widget-col" v-for="(provider, id) in filteredProviders" :key="id">
        <div class="widget-wrapper" @click="$router.push('/app/data-services/' + id)">
          <Widget class="mb-0 provider-card">
            <div class="provider-details">
              <div class="provider-logo">
                <img v-if="provider.logo" :src="provider.logo" />
              </div>
              <div>
                <h6 class="provider-name">
                  {{ provider.name }}
                </h6>
                <span class="provider-id">id: {{ id }}</span>
              </div>
              <!-- <Rating :value="provider.rating" :disabled="true"></Rating> -->
              <div class="provider-description">
                {{ provider.description }}
              </div>
              <!-- <div class="provider-categories">
              <span v-for="(category, index) in provider.categories" :key="category">{{ styleCategory(category, provider.categories.length, index) }}</span>
            </div> -->
              <!-- <div class="provider-active-date">
                <div>
                  <label> Active from </label>
                </div>
                <div>
                  <span v-if="provider.activeFrom">
                    {{ provider.activeFrom | date }}
                  </span>
                  <vue-loaders-ball-beat
                    v-else
                    color="var(--redstone-red-color)"
                    scale="0.5"
                    ></vue-loaders-ball-beat>
                </div>
              </div> -->
              <div class="provider-nodes">
                <div>
                  <label> Nodes </label>
                </div>
                <div>
                  {{ provider?.nodes?.length ?? 0 }}
                </div>
              </div>
              <div class="provider-assets">
                <div>
                  <label> Assets </label>
                </div>
                <div>
                  {{ provider?.assetsCount ?? 0 }}
                </div>
              </div>
              <div class="provider-interval">
                <div>
                  <label> Interval </label>
                </div>
                <div>
                  {{
                    provider?.currentManifest?.interval
                      ? formatInterval(provider.currentManifest.interval)
                      : '-'
                  }}
                </div>
              </div>
              <!-- <div class="provider-points">
                <div>
                  <label> Data points </label>
                </div>
                <div>
                  <span v-if="provider.dataPoints">
                    {{ provider.dataPoints | bigInt }}
                  </span>
                  <vue-loaders-ball-beat
                    v-else
                    color="var(--redstone-red-color)"
                    scale="0.5"
                  ></vue-loaders-ball-beat>  
                </div>
              </div> -->
              <!-- <div class="provider-stake">
                <div>
                  <label> Stake </label>
                </div>
                <div>
                  <span v-if="provider.stakedTokens !== undefined">
                    {{ provider.stakedTokens }}
                  </span>
                  <vue-loaders-ball-beat
                    v-else
                    color="var(--redstone-red-color)"
                    scale="0.5"
                  ></vue-loaders-ball-beat>  
                </div>
              </div> -->
              <!-- <div class="provider-www">
                <a
                  :href="provider.profile.url"
                  target="_blank"
                  @click.stop="() => {}"
                >
                <i class="fa fa-external-link" />
                </a>
              </div> -->
            </div>
          </Widget>
        </div>
      </b-col>
    </b-row>
    <b-row v-if="providers == null" class="justify-content-center">
      <b-col v-for="n in 4" :key="n" cols="12">
        <div class="preloader provider-card-preloader"></div>
      </b-col>
    </b-row>
    <b-row
      v-if="filteredProviders && Object.keys(filteredProviders) == 0"
      class="justify-content-center"
    >
      No results matching criteria
    </b-row>
  </div>
</template>

<script>
  import Rating from '@/components/Rating/Rating'
  import _ from 'lodash'
  import { mapState } from 'vuex'

  export default {
    name: 'DataServices',

    data() {
      return {}
    },

    created() {},

    computed: {
      ...mapState('prefetch', {
        providers: (state) => {
          return state.providers
        },
      }),

      searchPhrase() {
        let search = this.$route.query.search
        return search != null ? search : ''
      },

      filteredProviders() {
        if (this.providers) {
          let filterProviders = {}

          Object.entries(this.providers).forEach(([key, value]) => {
            if (value.name.toLowerCase().includes(this.searchPhrase.toLowerCase())) {
              filterProviders[key] = value
            }
          })

          return filterProviders
        }
      },
    },

    methods: {
      styleCategory(text, numberOfCategories, index) {
        return _.startCase(text) + (index < numberOfCategories - 1 ? ', ' : '')
      },
    },

    components: {
      Rating,
    },
  }
</script>

<style src="./DataServices.scss" lang="scss" scoped />
