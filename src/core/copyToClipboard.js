export default async (event, value) => {
    event.preventDefault();
    await navigator.clipboard.writeText(value);
}