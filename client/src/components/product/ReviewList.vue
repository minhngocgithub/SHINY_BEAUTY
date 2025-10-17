<template>
  <div class="review-list">
    <div class="grid grid-cols-1 gap-8 mb-8 md:grid-cols-3">
      <div class="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-lg">
        <div class="text-6xl font-bold text-gray-900">
          {{ reviewStore.averageRating }}
        </div>
        <div class="flex my-2 text-2xl text-yellow-400">
          <span v-for="i in 5" :key="i">
            {{ i <= Math.floor(reviewStore.averageRating) ? '★' : '☆' }}
          </span>
        </div>
        <div class="text-sm text-gray-600">out of 5</div>
        <div class="mt-2 text-sm font-medium text-gray-500">
          ({{ reviewStore.totalReviews }} Review{{ reviewStore.totalReviews !== 1 ? 's' : '' }})
        </div>
      </div>

      <!-- Rating Distribution -->
      <div class="col-span-2 p-6 bg-white border border-gray-200 rounded-lg">
        <h4 class="mb-4 font-semibold text-gray-900">Rating Distribution</h4>
        <div class="space-y-2">
          <div
            v-for="star in [5,4,3,2,1]"
            :key="star"
            class="flex items-center gap-3"
          >
            <span class="text-sm font-medium text-gray-700 w-14">{{ star }} Star</span>
            <div class="flex-1 h-3 overflow-hidden bg-gray-200 rounded-full">
              <div
                class="h-full transition-all bg-yellow-400"
                :style="{ width: getRatingPercentage(star) + '%' }"
              ></div>
            </div>
            <span class="text-sm font-medium text-right text-gray-600 w-14">
              {{ getRatingPercentage(star) }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters & Sort -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div class="flex flex-wrap gap-2">
        <button
          @click="filterRating = null"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-lg transition',
            filterRating === null
              ? 'bg-rose-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          All
        </button>
        <button
          v-for="star in [5,4,3,2,1]"
          :key="star"
          @click="filterRating = star"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-lg transition',
            filterRating === star
              ? 'bg-rose-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ star }} ★
        </button>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700">Sort by:</label>
        <select
          v-model="sortBy"
          class="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredAndSortedReviews.length === 0 && !reviewStore.loading" class="py-12 text-center">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
      </svg>
      <p class="text-gray-500">No reviews yet. Be the first to review!</p>
    </div>

    <!-- Reviews List -->
    <div v-else class="space-y-6">
      <div
        v-for="review in filteredAndSortedReviews"
        :key="review._id"
        class="p-6 bg-white border border-gray-200 rounded-lg"
      >
        <div class="flex items-start gap-4">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <div
              class="flex items-center justify-center w-12 h-12 text-lg font-semibold text-white rounded-full bg-rose-500"
            >
              {{ getUserInitials(review.user?.name) }}
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <div class="flex items-start justify-between mb-2">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold text-gray-900">
                    {{ review.user?.name || 'Anonymous' }}
                  </span>
                  <span v-if="review.isVerified"
                        class="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded">
                    Verified Purchase
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex text-yellow-400">
                    <span v-for="i in 5" :key="i" class="text-lg">
                      {{ i <= review.rating ? '★' : '☆' }}
                    </span>
                  </div>
                  <span class="text-sm text-gray-500">
                    {{ formatDate(review.createdAt) }}
                  </span>
                </div>
              </div>
            </div>

            <p class="mb-3 leading-relaxed text-gray-700">{{ review.comment }}</p>

            <!-- Images -->
            <div v-if="review.hasImages" class="flex gap-2 mb-4">
              <img
                v-for="(image, idx) in review.images"
                :key="idx"
                :src="image"
                :alt="`Review image ${idx + 1}`"
                class="object-cover w-20 h-20 transition border border-gray-200 rounded cursor-pointer hover:opacity-75"
                @click="selectedImage = image"
              />
            </div>

            <!-- Helpful Buttons -->
            <div class="flex items-center gap-4 text-sm">
              <button
                @click="markHelpful(review._id, true)"
                :disabled="reviewStore.loading"
                class="flex items-center gap-1 text-gray-600 transition hover:text-green-600 disabled:opacity-50"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
                </svg>
                Helpful ({{ review.helpfulCount }})
              </button>

              <button
                @click="markHelpful(review._id, false)"
                :disabled="reviewStore.loading"
                class="flex items-center gap-1 text-gray-600 transition hover:text-red-600 disabled:opacity-50"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"/>
                </svg>
                Not Helpful ({{ review.notHelpfulCount }})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div
      v-if="selectedImage"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
      @click="selectedImage = null"
    >
      <div class="relative max-w-2xl" @click.stop>
        <img :src="selectedImage" alt="Review image full" class="h-auto max-w-full rounded" />
        <button
          @click="selectedImage = null"
          class="absolute p-2 transition bg-white rounded-full top-2 right-2 hover:bg-gray-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useReviewStore } from '../../store/review.store'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
})

const reviewStore = useReviewStore()
const currentProductId = computed(() => props.product?._id || props.product?.id)
const filterRating = ref(null)
const sortBy = ref('newest')
const selectedImage = ref(null)

async function fetchReviewData(id) {
  if (id && id.length > 0 && id !== 'undefined') {
    await reviewStore.fetchProductReviews(id)
    await reviewStore.fetchReviewSummary(id)
    console.log('Total Reviews in Store after fetch:', reviewStore.reviews.length);
    console.log('Review Summary in Store after fetch:', reviewStore.reviewSummary); 
  } else {
    console.warn('ReviewList: Cannot fetch reviews. Product ID is missing or invalid.', id)
  }
}
onMounted(async () => {
  await fetchReviewData(currentProductId.value) 
})

watch(currentProductId, async (newProductId) => {
  if (newProductId) { 
    await fetchReviewData(newProductId) 
  }
})

const ratingDistribution = computed(() => reviewStore.ratingDistribution)

const filteredAndSortedReviews = computed(() => {
  let filtered = [...reviewStore.formattedReviews]
  if (filterRating.value !== null)
    filtered = filtered.filter(r => r.rating === filterRating.value)

  switch (sortBy.value) {
    case 'newest': filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); break
    case 'oldest': filtered.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)); break
    case 'highest': filtered.sort((a,b) => b.rating - a.rating); break
    case 'lowest': filtered.sort((a,b) => a.rating - b.rating); break
    case 'helpful': filtered.sort((a,b) => b.helpfulScore - a.helpfulScore); break
  }
  return filtered
})

function getRatingPercentage(star) {
  const dist = ratingDistribution.value[star]
  return dist?.percentage || 0
}

function getUserInitials(name) {
  if (!name) return 'A'
  const parts = name.split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 30) return `${diffDays} days ago`
  if (diffDays < 60) return '1 month ago'
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function markHelpful(reviewId, isHelpful) {
  try {
    await reviewStore.markHelpful(reviewId, isHelpful)
  } catch (error) {
    console.error('Error marking review helpful:', error)
  }
}
</script>
