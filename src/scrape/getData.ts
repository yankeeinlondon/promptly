import { Endpoint, EndpointSuggestions } from "~/types";

export function getData<T extends EndpointSuggestions>(endpoint: T ) {
    return endpoint;
}


