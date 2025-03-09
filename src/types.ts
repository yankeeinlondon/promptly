import { Dictionary, Suggest, Uri } from "inferred-types";

export type FailedWebRef = {url: Uri<"http" | "https">; errorCode: number};




export interface Frontmatter {
    title?: string;
    summary?: string;
    /** 
     * boolean flag indicating whether **Promptly** has _interpolated_
     * the code, document, and web references that were originally
     * on the page into blocks embedded in the page.
     */
    __cached?: boolean;
    __codeRefs?: string[];
    __webRefs?: string[];
    __docRefs?: string[];

    [key: string]: unknown;
}

export type Prompt = {
    kind: "prompt";

    /** the filepath to the prompt file used as the source for this prompt */
    promptFile: string;

    frontmatter: Frontmatter;

    lines: number;
    characters: number;

    /**
     * When using a prompt template 
     */
    isCached: boolean;

    errors: Error[];

    /**
     * the references in the file converted into Aider commands
     * (e.g., `/file ...` and `/web ...`)
     */
    aiderContent: string;

    /**
     * the prompt content with all fileRefs and webRefs resolved
     */
    content: string;
    /**
     * the code files which were referenced in the original content
     * and are now embedded into the `content`
     */
    codeRefs: string[];
    /**
     * files which were referenced in the file but were not found
     * in the file system.
     */
    unmatchedCodeRefs: string[];
    /**
     * the websites which were referenced in the original content
     */
    webRefs: Uri<"http" | "https">[];
    /**
     * refences to a a website URL where the URL itself was invalid
     * or where a 404 response was encountered
     */
    invalidWebRefs: string[];

    /**
     * Any non-200 based response (other than 404) which was encountered
     * when trying to build the prompt
     */
    failedWebRefs: FailedWebRef[];
}

export type ConfigFile = {
    promptDirs?: string[];
    codePath?: string[];
    docPath?: string[];
}


export type HttpHeaders = {
    Accept?: Suggest<"*/*"|"application/json"|"text/html">;
    UserAgent?: Suggest<
        "PostmanRuntime/7.43.0" 
        | "Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0" 
        | "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1" 
        | "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" 
        | "curl/7.64.1"
    >;
    "Accept-Encoding"?: Suggest<"gzip, deflate, br">;
    "Connection"?: Suggest<"keep-alive">;
    ReferrerPolicy?: Suggest<"origin-when-cross-origin">;
}

export type HttpVerb__Body = "PUT" | "POST" | "PATCH" | "DELETE";
export type HttpVerb__NoBody = "GET" | "HEAD";

export type HttpVerb = HttpVerb__Body | HttpVerb__NoBody;

export type HttpBody = 
| ""
| `,${string}->${string}`;


/**
 * An explicit definition of 
 */
export type HttpAuth = "" 
| ` using Bearer Token in ENV.${string}`
| ` using API Key in header as { [Env.${string}]: ENV.${string} }`
| ` using API Key in query parameters as { [Env.${string}]: ENV.${string} }`

export type Endpoint = 
    | `${HttpVerb__NoBody} ${Uri<"http"|"https">}${HttpAuth}`
    | `${HttpVerb__Body} ${Uri<"http"|"https">}${HttpBody}${HttpAuth}`

export type EndpointSuggestions = Suggest<
    | "GET https://api.com/user"
    | "GET https://api.com/user?id=123, returns User"
    | "GET https://api.com/user?id=:id"
    | "POST https://api.com/user, User -> boolean"
    | "PUT https://api.com/user/:id, Partial<User> -> boolean"
    | "DELETE https://api.com/user/:id, returns boolean"
>

