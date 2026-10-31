# Anime modular character artwork

Original artwork generated for Decide Fate with OpenAI image generation, 2026-10-31.
`anime-parts.png` is a transparent RGBA atlas (1024 × 1536). RGB values in transparent pixels are intentional; display with alpha blending.

The runtime crops faces, hair, torsos, arms, legs and cape in `character-anime.js`, preserving a shared foot anchor. Skin/hair and armor variations use cached canvas color layers. Equipment and race accents are drawn independently; movement and action poses animate joints. There are currently front three-quarter illustrations with mirrored facing, not separately painted four-direction frames. Armor uses one illustrated outfit with color variation; dedicated class outfits remain future artwork.

Legacy saved appearance keys and combat simulation are unchanged. The original vector renderer remains a loading/error fallback.
