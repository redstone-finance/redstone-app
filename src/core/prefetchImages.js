export default (imageUrls) => {
    const prefetchPromises = imageUrls.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = resolve
            img.onerror = reject
            img.src = url
        })
    })
    return Promise.all(prefetchPromises)
        .catch(error => console.error('Error prefetching images:', error))
}