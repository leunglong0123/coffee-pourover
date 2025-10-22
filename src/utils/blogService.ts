import { BlogPost, calculateReadingTime, generateSlug } from './blogTypes';

// In a production app, this would be fetched from a CMS or database
// For this demo, we'll use local storage to persist blog posts
const STORAGE_KEY = 'coffee-pourover-blog-posts';

// Sample blog posts for initial data
const sampleBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Perfect Hario V60 Pour-Over Technique',
    slug: 'perfect-hario-v60-pourover-technique',
    author: 'Coffee Expert',
    date: '2023-08-15T08:00:00Z',
    content: `
# The Perfect Hario V60 Pour-Over Technique

Pour-over coffee is an art form that allows you to extract the delicate flavors of specialty coffee beans. The Hario V60 is one of the most popular brewing methods for this purpose, known for its conical design and spiral ridges.

## What You'll Need

* Hario V60 dripper
* Hario V60 paper filter
* Fresh coffee beans (medium-fine grind)
* Gooseneck kettle
* Digital scale
* Timer
* Mug or server

## The Brewing Process

### Step 1: Preparation

Start by boiling filtered water to 200°F (93°C). While the water is heating, grind 15g of coffee beans to a medium-fine consistency, similar to table salt.

Place the paper filter in the V60 and rinse it thoroughly with hot water. This removes any paper taste and preheats your dripper and vessel.

### Step 2: The Bloom

Place your V60 on a scale with your mug or server beneath it. Add the ground coffee and make a small well in the center. Start your timer and pour 30g of water (twice the weight of the coffee) in a circular motion, making sure all grounds are saturated.

Let it bloom for 30-45 seconds. During this time, CO2 is released from the coffee, which can disrupt extraction if not allowed to escape first.

### Step 3: The Pour

After the bloom, slowly pour water in a gentle, circular motion, starting from the center and moving outward, then back to the center. Avoid pouring directly onto the filter. Pour until you reach 250g of water total (a 1:16.7 coffee-to-water ratio).

The entire brew should take between 2:30 and 3:00 minutes. If it's faster, your grind is too coarse; if it's slower, your grind is too fine.

## Variables to Experiment With

* Coffee-to-water ratio (try 1:15 to 1:17)
* Water temperature (91-94°C)
* Grind size (slightly finer or coarser)
* Pour rate (faster or slower)
* Number of pours (continuous vs. pulse brewing)

By mastering the V60 technique and experimenting with these variables, you'll be able to brew a clean, flavorful cup that showcases the unique characteristics of your favorite coffee beans.

Happy brewing!
    `,
    excerpt: 'Learn the step-by-step process to brew the perfect cup of coffee using the Hario V60 pour-over method, from preparation to pouring techniques.',
    coverImage: '/images/blog/hario-v60.png',
    tags: ['brewing techniques', 'Hario V60', 'pour-over', 'coffee guide'],
    readingTime: 4,
    relatedPosts: ['2', '3']
  },
  {
    id: '2',
    title: 'Understanding Coffee-to-Water Ratios',
    slug: 'understanding-coffee-to-water-ratios',
    author: 'Brew Master',
    date: '2023-07-28T10:30:00Z',
    content: `
# Understanding Coffee-to-Water Ratios

The coffee-to-water ratio is one of the most critical factors in brewing delicious coffee. It's the foundation upon which extraction is built, and getting it right can make the difference between a balanced, flavorful cup and one that's either weak and underwhelming or bitter and overwhelming.

## The Golden Ratio

The Specialty Coffee Association (SCA) recommends a "golden ratio" of 1:18 (1g of coffee for every 18g of water). However, this is just a starting point. Many coffee enthusiasts prefer a slightly stronger ratio between 1:15 and 1:17.

## How Ratios Affect Your Brew

* **Stronger Ratio (e.g., 1:14)**: More coffee relative to water creates a more concentrated, fuller-bodied cup. This might bring out more sweetness and body, but could mask delicate flavors.

* **Weaker Ratio (e.g., 1:18)**: Less coffee relative to water produces a lighter, sometimes clearer cup that can highlight acidity and subtle flavor notes, but might lack body.

## Finding Your Perfect Ratio

The best ratio depends on:

1. **Coffee Origin and Roast**: Lighter roasts often benefit from a stronger ratio to extract their harder, denser beans. Darker roasts may need a weaker ratio to avoid over-extraction and bitterness.

2. **Brewing Method**: Different methods extract coffee differently:
   - Pour-over: 1:16 to 1:17
   - French Press: 1:14 to 1:16
   - Aeropress: 1:15 to 1:18
   - Espresso: 1:2 to 1:2.5

3. **Personal Preference**: Ultimately, the perfect ratio is the one that tastes best to you!

## Measuring Accurately

For consistency, always measure by weight (grams) rather than volume. Coffee density varies greatly depending on origin, roast level, and grind size, making volumetric measurements unreliable.

A digital scale is an essential tool for any serious coffee brewer. It allows you to replicate your perfect cup time after time.

## Experimenting with Ratios

To find your ideal ratio:

1. Start with the standard 1:16 ratio
2. Change only one variable at a time
3. Keep notes on what you liked or didn't like
4. Adjust in small increments (try 1:15 or 1:17 next)
5. Once you find the sweet spot, you can fine-tune even further

Remember, coffee brewing is both a science and an art. The ratio is your foundation, but the journey of experimentation is what makes coffee brewing so rewarding!
    `,
    excerpt: 'Discover how coffee-to-water ratios affect your brew and learn how to find the perfect balance for your preferred brewing method and taste preferences.',
    coverImage: '/images/blog/coffee-to-water.png',
    tags: ['coffee ratio', 'brewing basics', 'coffee tips'],
    readingTime: 3,
    relatedPosts: ['1', '3']
  },
  {
    id: '3',
    title: 'The Impact of Water Quality on Your Coffee',
    slug: 'impact-of-water-quality-on-coffee',
    author: 'Water Specialist',
    date: '2023-09-05T09:15:00Z',
    content: `
# The Impact of Water Quality on Your Coffee

Water makes up more than 98% of your brewed coffee, yet it's often the most overlooked ingredient. The mineral content, pH level, and overall quality of your water dramatically influence the extraction process and final taste of your coffee.

## The Ideal Water Composition

The Specialty Coffee Association (SCA) has established standards for water used in coffee brewing:

- **Total Dissolved Solids (TDS)**: 150 ppm (acceptable range: 75-250 ppm)
- **Calcium Hardness**: 4 grains or 68 ppm (acceptable range: 1-5 grains)
- **Total Alkalinity**: 40 ppm (acceptable range: 40-70 ppm)
- **pH**: 7.0 (acceptable range: 6.5-7.5)
- **Sodium**: 10 ppm (acceptable range: 5-30 ppm)
- **Odor**: Clean, fresh, odor-free
- **Chlorine**: 0 ppm

## How Water Affects Extraction

### Mineral Content

- **Calcium and Magnesium**: These minerals are excellent at binding with coffee compounds and extracting flavor. Too little, and your coffee will be under-extracted and sour; too much, and it can over-extract and taste bitter.
  
- **Bicarbonate (Alkalinity)**: Acts as a buffer and neutralizes acids in coffee. High alkalinity water results in flat, dull coffee because it neutralizes the bright, fruity acids that give specialty coffee its character.

### pH Level

While neutral water (pH 7) is ideal, slightly alkaline water tends to make coffee taste flat, while slightly acidic water can enhance brightness but might mask other flavors.

## Common Water Problems

### Hard Water

Water with high mineral content, especially calcium and magnesium, can:
- Create scale buildup in your equipment
- Lead to over-extraction and bitterness
- Enhance body but potentially mask subtle flavors

### Soft Water

Water with low mineral content can:
- Result in under-extraction and sourness
- Produce weak, thin-bodied coffee
- Fail to bring out the full flavor potential

### Chlorinated Water

Chlorine can:
- Impart off-flavors and odors
- React with organic compounds in coffee
- Easily be removed by filtering or boiling

## Solutions for Better Water

1. **Filtered Tap Water**: A simple carbon filter (like Brita) can remove chlorine and some impurities, but doesn't address mineral content.

2. **Bottled Water**: Not all bottled waters are created equal. Look for brands with TDS between 150-200 ppm.

3. **Third Wave Water**: These mineral packets can be added to distilled water to create the ideal brewing water.

4. **Home Water Treatment**: Systems like reverse osmosis with remineralization provide complete control over your water composition.

## Testing Your Water

Before investing in expensive treatment options, consider testing your tap water to understand its current composition. Water test kits are affordable and provide valuable information about what you might need to adjust.

Remember, the perfect water for coffee brewing is not necessarily the purest water—it's water with the right balance of minerals to extract the best flavors from your beans. By paying attention to this crucial ingredient, you can dramatically improve your home brewing results.
    `,
    excerpt: 'Learn how the mineral content and quality of your water affects coffee extraction and flavor, plus practical solutions for achieving the ideal brewing water.',
    coverImage: '/images/blog/water-quality.png',
    tags: ['water quality', 'coffee science', 'brewing tips'],
    readingTime: 5,
    relatedPosts: ['1', '2']
  }
];

