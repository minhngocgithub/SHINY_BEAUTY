<template>
  <div class="feedback-list">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-gray-900">
        Questions & Answers ({{ totalQuestions }})
      </h3>
      
      <button
        @click="toggleQuestionForm"
        class="px-6 py-2 text-white transition rounded-lg bg-rose-600 hover:bg-rose-700"
      >
        Ask a Question
      </button>
    </div>

    <!-- Question Form -->
    <div 
      v-if="showQuestionForm" 
      class="p-6 mb-6 border border-gray-200 rounded-lg bg-gray-50"
    >
      <h4 class="mb-4 text-lg font-semibold text-gray-900">Ask about this product</h4>
      
      <form @submit.prevent="submitQuestion" class="space-y-4">
        <div>
          <label for="question" class="block mb-2 text-sm font-medium text-gray-700">
            Your Question <span class="text-red-500">*</span>
          </label>
          <textarea
            id="question"
            v-model="questionForm.comment"
            rows="4"
            placeholder="What would you like to know about this product?"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
          ></textarea>
          <p class="mt-1 text-xs text-gray-500">
            Minimum 10 characters ({{ questionForm.comment.length }}/2000)
          </p>
        </div>

        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="submitting || questionForm.comment.length < 10"
            class="px-6 py-2 text-white transition rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? 'Submitting...' : 'Submit Question' }}
          </button>
          <button
            type="button"
            @click="cancelQuestion"
            class="px-6 py-2 text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Filter & Sort -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-4">
        <button
          @click="filterType = 'all'"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-lg transition',
            filterType === 'all'
              ? 'bg-rose-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          All Questions
        </button>
        <button
          @click="filterType = 'answered'"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-lg transition',
            filterType === 'answered'
              ? 'bg-rose-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Answered ({{ answeredCount }})
        </button>
        <button
          @click="filterType = 'unanswered'"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-lg transition',
            filterType === 'unanswered'
              ? 'bg-rose-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Unanswered ({{ unansweredCount }})
        </button>
      </div>

      <select 
        v-model="sortOption"
        @change="handleSort"
        class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>
    </div>

    <!-- Results Info -->
    <p class="mb-4 text-sm text-gray-600">
      Showing {{ filteredQuestions.length }} of {{ totalQuestions }} questions
    </p>

    <!-- Loading State -->
    <div v-if="loading" class="py-12 text-center">
      <div class="inline-block w-8 h-8 border-4 border-gray-300 rounded-full animate-spin border-t-rose-600"></div>
      <p class="mt-4 text-gray-500">Loading questions...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredQuestions.length === 0" class="py-12 text-center">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="mb-2 text-lg font-medium text-gray-900">
        {{ filterType === 'all' ? 'No questions yet' : `No ${filterType} questions` }}
      </p>
      <p class="text-gray-500">
        {{ filterType === 'all' ? 'Be the first to ask a question!' : 'Try a different filter' }}
      </p>
    </div>

    <!-- Q&A List -->
    <div v-else class="space-y-6">
      <div
        v-for="item in filteredQuestions"
        :key="item._id"
        class="p-6 transition-shadow border border-gray-200 rounded-lg hover:shadow-md"
      >
        <!-- Question -->
        <div class="flex items-start gap-4 mb-4">
          <div class="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-rose-100">
            <span class="text-lg font-bold text-rose-600">Q</span>
          </div>
          
          <div class="flex-1">
            <p class="mb-2 text-base font-semibold text-gray-900">
              {{ item.comment }}
            </p>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span class="font-medium">{{ item.user?.name || 'Anonymous' }}</span>
              <span>•</span>
              <span>{{ formatDate(item.createdAt) }}</span>
              <span 
                v-if="item.verifiedPurchase"
                class="ml-2 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded"
              >
                Verified Buyer
              </span>
            </div>
          </div>
        </div>

        <!-- Answer -->
        <div 
          v-if="item.reply && item.reply.length > 0"
          class="pl-6 space-y-4 border-l-2 border-green-200 ml-14"
        >
          <div 
            v-for="reply in item.reply"
            :key="reply._id"
            class="flex items-start gap-4"
          >
            <div class="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-green-100 rounded-full">
              <span class="text-lg font-bold text-green-600">A</span>
            </div>
            
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2 py-0.5 text-xs font-semibold text-white bg-green-600 rounded">
                  {{ reply.admin?.role || 'Store' }}
                </span>
                <span class="text-sm font-medium text-gray-900">
                  {{ reply.admin?.name || 'Store Admin' }}
                </span>
                <span class="text-sm text-gray-500">
                  • {{ formatDate(reply.repliedAt) }}
                </span>
              </div>
              <p class="leading-relaxed text-gray-700">{{ reply.message }}</p>
            </div>
          </div>
        </div>

        <!-- No Answer Yet -->
        <div 
          v-else
          class="pl-6 border-l-2 border-gray-200 ml-14"
        >
          <p class="text-sm italic text-gray-500">
            No answer yet. We'll respond soon!
          </p>
        </div>

        <!-- Helpful Actions -->
        <div class="flex items-center gap-6 pt-4 mt-4 border-t border-gray-100">
          <button 
            @click="markHelpful(item._id, true)"
            class="flex items-center gap-2 text-sm text-gray-600 transition hover:text-green-600"
            :class="{ 'text-green-600': item.isHelpful }"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span>Helpful ({{ item.helpful?.length || 0 }})</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-8">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-4 py-2 transition border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Previous
      </button>
      
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="changePage(page)"
        :class="[
          'px-4 py-2 border rounded-lg transition',
          page === currentPage 
            ? 'bg-rose-600 text-white border-rose-600' 
            : 'border-gray-300 hover:bg-gray-50'
        ]"
      >
        {{ page }}
      </button>
      
      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 transition border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { 
  getReviewsByProductApi,
  createReviewApi,
  markReviewHelpfulApi
} from '@/services/review.service'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})
const questions = ref([])
const loading = ref(true)
const showQuestionForm = ref(false)
const submitting = ref(false)
const filterType = ref('all')
const sortOption = ref('newest')
const currentPage = ref(1)
const pageSize = ref(10)

