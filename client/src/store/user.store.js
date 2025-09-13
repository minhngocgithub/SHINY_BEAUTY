// import { defineStore } from "pinia";
// import { ref, computed } from 'vue'
// import { axios } from 'axios'

// export const useAdminStore = defineStore('adminStore', () => {
//     const name = ref('admin')
//     const email = ref('admin@admin.com')

//     const avatar = computed(
//         () => 
//             `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail.value.replace(
//               /[^a-z0-9]+/gi,
//               '-'
//             )}`
//         )

//     const isFieldFocusRegister = ref(false)

//     const clients = ref([])
//     const history = ref([])

//     function setUser(payload) {
//         if(payload.name) {
//             name.value = payload.name
//         }
//         if(payload.email) {
//             email.value = payload.email
//         }
//     }
    
//     return {
//         name,
//         email,
//         avatar,
//         isFieldFocusRegister,
//         clients,
//         history,
//         setUser
//     }

// })
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    const state = ref({
        users: [],
    })

    const setUsers = (data) => {
        state.value.users = data
    }

    const getUser = async (id) => {
        const user = state.value.users.find((user) => user.id === id)
        if(user) return user
        const { data } = await getShopDetail(id)
        state.value.users.push(data)
    }
    
    return {
        state,
        setUsers,
        getUser,
        
    }
})