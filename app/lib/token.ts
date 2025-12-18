import Cookies from "js-cookie";

// Salvar o token no cookie
export function saveToken(token: string) {
    Cookies.set("authToken", token, { expires: 1 });
}

// Recuperar o token do cookie
export function getToken(): string | undefined {
    return Cookies.get("authToken");
}

export function removeToken() {
    Cookies.remove("authToken");
}