const questionForm = ref({
  comment: '',
  product: '',
  reviewType: 'question'
})

// Computed
const totalQuestions = computed(() => questions.value.length)

const answeredCount = computed(() => 
  questions.value.filter(q => q.reply && q.reply.length > 0).length
)

const unansweredCount = computed(() => 
  questions.value.filter(q => !q.reply || q.reply.length === 0).length
)

const filteredQuestions = computed(() => {
  let filtered = questions.value

  if (filterType.value === 'answered') {
    filtered = filtered.filter(q => q.reply && q.reply.length > 0)
  } else if (filterType.value === 'unanswered') {
    filtered = filtered.filter(q => !q.reply || q.reply.length === 0)
  }

  // Sort
  if (sortOption.value === 'newest') {
    filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else {
    filtered = [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }

  // Pagination
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

const totalPages = computed(() => {
  let filtered = questions.value
  if (filterType.value === 'answered') {
    filtered = filtered.filter(q => q.reply && q.reply.length > 0)
  } else if (filterType.value === 'unanswered') {
    filtered = filtered.filter(q => !q.reply || q.reply.length === 0)
  }
  return Math.ceil(filtered.length / pageSize.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Methods
const loadQuestions = async () => {
  try {
    loading.value = true
    const response = await getReviewsByProductApi(props.product._id, {
      type: 'question',
      sortBy: 'createdAt',
      order: 'desc'
    })
    
    if (response.data.success) {
      questions.value = response.data.reviews || []
    }
  } catch (error) {
    console.error('Error loading questions:', error)
  } finally {
    loading.value = false
  }
}

const toggleQuestionForm = () => {
  showQuestionForm.value = !showQuestionForm.value
  if (showQuestionForm.value) {
    questionForm.value = {
      comment: '',
      product: props.product._id,
      reviewType: 'question'
    }
  }
}

const submitQuestion = async () => {
  if (questionForm.value.comment.length < 10) {
    alert('Question must be at least 10 characters')
    return
  }

  try {
    submitting.value = true
    const response = await createReviewApi(questionForm.value)
    
    if (response.data.success) {
      alert('Your question has been submitted and is pending approval!')
      showQuestionForm.value = false
      questionForm.value.comment = ''
      await loadQuestions()
    }
  } catch (error) {
    console.error('Error submitting question:', error)
    alert(error.response?.data?.message || 'Failed to submit question')
  } finally {
    submitting.value = false
  }
}

const cancelQuestion = () => {
  showQuestionForm.value = false
  questionForm.value.comment = ''
}

const handleSort = () => {
  currentPage.value = 1
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const markHelpful = async (questionId, isHelpful) => {
  try {
    await markReviewHelpfulApi(questionId, isHelpful)
    await loadQuestions()
  } catch (error) {
    console.error('Error marking helpful:', error)
  }
}

const formatDate = (date) => {
  const now = new Date()
  const questionDate = new Date(date)
  const diffTime = Math.abs(now - questionDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
  } else if (diffDays < 60) {
    return '1 month ago'
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months > 1 ? 's' : ''} ago`
  } else {
    return questionDate.toLocaleDateString()
  }
}

onMounted(() => {
  loadQuestions()
})

watch(() => props.product._id, () => {
  loadQuestions()
})

watch(filterType, () => {
  currentPage.value = 1
})
</script>