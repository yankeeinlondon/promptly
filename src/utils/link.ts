/**
 * **link**`(text, link)`
 *
 * Prints a link to the terminal using a relatively new
 * [standard](https://gist.github.com/egmontkob/eb114294efbcd5adb1944c9f3cb5feda) for making pretty links.
 *
 * You can use the following protocols for your links:
 * - `http` / `https`
 * - `file` (note format is `file://hostname/path/to/file.txt` and hostname
 * IS required)
 * - `mailto`
 */
export function link(text: string, link: string) {
    return `\x1B]8;;${link}\x1B\\${text}\x1B]8;;\x1B\\`;
}

