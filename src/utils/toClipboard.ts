import clipboardy from 'clipboardy';
import { ClipboardError } from '~/errors';

/**
 * Copies the provided text to the clipboard.
 * @param text - The text to copy.
 */
export async function toClipboard(text: string): Promise<true | Error> {
    try {
        await clipboardy.write(text);
        return true;
    } catch (error) {
        return ClipboardError(
            `Problem copying content to the clipboard`, 
            { underlying: error as string | Error }
        );
    }
}
