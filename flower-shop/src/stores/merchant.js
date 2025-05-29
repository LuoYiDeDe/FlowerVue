import { defineStore } from 'pinia'

export const useMerchantStore = defineStore('merchant', {
  state: () => ({
    merchantInfo: null // 存储商家信息，初始为 null
  }),
  actions: {
    setMerchantInfo(info) {
      this.merchantInfo = info
      // 可以选择将商家信息存储到 localStorage 或 sessionStorage
      // localStorage.setItem('merchantInfo', JSON.stringify(info))
    },
    clearMerchantInfo() {
      this.merchantInfo = null
      // localStorage.removeItem('merchantInfo')
    }
  }
  // 如果需要从 localStorage 初始化 state，可以在这里添加逻辑
  // hydrate(state) {
  //   const info = localStorage.getItem('merchantInfo')
  //   if (info) {
  //     state.merchantInfo = JSON.parse(info)
  //   }
  // }
}) 