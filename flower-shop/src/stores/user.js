import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: null
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.userInfo,
    userId: (state) => state.userInfo?.id,
    userName: (state) => state.userInfo?.username
  },
  
  actions: {
    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },
    
    setToken(token) {
      this.token = token
    },
    
    clearUserInfo() {
      this.userInfo = null
      this.token = null
    }
  },
  
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user',
        storage: localStorage
      }
    ]
  }
}) 