// Initialize blog posts in local storage if not already present
const initializeBlogPosts = (): void => {
  if (typeof window !== 'undefined') {
    const storedPosts = localStorage.getItem(STORAGE_KEY);
    if (!storedPosts) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleBlogPosts));
    }
  }
};

// Get all blog posts
export const getAllBlogPosts = (): BlogPost[] => {
  if (typeof window === 'undefined') {
    return sampleBlogPosts; // Return sample data during SSR
  }

  initializeBlogPosts(); // Ensure we have data
  const storedPosts = localStorage.getItem(STORAGE_KEY);
  return storedPosts ? JSON.parse(storedPosts) : [];
};

// Get a single blog post by slug
export const getBlogPostBySlug = (slug: string): BlogPost | null => {
  const posts = getAllBlogPosts();
  return posts.find(post => post.slug === slug) || null;
};

// Create a new blog post
export const createBlogPost = (postData: Omit<BlogPost, 'id' | 'slug' | 'readingTime'>): BlogPost => {
  const posts = getAllBlogPosts();
  
  // Generate a new unique ID
  const newId = (Math.max(...posts.map(post => parseInt(post.id)), 0) + 1).toString();
  
  // Generate slug from title
  const slug = generateSlug(postData.title);
  
  // Calculate reading time
  const readingTime = calculateReadingTime(postData.content);
  
  // Create new post
  const newPost: BlogPost = {
    id: newId,
    slug,
    readingTime,
    ...postData
  };
  
  // Save to storage
  const updatedPosts = [...posts, newPost];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
  }
  
  return newPost;
};

