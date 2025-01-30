import { readFileSync } from "fs";
import path from "path";

export function getHtmlFile(fileName: string): string {
    return readFileSync(path.join(__dirname, "..", "www", fileName), { encoding: "utf-8" });
}

export function getHeader(loggedIn: boolean, pageTitle: string): string {
    return getHtmlFile("header.html").replace("--replace", loggedIn ? `<li class="nav-item">
                                <a class="nav-link" href="profile">Profil</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="logout">Logout</a>
                            </li>` : `<li class="nav-item">
                                <a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">Login</a>
                            </li>`)
                            .replace("--pageTitle--", pageTitle);
}
