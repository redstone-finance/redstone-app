import tokens from "@/config/tokens.json";

export const findLogoForSource = (sourceName, tokensJson = tokens) => {
  // Helper function to calculate similarity between two strings
  function stringSimilarity(str1, str2) {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
    const len = Math.max(str1.length, str2.length);
    let matches = 0;
    for (let i = 0; i < len; i++) {
      if (str1[i] === str2[i]) matches++;
    }
    return matches / len;
  }

  // If sourceName is undefined or empty, return null
  if (!sourceName) return null;

  // Split the source name into parts
  const sourceNameParts = sourceName.split('-');

  let bestMatch = null;
  let highestSimilarity = 0;

  // Iterate through each part of the source name
  for (const part of sourceNameParts) {
    const potentialTokenName = part.toLowerCase();

    // Iterate through the tokens in tokensJson
    for (const [key, token] of Object.entries(tokensJson)) {
      // Check similarity with the key
      const keySimilarity = stringSimilarity(key.toLowerCase(), potentialTokenName);
      if (keySimilarity > highestSimilarity) {
        highestSimilarity = keySimilarity;
        bestMatch = token;
      }

      // Check similarity with the symbol (if available)
      if (token.symbol) {
        const symbolSimilarity = stringSimilarity(token.symbol.toLowerCase(), potentialTokenName);
        if (symbolSimilarity > highestSimilarity) {
          highestSimilarity = symbolSimilarity;
          bestMatch = token;
        }
      }

      // Check similarity with the name (if available)
      if (token.name) {
        const nameSimilarity = stringSimilarity(token.name.toLowerCase(), potentialTokenName);
        if (nameSimilarity > highestSimilarity) {
          highestSimilarity = nameSimilarity;
          bestMatch = token;
        }

        // Also check each word in the name separately
        const nameWords = token.name.toLowerCase().split(' ');
        for (const word of nameWords) {
          const wordSimilarity = stringSimilarity(word, potentialTokenName);
          if (wordSimilarity > highestSimilarity) {
            highestSimilarity = wordSimilarity;
            bestMatch = token;
          }
        }
      }
    }

    // If we found a very good match (similarity > 0.8), we can stop searching
    if (highestSimilarity > 0.8) break;
  }

  // Return the logoURI if a match is found, otherwise null
  return bestMatch ? bestMatch.logoURI : null;
};