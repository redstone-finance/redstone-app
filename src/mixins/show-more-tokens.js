export default {
  data: () => {
    return {
      visibleTokensSymbols: new Set(),
      visibleTokens: [],
      allTokensVisible: false,
      VISIBLE_CHUNK_SIZE: 30,
    }
  },
  created() {
    this.visibleTokens = []
    this.visibleTokensSymbols = new Set()
  },
  methods: {
    showMoreTokens() {
      if (this.tokens) {
        let tokensLeftToShow = this.VISIBLE_CHUNK_SIZE

        for (const token of this.tokens) {
          const symbol = token.symbol

          if (tokensLeftToShow <= 0) {
            break
          }

          if (!this.visibleTokensSymbols.has(symbol)) {
            this.visibleTokens.push(token)
            tokensLeftToShow--
            this.visibleTokensSymbols.add(symbol)
          }
        }

        if (tokensLeftToShow > 0) {
          this.allTokensVisible = true
        }
      }
    },
  },
}
