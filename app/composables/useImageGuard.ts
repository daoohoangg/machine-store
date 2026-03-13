import { ref } from 'vue'

const failedImageUrls = ref<Set<string>>(new Set())

export const useImageGuard = () => {
  const markImageAsFailed = (url: string) => {
    if (url) {
      failedImageUrls.value.add(url)
    }
  }

  const isImageFailed = (url: string) => {
    return url ? failedImageUrls.value.has(url) : true
  }

  return {
    failedImageUrls,
    markImageAsFailed,
    isImageFailed
  }
}
