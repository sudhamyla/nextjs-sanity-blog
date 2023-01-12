import {createClient} from "next-sanity";
import createImageUrlBuilder from '@sanity/image-url';

export const config = {
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    apiVersion: "2022-12-31",
    useCdn: process.env.NODE_ENV === "production",

};

// Set up the client for fetching data in the getProps page functions
export const sanityClient = createClient(config);

// Generating image URL's with only the asset reference data in your documents.
export const urlFor = (source) => createImageUrlBuilder(config).image(source);