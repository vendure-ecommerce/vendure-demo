import gql from 'graphql-tag';

export const shopApiExtensions = gql`
    type Page {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        title: String!
        slug: String!
        content: String!
    }

    extend type Query {
        getPage(slug: String!): Page
    }
`;

export const adminApiExtensions = gql`
    type Page implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        title: String!
        slug: String!
        content: String!
    }

    type PageList implements PaginatedList {
        items: [Page!]!
        totalItems: Int!
    }

    input PageListOptions
    
    input CreatePageInput {
        title: String!
        slug: String!
        content: String!
    }

    input UpdatePageInput {
        id: ID!
        title: String
        slug: String
        content: String
    }


    extend type Query {
        pages(options: PageListOptions): PageList!
        page(id: ID!): Page
    }

    extend type Mutation {
        createPage(input: CreatePageInput!): Page!
        updatePage(input: UpdatePageInput!): Page!
        deletePage(id: ID!): DeletionResponse!
    }
`;