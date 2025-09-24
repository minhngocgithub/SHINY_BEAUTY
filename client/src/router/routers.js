import { createRouter, createWebHistory } from 'vue-router'
// Components
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import OAuthCallback from '../views/auth/OAuthCallback.vue'

// Views
import ShopProfile from '../components/profile/ShopProfile.vue'
import HomeView from '../views/HomeView.vue'
import NotFound404 from '../views/NotFound404.vue'
// Admin
import AdminView from '../views/AdminView.vue'
import ProductManage from '../components/admin/ProductManage.vue'
import CreateProduct from '../components/admin/CreateProduct.vue'
import UpdateProduct from '../components/admin/UpdateProduct.vue'
// Profile
import Setting from '../components/profile/Setting.vue';
import ForgotPassword from '../views/auth/ForgotPassword.vue'
import ResetPassword from '../views/auth/ResetPassword.vue'
// Product
import SaleView from '../views/product-page/SaleView.vue'
import FeaturedView from '../views/product-page/FeaturedView.vue'
import productDetail from '../views/ProductDetail.vue'
const routes = [
    {   
        path: '/HomeView', 
        name: 'HomeView',
        component: HomeView
    },
    {
        path: '/Login-Page',
        name: 'LoginPage',
        component: Login
    },
    {
        path: '/Register-Page',
        name: 'RegisterPage',
        component: Register
    },
    {
        path: '/admin',
        name: "Admin",
        component: AdminView,
        children: [
            { 
                path: '/admin/manage-product',
                name: 'ProductManage',
                component: ProductManage
            },
            {
                path: '/create-product',
                name: 'CreateProduct',
                component: CreateProduct
            },
            {
                path: '/update-product',
                name: 'UpdateProduct',
                component: UpdateProduct
            }

        ]
    },   
    {
        path: '/Profile',
        name: 'ShopProfile',
        component: ShopProfile,
    },
    {
        path: '/products',
        children: [
            {
                path: 'sales',
                name: 'SaleView',
                component: SaleView
            },
            {
                path: ':id',
                name: 'ProductDetail',
                component: productDetail,
            },
            
        ]
    },
    {
        path: '/Setting',
        name: 'Setting',
        component: Setting,
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: ForgotPassword,
    },
    {
        path: '/reset-password/:token',
        name: 'ResetPassword',
        component: ResetPassword,
    },
    {
        path: '/oauth-success',
        name: 'OAuthSuccess',
        component: OAuthCallback,
    },
    {
        path: '/oauth-error',
        name: 'OAuthError',
        component: OAuthCallback,
    },
    
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound404',
        component: NotFound404
    }

]

const router = createRouter({
    history: createWebHistory(),
    routes
})
export default router