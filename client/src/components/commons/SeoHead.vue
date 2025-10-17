<script setup>
import { computed, onMounted } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  salePrograms: {
    type: Array,
    default: () => []
  },
  reviews: {
    type: Array,
    default: () => []
  }
})

const currentUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.href
  }
  return ''
})

const seoTitle = computed(() => {
  let title = `${props.product.name} - ${props.product.brand}`
  if (props.product.isOnSale || props.salePrograms.length > 0) {
    title += ' | On Sale'
  }
  if (props.product.isNewProduct) {
    title += ' | New Arrival'
  }
  return `${title} | Beauty Cosmetic`
})

const seoDescription = computed(() => {
  let desc = props.product.description?.slice(0, 155) || ''
  if (props.product.isOnSale && props.product.discountPercentage) {
    desc = `Save ${props.product.discountPercentage}%! ${desc}`
  }
  return desc
})

const seoKeywords = computed(() => {
  const keywords = [
    props.product.name,
    props.product.brand,
    'Beauty Cosmetic',
  ]
  
  if (props.product.category) {
    keywords.push(...props.product.category.map(cat => cat.name))
  }
  
  if (props.product.isOnSale) {
    keywords.push('sale', 'discount', 'deal')
  }
  
  return keywords.join(', ')
})

const productImage = computed(() => {
  if (Array.isArray(props.product.image)) {
    return props.product.image[0]?.url || props.product.image[0]
  }
  return props.product.image?.url || props.product.image || '/placeholder.png'
})

const finalPrice = computed(() => {
  if (props.product.salePrice) return props.product.salePrice
  if (props.product.isOnSale && props.product.discountPercentage) {
    return (props.product.price * (1 - props.product.discountPercentage / 100)).toFixed(2)
  }
  return props.product.price
})

const productSchema = computed(() => {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": props.product.name,
    "image": Array.isArray(props.product.image) 
      ? props.product.image.map(img => img.url || img)
      : [productImage.value],
    "description": props.product.description,
    "brand": {
      "@type": "Brand",
      "name": props.product.brand
    },
    "sku": props.product._id,
    "offers": {
      "@type": "Offer",
      "url": currentUrl.value,
      "priceCurrency": "USD",
      "price": finalPrice.value,
      "priceValidUntil": props.product.saleEndDate || undefined,
      "availability": props.product.countInstock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Beauty Cosmetic"
      }
    }
  }
  
  if (props.reviews && props.reviews.length > 0) {
    const avgRating = props.reviews.reduce((sum, r) => sum + r.rating, 0) / props.reviews.length
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": avgRating.toFixed(1),
      "reviewCount": props.reviews.length,
      "bestRating": 5,
      "worstRating": 1
    }
  }
  
  return schema
})

const breadcrumbSchema = computed(() => {
  const items = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": typeof window !== 'undefined' ? window.location.origin : ''
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Products",
      "item": typeof window !== 'undefined' ? `${window.location.origin}/products` : ''
    }
  ]
  
  if (props.product.category && props.product.category[0]) {
    items.push({
      "@type": "ListItem",
      "position": 3,
      "name": props.product.category[0].name,
      "item": typeof window !== 'undefined' ? `${window.location.origin}/category/${props.product.category[0]._id}` : ''
    })
  }
  
  items.push({
    "@type": "ListItem",
    "position": items.length + 1,
    "name": props.product.name,
    "item": currentUrl.value
  })
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items
  }
})

onMounted(() => {
  // Remove existing schema scripts
  const existingScripts = document.querySelectorAll('script[data-schema]')
  existingScripts.forEach(script => script.remove())
  
  // Add Product Schema
  const productScript = document.createElement('script')
  productScript.type = 'application/ld+json'
  productScript.setAttribute('data-schema', 'product')
  productScript.textContent = JSON.stringify(productSchema.value)
  document.head.appendChild(productScript)
  
  // Add Breadcrumb Schema
  const breadcrumbScript = document.createElement('script')
  breadcrumbScript.type = 'application/ld+json'
  breadcrumbScript.setAttribute('data-schema', 'breadcrumb')
  breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema.value)
  document.head.appendChild(breadcrumbScript)
  
  // Update meta tags
  updateMetaTags()
})

function updateMetaTags() {
  // Update title
  document.title = seoTitle.value
  
  // Update or create meta tags
  const metaTags = [
    { name: 'description', content: seoDescription.value },
    { name: 'keywords', content: seoKeywords.value },
    { property: 'og:title', content: seoTitle.value },
    { property: 'og:description', content: seoDescription.value },
    { property: 'og:image', content: productImage.value },
    { property: 'og:url', content: currentUrl.value },
    { property: 'og:type', content: 'product' },
    { property: 'product:price:amount', content: finalPrice.value },
    { property: 'product:price:currency', content: 'USD' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: seoTitle.value },
    { name: 'twitter:description', content: seoDescription.value },
    { name: 'twitter:image', content: productImage.value },
  ]
  
  metaTags.forEach(tag => {
    const selector = tag.name ? `meta[name="${tag.name}"]` : `meta[property="${tag.property}"]`
    let element = document.querySelector(selector)
    
    if (!element) {
      element = document.createElement('meta')
      if (tag.name) element.setAttribute('name', tag.name)
      if (tag.property) element.setAttribute('property', tag.property)
      document.head.appendChild(element)
    }
    
    element.setAttribute('content', tag.content)
  })
}
</script>

<template>
    
</template>