// Update an existing blog post
export const updateBlogPost = (postId: string, postData: Partial<BlogPost>): BlogPost | null => {
  const posts = getAllBlogPosts();
  const postIndex = posts.findIndex(post => post.id === postId);
  
  if (postIndex === -1) {
    return null;
  }
  
  // If content is updated, recalculate reading time
  let newReadingTime = posts[postIndex].readingTime;
  if (postData.content) {
    newReadingTime = calculateReadingTime(postData.content);
  }
  
  // If title is updated, regenerate slug
  let newSlug = posts[postIndex].slug;
  if (postData.title) {
    newSlug = generateSlug(postData.title);
  }
  
  // Update post
  const updatedPost: BlogPost = {
    ...posts[postIndex],
    ...postData,
    slug: newSlug,
    readingTime: newReadingTime
  };
  
  posts[postIndex] = updatedPost;
  
  // Save to storage
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }
  
  return updatedPost;
};

// Delete a blog post
export const deleteBlogPost = (postId: string): boolean => {
  const posts = getAllBlogPosts();
  const filteredPosts = posts.filter(post => post.id !== postId);
  
  if (filteredPosts.length === posts.length) {
    return false; // No post was removed
  }
  
  // Save to storage
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPosts));
  }
  
  return true;
};

// Get blog posts by tag
export const getBlogPostsByTag = (tag: string): BlogPost[] => {
  const posts = getAllBlogPosts();
  return posts.filter(post => post.tags.includes(tag));
};

// Search blog posts
export const searchBlogPosts = (query: string): BlogPost[] => {
  if (!query.trim()) return [];
  
  const posts = getAllBlogPosts();
  const lowerQuery = query.toLowerCase();
  
  return posts.filter(post => 
    post.title.toLowerCase().includes(lowerQuery) ||
    post.content.toLowerCase().includes(lowerQuery) ||
    post.excerpt.toLowerCase().includes(lowerQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}; 