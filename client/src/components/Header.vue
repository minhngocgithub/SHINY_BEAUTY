<template>
  <section class="mb-2">
    <nav class="bg-white">
      <div class="px-2 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="relative flex items-center justify-between h-16">
          <div
            class="flex items-center justify-center pr-16 sm:items-stretch sm:justify-start"
          >
            <div class="flex items-center flex-shrink-0 mt-2">
              <img
                src="E:\Booking App\Booking App\client\src\assets\image\image_logo\logo_website.png"
                alt="Beauty Cosmetic"
                class="object-contain w-auto p-2 rounded-lg shadow-sm h-"
                style="max-width: 140px"
              />
              <span>Beauty Comestic</span>
            </div>
          </div>

          <div class="flex justify-center space-x-0">
            <SearchWrapper />
          </div>

          <!-- Notifications -->
          <div
            class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0"
          >
            <button
              type="button"
              class="relative p-1 text-gray-400 bg-gray-800 rounded-full hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              <span class="absolute -inset-1.5"></span>
              <span class="sr-only">View notifications</span>
              <svg
                class="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
            </button>

            <!-- Profile dropdown -->
            <div
              v-if="!authStore.isLoggedIn"
              class="relative ml-3 bg-[#5a4098] rounded-lg p-2"
            >
              <router-link
                to="/Login-Page"
                class="px-2 font-bold tracking-tight underline-none hover:text-sky-50 text-slate-400"
                >Sign in</router-link
              >
            </div>

            <div v-else class="relative ml-3 group">
              <div class="px-4">
                <div
                  type="button"
                  class="relative flex mt-1 text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span class="absolute -inset-1.5"></span>
                  <Avatar
                    class="pr-3"
                    :current-avatar="
                      authStore.user.avatar?.url || './assets/image/vue.svg'
                    "
                    :size="32"
                  />
                  <router-link to="/Profile" class="pl-1 mt-1 font-inter">{{
                    authStore.user.name || ""
                  }}</router-link>
                </div>
              </div>

              <div
                class="absolute right-0 hidden w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg z-9999 group-hover:block ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabindex="-1"
              >
                <!-- Active: "bg-gray-100", Not Active: "" -->
                <router-link to="/Profile">
                  <a
                    href="#"
                    class="block px-4 py-2 text-sm text-gray-700"
                    role="menuitem"
                    tabindex="-1"
                    id="user-menu-item-0"
                    >Your Profile</a
                  >
                </router-link>
                <router-link to="/setting">
                  <a
                    href="#"
                    class="block px-4 py-2 text-sm text-gray-700"
                    role="menuitem"
                    tabindex="-1"
                    id="user-menu-item-1"
                    >Settings
                  </a>
                </router-link>
                <a
                  @click.prevent="logoutAccount"
                  href="#"
                  class="block px-4 py-2 text-sm text-gray-700"
                  role="menuitem"
                  tabindex="-1"
                  id="user-menu-item-2"
                  >Log out</a
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile menu, show/hide based on menu state. -->
    </nav>
    <!-- Navbar 2 -->
    <div class="bg-gray-800">
      <div class="px-2 mx-auto max-w-7xl sm:px-2 lg:px-4">
        <div class="relative flex items-center justify-between h-16">
          <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <!-- Mobile menu button-->
            <button
              type="button"
              class="relative inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span class="absolute -inset-0.5"></span>
              <span class="sr-only">Open main menu</span>

              <svg
                class="block w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
              <svg
                class="hidden w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div
            class="hidden sm:ml-6 sm:block absoluted"
            id="navigation"
            v-for="navigation in navigations"
            :key="navigation.router"
            @mousemove="showDropdown(navigation.name)"
          >
            <div class="flex items-center justify-center space-x-4">
              <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
              <a
                class="px-3 py-2 text-sm font-medium text-white rounded-md"
                aria-current="page"
              >
                {{ navigation.name }}
              </a>
            </div>
            <div v-if="currentDropdown === navigation.name">
              <!--  -->
              <div
                v-if="navigation.name === 'New'"
                class="mt-4 border-b-2 shadow-lg dropdown_content max-h-min bg-slate-100 shadow-indigo-500/50 border-x-2"
              >
                <div class="grid grid-cols-2 gap-8 py-12 px-9">
                  <ul class="h-72">
                    <div class="grid grid-cols-2 gap-2 px-12 pb-2 space-x-3">
                      <ul class="pl-5 h-72">
                        <router-link to="/Shop/new/All-New"
                          ><li>All New</li></router-link
                        >
                        <router-link to="/Shop/new/New-Release"
                          ><li>Just Dropped</li></router-link
                        >
                        <router-link to="Shop/new/New-Makeup"
                          ><li>New Makeup</li></router-link
                        >
                        <router-link to="Shop/new/New-Skincare"
                          ><li>New Skincare</li></router-link
                        >
                        <router-link to="Shop/new/New-HairCare"
                          ><li>New Hair Care</li></router-link
                        >
                        <router-link to="Shop/new/New-Frangrance"
                          ><li>New Frangrance</li></router-link
                        >
                        <router-link to="Shop/new/New-Bath&Body"
                          ><li>New Bath & Body</li></router-link
                        >
                        <router-link to="Shop/new/New-Tools&Brushes"
                          ><li>New Tools & Brushes</li></router-link
                        >
                      </ul>
                      <ul class="pl-5 h-72">
                        <router-link to="/Shop/new/Big-Thing"
                          ><li>The Next Big Thing</li></router-link
                        >
                        <router-link to="/Shop/new/Best-sellers"
                          ><li>BestSellers</li></router-link
                        >
                        <router-link to="/Shop/new/Trending-Social"
                          ><li>Trending on Social</li></router-link
                        >
                        <router-link to="/Shop/new/Refillable-Beauty"
                          ><li>Refillable Beauty Products</li></router-link
                        >
                        <router-link to="/Shop/new/Quizzes-BuyingGuides"
                          ><li>Quizzes & Buying Guides</li></router-link
                        >
                        <router-link to="/Shop/new/Clean-Beauty"
                          ><li>Clean Beauty</li></router-link
                        >
                        <router-link to="/Shop/new/Planet-Aware"
                          ><li>Planet Aware Beauty</li></router-link
                        >
                        <router-link to="/Shop/new/FSA&HSA"
                          ><li>FSA & HSA Eligible</li></router-link
                        >
                      </ul>
                    </div>
                  </ul>
                  <div class="grid grid-cols-2 gap-1 px-12 pb-2 space-x-3">
                    <ul class="pl-5 h-72">
                      <img
                        src="E:\Booking App\Booking App\client\src\assets\image\image_product\category_img\skinfast.png"
                        alt="SkinFast.png"
                      />
                    </ul>
                    <ul class="pl-5 h-72">
                      <img
                        src="E:\Booking App\Booking App\client\src\assets\image\image_product\category_img\NewRareBeauty.png"
                        alt="NewRareBeauty.png"
                      />
                    </ul>
                  </div>
                </div>
              </div>
              <!--  -->
              <div
                v-if="navigation.name === 'Brands'"
                class="pt-32 mt-4 border-b-2 shadow-lg dropdown_content max-h-min bg-slate-100 shadow-indigo-500/50 border-x-2"
              >
                <div
                  class="relative grid h-full grid-cols-7 gap-4 px-4 bottom-16"
                >
                  <ul class="pl-5">
                    <router-link to="/Shop/brands/brand-list"
                      ><li class="font-bold">Brands A-Z</li></router-link
                    >
                    <router-link to="/Shop/brands/beauty-collection"
                      ><li class="font-bold">
                        Beauty Collections
                      </li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <p class="font-bold">New Brands</p>
                    <router-link to="/Shop/brands/brown-girl-jane"
                      ><li>Brown Girl Jane</li></router-link
                    >
                    <router-link to="/Shop/brands/aavrani"
                      ><li>AAVRANI</li></router-link
                    >
                    <router-link to="/Shop/brands/dr-idriss"
                      ><li>Dr Idriss</li></router-link
                    >
                    <router-link to="/Shop/brands/prada-beauty"
                      ><li>Prada Beauty</li></router-link
                    >
                    <router-link to="/Shop/brands/iris-Romeo"
                      ><li>Iris&Romeo</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <p class="font-bold">Only At Beauty</p>
                    <router-link to="/Shop/brands/rare-beauty-by-Selena-Gomez"
                      ><li>Rare Beauty by Selena Gomez</li></router-link
                    >
                    <router-link to="/Shop/brands/haus-beauty-by-lady-gaga"
                      ><li>HAUS LABS By Lady Gaga</li></router-link
                    >
                    <router-link to="/Shop/brands/mane"
                      ><li>Mane</li></router-link
                    >
                    <router-link to="/Shop/brands/5-sens"
                      ><li>5 SENS</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <p class="font-bold">Affordable Brands</p>
                    <router-link to="/Shop/brands/beauty-collection"
                      ><li>Beauty Collections</li></router-link
                    >
                    <router-link to="/Shop/brands/the-ordinary"
                      ><li>The Ordinary</li></router-link
                    >
                    <router-link to="/Shop/brands/the-inkey-list"
                      ><li>The Inkey list</li></router-link
                    >
                    <router-link to="/Shop/brands/verbs"
                      ><li>Verbs</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <p class="font-bold">Black Own Brands</p>
                    <router-link to="/Shop/brands/pattern-by-tracee-ellisl-ross"
                      ><li>PATTERN By Tracee Ellis Ross</li></router-link
                    >
                    <router-link to="/Shop/brands/bread-beauty-supply"
                      ><li>BREAD BEAUTY SUPPLY</li></router-link
                    >
                    <router-link to="/Shop/brands/adwoa-beauty"
                      ><li>Adwoa Beauty</li></router-link
                    >
                    <router-link to="/Shop/brands/fornr-mood"
                      ><li>FORVR Mood</li></router-link
                    >
                    <router-link to="/Shop/brands/melanin-haircare"
                      ><li>Melanin Haircare</li></router-link
                    >
                    <router-link to="/Shop/brands/fashion-fair"
                      ><li>Fashion Fair</li></router-link
                    >
                    <router-link to="/Shop/brands/fenty-fragrance"
                      ><li>FENTY Fragrance</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <p class="font-bold">Clean At Beauty</p>
                    <router-link to="/Shop/brands/ilia"
                      ><li>ILIA</li></router-link
                    >
                    <router-link to="/Shop/brands/ellis-brooklyn"
                      ><li>Ellis Brooklyn</li></router-link
                    >
                    <router-link to="/Shop/brands/dae"
                      ><li>Dea</li></router-link
                    >
                    <router-link to="/Shop/brands/living-proof"
                      ><li>Living Proof</li></router-link
                    >
                  </ul>
                </div>
              </div>
              <!--  -->
              <div
                v-if="navigation.name === 'Makeup'"
                class="pt-32 mt-4 border-b-2 shadow-lg dropdown_content max-h-min bg-slate-100 shadow-indigo-500/50 border-x-2"
              >
                <div
                  class="relative grid h-full grid-cols-6 gap-4 px-4 bottom-16"
                >
                  <ul class="pl-5">
                    <router-link to="/Shop/makeup/all-makeup"
                      ><li>All Makeup</li></router-link
                    >
                    <p class="font-bold">Face</p>
                    <router-link to="/Shop/makeup/foundation"
                      ><li>Foundation</li></router-link
                    >
                    <router-link to="/Shop/makeup/bb&cc-Cream"
                      ><li>BB & CC Cream</li></router-link
                    >
                    <router-link to="/Shop/makeup/tinted-moisturizer"
                      ><li>Tinted Moisturizer</li></router-link
                    >
                    <router-link to="/Shop/makeup/face-primer"
                      ><li>Face Primer</li></router-link
                    >
                    <router-link to="/Shop/makeup/setting-spray&powder"
                      ><li>Setting Spray & Powder</li></router-link
                    >
                    <router-link to="/Shop/makeup/highlighter"
                      ><li>Highlighter</li></router-link
                    >
                    <router-link to="/Shop/makeup/contour"
                      ><li>Contour</li></router-link
                    >
                    <router-link to="/Shop/makeup/color-correct"
                      ><li>Color Correct</li></router-link
                    >
                    <router-link to="/Shop/makeup/face-sets"
                      ><li>Face Sets</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <p class="font-bold">Eye</p>
                    <router-link to="/Shop/makeup/eye-palettes"
                      ><li>Eye Palettes</li></router-link
                    >
                    <router-link to="/Shop/makeup/mascara"
                      ><li>Mascara</li></router-link
                    >
                    <router-link to="/Shop/makeup/eyeliner"
                      ><li>Eyeliner</li></router-link
                    >
                    <router-link to="/Shop/makeup/face-sets"
                      ><li>Eyebrow</li></router-link
                    >
                    <router-link to="/Shop/makeup/false-eyelashes"
                      ><li>False Eyelashes</li></router-link
                    >
                    <router-link to="/Shop/makeup/eye-shadow"
                      ><li>Eye Shadow</li></router-link
                    >
                    <router-link to="/Shop/makeup/eyelash-serums"
                      ><li>Eyelash Serums</li></router-link
                    >
                    <router-link to="/Shop/makeup/eyebrow-serums"
                      ><li>Eyebrow Serums</li></router-link
                    >
                    <router-link to="/Shop/makeup/eye-primer"
                      ><li>Eye Primer</li></router-link
                    >
                    <router-link to="/Shop/makeup/eye-sets"
                      ><li>Eye Sets</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <p class="font-bold">Lip</p>
                    <router-link to="/Shop/makeup/lip-gloss"
                      ><li>Lip Gloss</li></router-link
                    >
                    <router-link to="/Shop/makeup/lipstick"
                      ><li>Lipstick</li></router-link
                    >
                    <router-link to="/Shop/makeup/lip-oil"
                      ><li>Lip Oil</li></router-link
                    >
                    <router-link to="/Shop/makeup/lip-plumber"
                      ><li>Lip Plumber</li></router-link
                    >
                    <router-link to="/Shop/makeup/lipbalm-treatments"
                      ><li>Lip Balms & Treatments</li></router-link
                    >
                    <router-link to="/Shop/makeup/liquid-lipstick"
                      ><li>Liquid Lipstick</li></router-link
                    >
                    <router-link to="/Shop/makeup/lip-liner"
                      ><li>Lip Liner</li></router-link
                    >
                    <router-link to="/Shop/makeup/lip-stain"
                      ><li>Lip Stain</li></router-link
                    >
                    <router-link to="/Shop/makeup/lip-sets"
                      ><li>Lip Sets</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <p class="font-bold">Cheek</p>
                    <router-link to="/Shop/makeup/blush"
                      ><li>Blush</li></router-link
                    >
                    <router-link to="/Shop/makeup/bronzer"
                      ><li>Bronzer</li></router-link
                    >
                    <router-link to="/Shop/makeup/highlighter"
                      ><li>Highlighter</li></router-link
                    >
                    <router-link to="/Shop/makeup/lip-sets"
                      ><li>Contour</li></router-link
                    >
                    <router-link to="/Shop/makeup/cheek-palettes"
                      ><li>Cheek Palettes</li></router-link
                    >
                    <router-link to="/Shop/makeup/value-giftSets"
                      ><li class="font-bold">Value & Gift Sets</li></router-link
                    >
                    <router-link to="/Shop/makeup/makeup-palettes"
                      ><li class="font-bold">Makeup & Palettes</li></router-link
                    >
                    <router-link to="/Shop/makeup/brushes-applicators"
                      ><li class="font-bold">
                        Brushes & Applicators
                      </li></router-link
                    >
                    <router-link to="/Shop/makeup/accessories"
                      ><li class="font-bold">Accessories</li></router-link
                    >
                    <router-link to="/Shop/makeup/nail"
                      ><li class="font-bold">Nail</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/Shop/makeup/new"
                      ><li class="font-bold">New</li></router-link
                    >
                    <router-link to="/Shop/makeup/best-sellers"
                      ><li class="font-bold">BestSellers</li></router-link
                    >
                    <router-link to="/Shop/makeup/clean-makeup"
                      ><li class="font-bold">Clean Makeup</li></router-link
                    >
                    <router-link to="/Shop/makeup/vegan-makeup"
                      ><li class="font-bold">Vegan Makeup</li></router-link
                    >
                    <router-link to="/Shop/makeup/mini-size"
                      ><li class="font-bold">Mini Size</li></router-link
                    >
                    <router-link to="/Shop/makeup/value-size"
                      ><li class="font-bold">Value Size</li></router-link
                    >
                    <router-link to="/Shop/makeup/refillable"
                      ><li class="font-bold">Refillable Makeup</li></router-link
                    >
                    <router-link to="/Shop/makeup/collections"
                      ><li class="font-bold">
                        Beauty Collections
                      </li></router-link
                    >
                    <router-link to="/Shop/makeup/luxury"
                      ><li class="font-bold">Luxury Makeup</li></router-link
                    >
                    <router-link to="/Shop/makeup/black-own"
                      ><li class="font-bold">
                        Black-Owned Brands Makeup
                      </li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <p class="font-bold">Help Me Choose</p>
                    <router-link to="/Shop/makeup/monochrome"
                      ><li>Monochrome Makeup</li></router-link
                    >
                    <router-link to="/Shop/makeup/simple-eyes"
                      ><li>Easy Eye Makeup</li></router-link
                    >
                    <router-link to="/Shop/makeup/foundation"
                      ><li>Foundation Quiz</li></router-link
                    >
                    <router-link to="/Shop/makeup/lip-quiz"
                      ><li>Lip Quiz</li></router-link
                    >
                    <router-link to="/Shop/makeup/brow-quiz"
                      ><li>Brow Quiz</li></router-link
                    >
                    <router-link to="/Shop/makeup/complextion-routine"
                      ><li>Complexion Routine Builder</li></router-link
                    >
                    <router-link to="/Shop/makeup/best-founadtion"
                      ><li>Guide To Foundations</li></router-link
                    >
                    <router-link to="/Shop/makeup/clean-makeup-guide"
                      ><li>Clean Makeup Guide</li></router-link
                    >
                    <router-link to="/Shop/makeup/no-makeup-makeup"
                      ><li>No Makeup Makeup</li></router-link
                    >
                    <router-link to="/Shop/makeup/super-natural-sculpting"
                      ><li>Super-Natural Sculpting</li></router-link
                    >
                  </ul>
                </div>
              </div>
              <!--  -->
              <div
                v-if="navigation.name === 'Skincare'"
                class="pt-32 mt-4 border-b-2 shadow-lg dropdown_content max-h-min bg-slate-100 shadow-indigo-500/50 border-x-2"
              >
                <div
                  class="relative grid h-full grid-cols-6 gap-4 px-2 bottom-16"
                >
                  <ul class="pl-5">
                    <router-link to="/Shop/skincare/all-skincare"
                      ><li class="pb-2 font-bold">All Skincare</li></router-link
                    >
                    <router-link to="/Shop/skincare/moisturizers"
                      ><li class="font-bold">Moisturizers</li></router-link
                    >
                    <router-link to="/Shop/skincare/night-cream"
                      ><li>Night Creams</li></router-link
                    >
                    <router-link to="/Shop/skincare/face-oil"
                      ><li>Face Oils</li></router-link
                    >
                    <router-link to="/Shop/skincare/mits&essence"
                      ><li>Mists & Essences</li></router-link
                    >
                    <router-link to="/Shop/skincare/bb&cc-cream"
                      ><li class="pb-2">BB & CC Cream</li></router-link
                    >
                    <router-link to="/Shop/skincare/cleansers"
                      ><li class="font-bold">Cleansers</li></router-link
                    >
                    <router-link to="/Shop/skincare/face-wash"
                      ><li>Face Wash & Cleansers</li></router-link
                    >
                    <router-link to="/Shop/skincare/exfoliator"
                      ><li>Exfoliators</li></router-link
                    >
                    <router-link to="/Shop/skincare/makeup-remover"
                      ><li>Makeup Removers</li></router-link
                    >
                    <router-link to="/Shop/skincare/face-wipe"
                      ><li>Face Wipes</li></router-link
                    >
                    <router-link to="/Shop/skincare/toner"
                      ><li>Toners</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/Shop/skincare/treatment"
                      ><li class="font-bold">Treatments</li></router-link
                    >
                    <router-link to="/Shop/skincare/face-serum"
                      ><li>Face Serums</li></router-link
                    >
                    <router-link to="/Shop/skincare/blemish-acne"
                      ><li>Blemish & Acne Treatments</li></router-link
                    >
                    <router-link to="/Shop/skincare/facial-peel"
                      ><li class="pb-2">Facial Peels</li></router-link
                    >
                    <router-link to="/Shop/skincare/mark"
                      ><li class="font-bold">Masks</li></router-link
                    >
                    <router-link to="/Shop/skincare/face-mark"
                      ><li>Face Marks</li></router-link
                    >
                    <router-link to="/Shop/skincare/sheet-mark"
                      ><li>Sheet Marks</li></router-link
                    >
                    <router-link to="/Shop/skincare/eye-mark"
                      ><li>Eye Marks</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/Shop/skincare/eye-care"
                      ><li class="font-bold">Eye Care</li></router-link
                    >
                    <router-link to="/Shop/skincare/eye-cream"
                      ><li>Eye Creams & Treatments</li></router-link
                    >
                    <router-link to="/Shop/skincare/lip-balm"
                      ><li class="font-bold">
                        Lip Balms & Treatments
                      </li></router-link
                    >
                    <router-link to="/Shop/skincare/sun-screen"
                      ><li class="font-bold">Sunscreen</li></router-link
                    >
                    <router-link to="/Shop/skincare/body-screen"
                      ><li>Body Screen</li></router-link
                    >
                    <router-link to="/Shop/skincare/sun-screen"
                      ><li>Face Screen</li></router-link
                    >
                    <router-link to="/Shop/skincare/high-tech"
                      ><li class="font-bold">High Tech Tools</li></router-link
                    >
                    <router-link to="/Shop/skincare/wellness"
                      ><li>Wellness</li></router-link
                    >
                    <router-link to="/Shop/skincare/supplement"
                      ><li>Supplements</li></router-link
                    >
                    <router-link to="/Shop/skincare/feminine-care"
                      ><li>Feminine Care</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <li class="font-bold">Shop By Concern</li>
                    <router-link to="/Shop/skincare/acne-blemishes"
                      ><li>Acne & Blemishes</li></router-link
                    >
                    <router-link to="/Shop/skincare/anti-aging"
                      ><li>Anti-Aging</li></router-link
                    >
                    <router-link to="/Shop/skincare/dark-spot"
                      ><li>Dark Spots</li></router-link
                    >
                    <router-link to="/Shop/skincare/pore"
                      ><li>Pores</li></router-link
                    >
                    <router-link to="/Shop/skincare/dry"
                      ><li>Dryness</li></router-link
                    >
                    <router-link to="/Shop/skincare/fineline-wrinkles"
                      ><li>Fine Lines & Wrinkles</li></router-link
                    >
                    <router-link to="/Shop/skincare/dulless"
                      ><li>Dullness</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/Shop/skincare/new"
                      ><li class="font-bold">New</li></router-link
                    >
                    <router-link to="/Shop/skincare/betsellers"
                      ><li class="font-bold">BestSellers</li></router-link
                    >
                    <router-link to="/Shop/skincare/clean-skincare"
                      ><li class="font-bold">Clean Skincare</li></router-link
                    >
                    <router-link to="/Shop/skincare/vegan-skincare"
                      ><li class="font-bold">Vegan Skincare</li></router-link
                    >
                    <router-link to="/Shop/skincare/value-giftSet"
                      ><li class="font-bold">Value & Gift Sets</li></router-link
                    >
                    <router-link to="/Shop/skincare/mini-size"
                      ><li class="font-bold">Mini Size</li></router-link
                    >
                    <router-link to="/Shop/skincare/value-size"
                      ><li class="font-bold">Value Size</li></router-link
                    >
                    <router-link to="/Shop/skincare/refillable-skincare"
                      ><li class="font-bold">
                        Refillable Skincare
                      </li></router-link
                    >
                    <router-link to="/Shop/skincare/fsa-hsa-eligible"
                      ><li class="font-bold">
                        FSA & HSA Eligible
                      </li></router-link
                    >
                    <router-link to="/Shop/skincare/beauty-collection"
                      ><li class="font-bold">Beauty Collection</li></router-link
                    >
                    <router-link to="/Shop/skincare/luxury-skincare"
                      ><li class="font-bold">Luxury Skincare</li></router-link
                    >
                    <router-link to="/Shop/skincare/black-owned"
                      ><li class="font-bold">
                        Black-Owned Brands Skincare
                      </li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <li class="font-bold">Help Me Choose</li>
                    <router-link to="/Shop/skincare/better-skin-fast"
                      ><li>Better Skin Fast</li></router-link
                    >
                    <router-link to="/Shop/skincare/minimalist-skincare"
                      ><li>Minimalist Skincare Routines</li></router-link
                    >
                    <router-link to="/Shop/skincare/skincare-quiz"
                      ><li>Skincare Quiz</li></router-link
                    >
                    <router-link to="/Shop/skincare/skin-routin-quiz"
                      ><li>Skin Routine Quiz</li></router-link
                    >
                    <router-link to="/Shop/skincare/fsa-hsa-guide"
                      ><li>FSA/HSA Guide</li></router-link
                    >
                    <router-link to="/Shop/skincare/planet-aware"
                      ><li>Planet Aware Beauty</li></router-link
                    >
                    <router-link to="/Shop/skincare/wellnest"
                      ><li>The Wellness Edit</li></router-link
                    >
                    <router-link to="/Shop/skincare/best-skincare"
                      ><li>Best Skincare Under $35</li></router-link
                    >
                    <router-link to="/Shop/skincare/clean-skincare"
                      ><li>Clean Skincare Guide</li></router-link
                    >
                    <router-link to="/Shop/skincare/skincare-by-age"
                      ><li>Skincare by Age</li></router-link
                    >
                    <router-link to="/Shop/skincare/skin-type"
                      ><li>Skincare for Your Skin Type</li></router-link
                    >
                  </ul>
                </div>
              </div>
              <!--  -->
              <div
                v-if="navigation.name === 'Hair'"
                class="pt-32 mt-4 border-b-2 shadow-lg dropdown_content max-h-min bg-slate-100 shadow-indigo-500/50 border-x-2"
              >
                <div class="relative grid h-full grid-cols-7 gap-3 bottom-16">
                  <ul class="pl-5">
                    <router-link to="/Shop/hair/all-hair"
                      ><li class="pb-2 font-bold">All Hair</li></router-link
                    >
                    <li class="font-bold">Shampoo & Conditioner</li>
                    <router-link to="/Shop/hair/shampoo"
                      ><li>Shampoo</li></router-link
                    >
                    <router-link to="/Shop/hair/condictioner"
                      ><li>Conditioner</li></router-link
                    >
                    <router-link to="/Shop/hair/scalp-scrub"
                      ><li>Scalp Scrub</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/Shop/hair/treatment"
                      ><li class="font-bold">Treatments</li></router-link
                    >
                    <router-link to="/Shop/hair/mask"
                      ><li>Hair Masks</li></router-link
                    >
                    <router-link to="/Shop/hair/leave-in-condictioner"
                      ><li>Leave-in Conditioner</li></router-link
                    >
                    <router-link to="/Shop/hair/hair-oil"
                      ><li>Hair Oils</li></router-link
                    >
                    <router-link to="/Shop/hair/hair-serum"
                      ><li>Hair Serums</li></router-link
                    >
                    <router-link to="/Shop/hair/scalp-treatment"
                      ><li>Scalp Treatments</li></router-link
                    >
                    <router-link to="/Shop/hair/hair-supplement"
                      ><li>Hair Supplements</li></router-link
                    >
                    <router-link to="/Shop/hair/hair-thinning-hair-loss"
                      ><li>Hair Thinning & Hair Loss</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/Shop/hair/hair-styling"
                      ><li class="font-bold">Styling</li></router-link
                    >
                    <router-link to="/Shop/hair/styling-cream-spray"
                      ><li>Styling Creams & Sprays</li></router-link
                    >
                    <router-link to="/Shop/hair/dry-shampoo"
                      ><li>Dry Shampoo</li></router-link
                    >
                    <router-link to="/Shop/hair/hair-primer-heat-protectant"
                      ><li>Hair Primers & Heat Protectants</li></router-link
                    >
                    <router-link to="/Shop/hair/hair-spray"
                      ><li>Hair Spray</li></router-link
                    >
                    <router-link to="/Shop/hair/mouse-foam"
                      ><li>Mousse & Foam</li></router-link
                    >
                    <router-link to="/Shop/hair/gel-pomade-wax"
                      ><li>Gel, Pomade & Wax</li></router-link
                    >
                    <router-link to="/Shop/hair/curly-hair"
                      ><li>Curly, Coily, Textured Hair Care</li></router-link
                    >
                    <router-link to="/Shop/hair/hair-dry"
                      ><li>Hair Dye & Root Touch-Ups</li></router-link
                    >
                    <router-link to="/Shop/hair/hair-thinning-hair-loss"
                      ><li>Hair Thinning & Hair Loss</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/Shop/hair/value-giftSet"
                      ><li class="font-bold">Value & Gift Sets</li></router-link
                    >
                    <router-link to="/Shop/hair/hair-bodyMist"
                      ><li class="font-bold">Hair & Body Mist</li></router-link
                    >
                    <router-link to="/Shop/hair/tool"
                      ><li class="font-bold">Tools</li></router-link
                    >
                    <router-link to="/Shop/hair/dry-hair"
                      ><li>Hair Dryers</li></router-link
                    >
                    <router-link to="/Shop/hair/straightener-flat"
                      ><li>Hair Straighteners & Flat Irons</li></router-link
                    >
                    <router-link to="/Shop/hair/blow-dry"
                      ><li>Blow Dry Brushes</li></router-link
                    >
                    <router-link to="/Shop/hair/curling-iron"
                      ><li>Curling Irons</li></router-link
                    >
                    <router-link to="/Shop/hair/brushes-comb"
                      ><li class="font-bold">Brushes & Combs</li></router-link
                    >
                    <router-link to="/Shop/hair/accessory"
                      ><li class="font-bold">Accessories</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <li class="font-bold">Shop by Concern</li>

                    <router-link to="/Shop/hair/damaged-hair"
                      ><li>Damaged Hair</li></router-link
                    >
                    <router-link to="/Shop/hair/dryness"
                      ><li>Dryness</li></router-link
                    >
                    <router-link to="/Shop/hair/frizz"
                      ><li>Frizz</li></router-link
                    >
                    <router-link to="/Shop/hair/scalp-care"
                      ><li>Scalp Care</li></router-link
                    >
                    <router-link to="/Shop/hair/volume"
                      ><li>Volume</li></router-link
                    >
                    <router-link to="/Shop/hair/color-hair"
                      ><li>Color Care</li></router-link
                    >

                    <li class="font-bold">Shop by Style</li>
                    <router-link to="/Shop/hair/volume-texture"
                      ><li>Volume & Texture</li></router-link
                    >
                    <router-link to="/Shop/hair/smooth-sleek"
                      ><li>Smooth & Sleek</li></router-link
                    >
                    <router-link to="/Shop/hair/curl-enhancing"
                      ><li>Curl Enhancing</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/Shop/hair/new"
                      ><li class="font-bold">New</li></router-link
                    >
                    <router-link to="/Shop/hair/betsellers"
                      ><li class="font-bold">BestSellers</li></router-link
                    >
                    <router-link to="/Shop/hair/clean-hair"
                      ><li class="font-bold">Clean Hair Care</li></router-link
                    >
                    <router-link to="/Shop/hair/vegan-hair"
                      ><li class="font-bold">Vegan Hair Care</li></router-link
                    >
                    <router-link to="/Shop/hair/value-giftSet"
                      ><li class="font-bold">Value & Gift Sets</li></router-link
                    >
                    <router-link to="/Shop/hair/mini-size"
                      ><li class="font-bold">Mini Size</li></router-link
                    >
                    <router-link to="/Shop/hair/value-size"
                      ><li class="font-bold">Value Size</li></router-link
                    >
                    <router-link to="/Shop/hair/refillable-hair"
                      ><li class="font-bold">
                        Refillable Hair Care
                      </li></router-link
                    >
                    <router-link to="/Shop/hair/fsa-hsa-eligible"
                      ><li class="font-bold">
                        FSA & HSA Eligible
                      </li></router-link
                    >
                    <router-link to="/Shop/hair/beauty-collection"
                      ><li class="font-bold">Beauty Collection</li></router-link
                    >
                    <router-link to="/Shop/hair/luxury-hair"
                      ><li class="font-bold">Luxury Hair Care</li></router-link
                    >
                    <router-link to="/Shop/hair/black-owned"
                      ><li class="font-bold">
                        Black-Owned Brands Hair Care
                      </li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/Shop/hair/help-choose"
                      ><li class="font-bold">Help Me Choose</li></router-link
                    >
                    <router-link to="/Shop/hair/healthy-care"
                      ><li>Healthy Hair Care Guide</li></router-link
                    >
                    <router-link to="/Shop/hair/easy-styling"
                      ><li>Easy Styling Must-Haves</li></router-link
                    >
                    <router-link to="/Shop/hair/dry-hair"
                      ><li>The Dry Hair Reset</li></router-link
                    >
                    <router-link to="/Shop/hair/best-shampoos"
                      ><li>Best Shampoos</li></router-link
                    >
                    <router-link to="/Shop/hair/hair-quiz"
                      ><li>Hair Quiz</li></router-link
                    >
                    <router-link to="/Shop/hair/clean-hair"
                      ><li>Clean Hair Care Guide</li></router-link
                    >
                    <router-link to="/Shop/hair/shiny-healthy"
                      ><li>Shiny, Healthy Hair Guide</li></router-link
                    >
                    <router-link to="/Shop/hair/curly-coily"
                      ><li>
                        Curly, Coily, Textured Hair Care Guide
                      </li></router-link
                    >
                    <router-link to="/Shop/hair/healthy-scalp"
                      ><li>Healthy Scalp Care Guide</li></router-link
                    >
                  </ul>
                </div>
              </div>
              <!--  -->
              <div
                v-if="navigation.name === 'Fragrance'"
                class="pt-32 mt-4 border-b-2 shadow-lg dropdown_content max-h-min bg-slate-100 shadow-indigo-500/50 border-x-2"
              >
                <div class="relative grid h-full grid-cols-5 gap-3 bottom-16">
                  <ul class="pl-5">
                    <router-link to="/Shop/fragrance/all-fragrance"
                      ><li class="pb-2 font-bold">
                        All Fragrance
                      </li></router-link
                    >
                    <router-link to="/Shop/fragrance/for-woman"
                      ><li class="font-bold">Woman</li></router-link
                    >
                    <router-link to="/Shop/fragrance/perfume"
                      ><li>Perfume</li></router-link
                    >
                    <router-link to="/Shop/fragrance/perfume-oil"
                      ><li>Perfume Oils</li></router-link
                    >
                    <router-link to="/Shop/fragrance/rollerball-travel"
                      ><li>Rollerballs & Travel Size</li></router-link
                    >
                    <router-link to="/Shop/fragrance/bodyMist-hairMist"
                      ><li>Body Mist & Hair Mist</li></router-link
                    >
                    <router-link to="/Shop/fragrance/for-man"
                      ><li class="font-bold">Man</li></router-link
                    >
                    <router-link to="/Shop/fragrance/bodyMist-hairMist"
                      ><li class="pb-2">Cologne</li></router-link
                    >
                    <router-link to="/Shop/fragrance/bodyMist-hairMist"
                      ><li class="font-bold">
                        Unisex / Genderless
                      </li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/Shop/fragrance/value-giftSet"
                      ><li class="font-bold">Value & Gift Sets</li></router-link
                    >
                    <router-link to="/Shop/fragrance/perfume-giftSet"
                      ><li>Perfume Gift Sets</li></router-link
                    >
                    <router-link to="/Shop/fragrance/cologne-giftSet"
                      ><li>Cologne Gift Sets</li></router-link
                    >
                    <router-link to="/Shop/fragrance/home-giftSet"
                      ><li>Home Gift Sets</li></router-link
                    >
                    <router-link to="/Shop/fragrance/beauty-giftSet"
                      ><li>beauty Favorites</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/Shop/fragrance/value-giftSet"
                      ><li class="font-bold">
                        Candles & Home Scents
                      </li></router-link
                    >
                    <router-link to="/Shop/fragrance/perfume-giftSet"
                      ><li>Candles</li></router-link
                    >
                    <router-link to="/Shop/fragrance/cologne-giftSet"
                      ><li>Diffusers</li></router-link
                    >

                    <li class="font-bold">Shop by Fragrance Family</li>
                    <router-link to="/Shop/fragrance/floral"
                      ><li>Floral</li></router-link
                    >
                    <router-link to="/Shop/fragrance/fresh"
                      ><li>Fresh</li></router-link
                    >
                    <router-link to="/Shop/fragrance/warm-spicy"
                      ><li>Warm & Spicy</li></router-link
                    >
                    <router-link to="/Shop/fragrance/earthy-woody"
                      ><li>Earthy & Woody</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/Shop/fragrance/new"
                      ><li class="font-bold">New</li></router-link
                    >
                    <router-link to="/Shop/fragrance/betsellers"
                      ><li class="font-bold">BestSellers</li></router-link
                    >
                    <router-link to="/Shop/fragrance/clean-fragrance"
                      ><li class="font-bold">Clean Fragrance</li></router-link
                    >
                    <router-link to="/Shop/fragrance/vegan-fragrance"
                      ><li class="font-bold">Vegan Fragrance</li></router-link
                    >
                    <router-link to="/Shop/fragrance/value-giftSet"
                      ><li class="font-bold">Value & Gift Sets</li></router-link
                    >
                    <router-link to="/Shop/fragrance/mini-size"
                      ><li class="font-bold">Mini Size</li></router-link
                    >
                    <router-link to="/Shop/fragrance/value-size"
                      ><li class="font-bold">Value Size</li></router-link
                    >
                    <router-link to="/Shop/fragrance/refillable-fragrance"
                      ><li class="font-bold">
                        Refillable Fragrance
                      </li></router-link
                    >
                    <router-link to="/Shop/fragrance/fsa-hsa-eligible"
                      ><li class="font-bold">
                        FSA & HSA Eligible
                      </li></router-link
                    >
                    <router-link to="/Shop/fragrance/beauty-collection"
                      ><li class="font-bold">Beauty Collection</li></router-link
                    >
                    <router-link to="/Shop/fragrance/luxury-fragrance"
                      ><li class="font-bold">Luxury Fragrance</li></router-link
                    >
                    <router-link to="/Shop/fragrance/black-owned"
                      ><li class="font-bold">
                        Black-Owned Brands Fragrance
                      </li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/Shop/fragrance/help-choose"
                      ><li class="font-bold">Help Me Choose</li></router-link
                    >
                    <router-link to="/Shop/fragrance/new-now"
                      ><li>The New & Now Fragrance Edit</li></router-link
                    >
                    <router-link to="/Shop/fragrance/clean-guide"
                      ><li>Clean Fragrance Guide</li></router-link
                    >
                    <router-link to="/Shop/fragrance/quiz"
                      ><li>Fragrance Quiz</li></router-link
                    >
                    <router-link to="/Shop/fragrance/guide"
                      ><li>Fragrance Guide</li></router-link
                    >
                    <router-link to="/Shop/fragrance/note-guide"
                      ><li>Fragrance Notes Guide</li></router-link
                    >
                    <router-link to="/Shop/fragrance/best-affordable"
                      ><li>Best Affordable Fragrance</li></router-link
                    >
                    <router-link to="/Shop/fragrance/niche"
                      ><li>Niche Fragrances</li></router-link
                    >
                    <router-link to="/Shop/fragrance/next-big-thing"
                      ><li>Next Big Thing</li></router-link
                    >
                  </ul>
                </div>
              </div>
              <!--  -->
              <div
                v-if="navigation.name === 'Tools & Brushes'"
                class="pt-32 mt-1 border-b-2 shadow-lg dropdown_content max-h-min bg-slate-100 shadow-indigo-500/50 border-x-2"
              >
                <div
                  class="relative grid h-full grid-cols-5 gap-1 bottom-16 text-ellipsis"
                >
                  <ul class="pl-3">
                    <router-link to="/Shop/tool&brushes/all"
                      ><li class="font-bold">
                        All Tools & Brushes
                      </li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/beauty-collection"
                      ><li class="font-bold">Beauty Collection</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/beauty-brushes"
                      ><li class="font-bold">
                        Brushes & Applicators
                      </li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/brushes-set"
                      ><li>Brush Sets</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/face-brushes"
                      ><li>Face Brushes</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/eye-brushes"
                      ><li>Eye Brushes</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/lip-brushes"
                      ><li>Lip Brushes</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/sponges"
                      ><li>Sponges & Applicators</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/cleaner"
                      ><li>Brush Cleaners</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/facial-cleaning"
                      ><li>Facial Cleansing Brushes</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <li class="font-bold">Hair tools</li>
                    <router-link to="/Shop/tool&brushes/hair-dryer"
                      ><li>Hair Dryers</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/straighteners"
                      ><li>Straighteners & Flat Irons</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/curling-iron"
                      ><li>Curling Irons</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/brushes-comb"
                      ><li>Brushes & Combs</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/accessory"
                      ><li>Accessories</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/wellness"
                      ><li class="mt-3 font-bold">Wellness</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/tool-device"
                      ><li>Wellness Tools & Devices</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/vibrator"
                      ><li>Vibrators</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link
                      to="/Shop/tool&brushes/beauty-tools"
                      class="font-bold"
                      >Beauty & Tools</router-link
                    >
                    <router-link to="/Shop/tool&brushes/anti-aging"
                      ><li>Anti-Aging</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/teeth-whitening"
                      ><li>Teeth Whitening</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/hair-removal"
                      ><li>Hair Removal</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/tweezer-eyebrow"
                      ><li>Tweezers & Eyebrows</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/manicure-pedicure"
                      ><li>Manicure & Pedicure</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/eyelash-curler"
                      ><li>Eyelash Curlers</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/sharpener"
                      ><li>Sharpeners</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/Shop/tool&brushes/sharpener"
                      ><li class="font-bold">
                        Makeup & Travel Cases
                      </li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/sharpener"
                      ><li class="font-bold">Value & Gift Sets</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/sharpener"
                      ><li class="font-bold">New</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/sharpener"
                      ><li class="font-bold">Bestsellers</li></router-link
                    >
                    <router-link to="/Shop/tool&brushes/sharpener"
                      ><li class="font-bold">
                        Black-Owned Brands Tools & Brushes
                      </li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/Shop/brands/beauty-collection"
                      ><img
                        src="E:\Booking App\Booking App\client\src\assets\image\image_product\category_img\tool-brushes.png"
                        class="pr-4"
                        alt=""
                      />
                    </router-link>
                  </ul>
                </div>
              </div>
              <!--  -->
              <div
                v-if="navigation.name === 'Bath & Body'"
                class="visible pt-32 mt-1 border-b-2 shadow-lg dropdown_content max-h-min bg-slate-100 shadow-indigo-500/50 border-x-2"
              >
                <div
                  class="relative grid h-full grid-cols-5 gap-1 bottom-16 text-ellipsis"
                >
                  <ul class="pl-5">
                    <router-link to="/Shop/bath&body/getAll" class="font-bold"
                      >All Bath & Body</router-link
                    >
                    <router-link to="/Shop/bath&body/bath-shower"
                      ><li>Bath & Shower</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li>Body Wash & Shower Gel</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li>Scrubs & Exfoliants</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li>Bath Soaks & Bubble Bath</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li>Hand Sanitizer & Hand Soap</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li class="font-bold">Body Moisturizers</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li>Body Lotions & Body Oils</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li>Hand Cream & Foot Cream</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/Shop/bath&body/getAll" class="font-bold"
                      >Deodorant & Antiperspirant</router-link
                    >
                    <router-link
                      to="/Shop/bath&body/body-hair-mist"
                      class="font-bold"
                      ><li>Body Mist & Hair Mist</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll" class="font-bold"
                      ><li class="mt-4">Sunscreen</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li class="">Face Sunscreen</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li class="">Body Sunscreen</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll" class="font-bold"
                      >Self Tanners</router-link
                    >
                    <router-link to="/Shop/bath&body/getAll" class="font-bold"
                      ><li class="mt-4">Wellness</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li class="">Supplements</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li class="">Intimate Care & Vibrators</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li class="">Feminine Care</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/Shop/bath&body/getAll"
                      ><li class="font-bold">
                        Candles & Home Scents
                      </li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li class="font-bold">Shop By Concern</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li class="">Dryness / Dry Skin</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li class="">Smooth Texture</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li class="">
                        Even Skin Tone & Color Correction
                      </li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/Shop/bath&body/getAll"
                      ><li class="font-bold">New</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li class="font-bold">Bestsellers</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li class="font-bold">Mini Size</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li class="font-bold">Value Size</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li class="font-bold">Value & Gift Sets</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li class="font-bold">Beauty Collection</li></router-link
                    >
                    <router-link to="/Shop/bath&body/getAll"
                      ><li class="font-bold">
                        Black-Owned Brands Bath & Body
                      </li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <img
                      src="E:\Booking App\Booking App\client\src\assets\image\image_product\category_img\bath_body.png"
                      class="pr-5"
                    />
                  </ul>
                </div>
              </div>
              <!--  -->
              <div
                v-if="navigation.name === 'MiniSize'"
                class="dropdown_content max-h-min pt-32 mt-3.5 bg-slate-100 shadow-lg shadow-indigo-500/50 border-x-2 border-b-2"
              >
                <div
                  class="relative grid h-full grid-cols-5 gap-1 bottom-16 text-ellipsis"
                >
                  <ul class="pl-5">
                    <router-link to="/"
                      ><li class="font-bold">All Mini Size</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">Makeup</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">Skincare</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">Hair</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">Bath & Body</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/"
                      ><li class="font-bold">Value & Gift Sets</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">$15 and Under</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">$25 and Under</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">Sephora Favorites</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/"
                      ><img
                        src="E:\Booking App\Booking App\client\src\assets\image\image_product\category_img\mini-size_01.avif"
                        alt=""
                    /></router-link>
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/"
                      ><img
                        src="E:\Booking App\Booking App\client\src\assets\image\image_product\category_img\mini-size_02.avif"
                        class=""
                        alt=""
                    /></router-link>
                  </ul>
                </div>
              </div>
              <!--  -->
              <div
                v-if="navigation.name === 'Gifts & giftCards'"
                class="pt-32 mt-1 border-b-2 shadow-lg dropdown_content max-h-min bg-slate-100 shadow-indigo-500/50 border-x-2"
              >
                <div
                  class="relative grid h-full grid-cols-5 gap-1 bottom-16 text-ellipsis"
                >
                  <ul class="pl-5">
                    <router-link to="/" class="font-bold"
                      ><li>All Gifts</li></router-link
                    >
                    <router-link to="/" class="font-bold"
                      ><li>Gift Finder</li></router-link
                    >
                    <router-link to="/" class="font-bold"
                      ><li>Gift Card</li></router-link
                    >
                    <router-link to="/" class="font-bold"
                      ><li class="">Card Value & Gift Sets</li></router-link
                    >

                    <li class="mt-4 font-bold">By price</li>
                    <router-link to="/"
                      ><li class="">10$ and under</li></router-link
                    >
                    <router-link to="/"
                      ><li class="">15$ and under</li></router-link
                    >
                    <router-link to="/"
                      ><li class="">25$ and under</li></router-link
                    >
                    <router-link to="/"
                      ><li class="">50$ and under</li></router-link
                    >
                    <router-link to="/"
                      ><li class="">75$ and under</li></router-link
                    >
                    <router-link to="/"
                      ><li class="">100$ and under</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <li class="font-bold">By Category</li>
                    <router-link to="/" class="font-bold"
                      ><li>Makeup</li></router-link
                    >
                    <router-link to="/"><li>Skincare</li></router-link>
                    <router-link to="/"><li>Hair</li></router-link>
                    <router-link to="/"><li>Fragrance</li></router-link>
                    <router-link to="/"
                      ><li>Candles & Home Scents</li></router-link
                    >
                    <router-link to="/"><li>Tools</li></router-link>
                    <router-link to="/"
                      ><li>Brush Sets & Accessories</li></router-link
                    >
                    <router-link to="/"><li>Bath & Body</li></router-link>
                  </ul>
                  <ul class="pl-5">
                    <li class="font-bold">By Recipient</li>
                    <router-link to="/"><li>For Her</li></router-link>
                    <router-link to="/"><li>For Mom</li></router-link>
                    <router-link to="/"><li>For Him</li></router-link>
                    <router-link to="/"><li>For Teenagers</li></router-link>
                    <router-link to="/"><li>For Them</li></router-link>
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/"
                      ><li class="font-bold">Top Rated Gifts</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">Mini Size</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">Only at Beauty</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">Lexury Gifts</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">The lexury guides</li></router-link
                    >
                  </ul>
                  <ul class="pl-5">
                    <router-link to="/">
                      <img
                        src="E:\Booking App\Booking App\client\src\assets\image\image_product\category_img\gift_giftsCard.avif"
                        class="pr-5"
                        alt=""
                      />
                    </router-link>
                  </ul>
                </div>
              </div>
              <!--  -->
              <div
                v-if="navigation.name === 'Beauty Under 20$'"
                class="pt-32 mt-1 border-b-2 shadow-lg dropdown_content max-h-min bg-slate-100 shadow-indigo-500/50 border-x-2"
              >
                <div
                  class="relative grid h-full grid-cols-5 gap-1 bottom-16 text-ellipsis"
                >
                  <ul class="px-5">
                    <router-link to="/"
                      ><li class="font-bold">Makeup under 20$</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">
                        Skincare Under $20
                      </li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">Haircareunder 20$</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">
                        Fragrance under 20$
                      </li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">
                        Tools & Brushes under 20$
                      </li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">
                        Bath & Body under 20$
                      </li></router-link
                    >
                  </ul>
                  <ul class="px-5">
                    <router-link to="/"
                      ><li class="font-bold">
                        Beauty Collections under 20$
                      </li></router-link
                    >
                    <router-link to="/"><li>Makeup</li></router-link>
                    <router-link to="/"><li>Skincare</li></router-link>
                    <router-link to="/"><li>Haircare</li></router-link>
                    <router-link to="/"
                      ><li>Candles & Home Scents</li></router-link
                    >
                    <router-link to="/"><li>Tools & Brushes</li></router-link>
                    <router-link to="/"><li>Bath & Body</li></router-link>
                    <router-link to="/"><li>Value & Gifts Set</li></router-link>
                    <router-link to="/"><li>Clean Beauty</li></router-link>
                  </ul>
                  <ul class="px-5"></ul>
                  <ul class="px-5">
                    <router-link to="/"
                      ><img
                        src="E:\Booking App\Booking App\client\src\assets\image\image_product\category_img\beauty_under_20$.avif"
                        alt=""
                    /></router-link>
                  </ul>
                </div>
              </div>
              <!--  -->
              <div
                v-if="navigation.name === 'Sale & Offers'"
                class="pt-32 mt-1 border-b-2 shadow-lg dropdown_content max-h-min bg-slate-100 shadow-indigo-500/50 border-x-2"
              >
                <div
                  class="relative grid h-full grid-cols-5 gap-1 bottom-16 text-ellipsis"
                >
                  <ul class="px-5">
                    <router-link to="/"
                      ><li class="font-bold">All Sale</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">Makeup</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">Skincare</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">Haircare</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">Frangrance</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">Tools & Brushes</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">Bath & Body</li></router-link
                    >
                    <router-link to="/"
                      ><li class="font-bold">Mini Size</li></router-link
                    >
                  </ul>
                  <ul class="px-5">
                    <router-link to="/"
                      ><li class="font-bold">Beauty Offers</li></router-link
                    >
                  </ul>
                  <ul class="px-5">
                    <router-link to="/"
                      ><img
                        src="E:\Booking App\Booking App\client\src\assets\image\image_product\category_img\sale_offers_01.webp"
                        alt=""
                    /></router-link>
                  </ul>
                  <ul class="px-5">
                    <router-link to="/"
                      ><img
                        src="E:\Booking App\Booking App\client\src\assets\image\image_product\category_img\sale_offers_02.avif"
                        alt=""
                    /></router-link>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile menu, show/hide based on menu state. -->
      <div class="sm:hidden" id="mobile-menu">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <a
            v-for="nav in navigations"
            :key="nav.router"
            :href="nav.router"
            class="block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
          >
            {{ nav.name }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth.store";
import { jwtDecode } from "jwt-decode";
import { loginApi, logoutAccountApi } from "../service/auth.service";
import SearchWrapper from "../components/search/SearchWrapper.vue";
import Avatar from "../components/atoms/Avatar.vue";
export default {
  name: "Header",
  components: {
    SearchWrapper,
    Avatar,
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore().state;
    const name = ref("");
    const items = reactive([
      {
        router: "/Login-Page",
      },
    ]);
    const navigations = reactive([
      { name: "New", href: "#", current: false, router: "/Shop/new" },
      { name: "Brands", href: "#", current: false, router: "/Shop/brands" },
      { name: "Makeup", href: "#", current: false, router: "/Shop/makeup" },
      { name: "Skincare", href: "#", current: false, router: "/Shop/skincare" },
      { name: "Hair", href: "#", current: false, router: "/Shop/hair" },
      {
        name: "Fragrance",
        href: "#",
        current: false,
        router: "/Shop/fragrance",
      },
      {
        name: "Tools & Brushes",
        href: "#",
        current: false,
        router: "/Shop/tools&brushes",
      },
      {
        name: "Bath & Body",
        href: "#",
        current: false,
        router: "/Shop/bath&body",
      },
      { name: "MiniSize", href: "#", current: false, router: "/Shop/miniSize" },
      {
        name: "Gifts & giftCards",
        href: "#",
        current: false,
        router: "/Shop/gifts&giftCards",
      },
      {
        name: "Beauty Under 20$",
        href: "#",
        current: false,
        router: "/Shop/beautyUnder20$",
      },
      {
        name: "Sale & Offers",
        href: "#",
        current: false,
        router: "/Shop/sale&offers",
      },
    ]);
    const currentDropdown = ref(null);
    const showDropdown = (name) => {
      currentDropdown.value = name;
    };
    const logoutAccount = async () => {
      try {
        await logoutAccountApi().then(() => {
          authStore.isLoggedIn = false;
          authStore.user = null;
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("authState");
          localStorage.removeItem("userInfo");
          router.push({ path: "/Login-Page" });
        });
      } catch (error) {
        router.push({ path: "/NotFound404" });
      }
    };
    const getName = async () => {
      try {
        await loginApi(user).then((res) => {
          const data = res["data"];
          const accessToken = localStorage.getItem(
            "accessToken",
            data.accessToken
          );
          jwtDecode(accessToken);

          name.value = data.userData.name;
        });
      } catch (error) {
        return error;
      }
    };

    return {
      router,
      items,
      name,
      navigations,
      currentDropdown,
      showDropdown,
      authStore,
      logoutAccount,
      getName,
    };
  },
};
</script>

<style lang="css" scoped>
.font-inter {
  font-family: "Inter", sans-serif;
}
.dropdown_content {
  display: block;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 100%;
  position: absolute;
  left: 0;
  background: linear-gradient(to bottom, #fdf2f8, #ffffff);
  z-index: 9999;
}
#navigation {
  z-index: 1000;
}
#navigation::after {
  content: "";
  background-color: rgb(31 41 55);
  width: 3rem;
  height: 1rem;
  position: absolute;
  top: 3rem;
  margin-left: 0.8rem;
  z-index: 1;
}
.group:hover .absolute.right-0 {
  z-index: 9999 !important;
}
#navigation:hover .dropdown_content {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

li {
  font-family: "Times New Roman", Times, serif;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
}
li:hover {
  font-weight: bolder;
}
a:hover {
  font-weight: bold;
}
</style>