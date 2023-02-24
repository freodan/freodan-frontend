export async function loadServerConfig() {
    return await (await fetch("config.json")).json();
}