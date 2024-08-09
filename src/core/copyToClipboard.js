export default async (event, value) => {
    if (event) {
        event.preventDefault()
    }
    await navigator.clipboard.writeText(value)
}