import {
    Button,
    DashboardRouteDefinition,
    ListPage,
    PageActionBarRight,
    DetailPageButton,
} from '@vendure/dashboard';
import { Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { graphql } from '@/gql';

const getPageList = graphql(`
    query GetPages($options: PageListOptions) {
        pages(options: $options) {
            items {
                id
                createdAt
                updatedAt
                title
                slug
                content
            }
            totalItems
        }
    }
`);

const deletePageDocument = graphql(`
    mutation DeletePage($id: ID!) {
        deletePage(id: $id) {
            result
        }
    }
`);

export const pageList: DashboardRouteDefinition = {
    navMenuItem: {
        sectionId: 'marketing',
        id: 'pages',
        url: '/pages',
        title: 'CMS Pages',
    },
    path: '/pages',
    loader: () => ({
        breadcrumb: 'Pages',
    }),
    component: route => (
        <ListPage
            pageId="page-list"
            title="Pages"
            listQuery={getPageList}
            deleteMutation={deletePageDocument}
            route={route}
            defaultVisibility={{
                content: false
            }}
            customizeColumns={{
                title: {
                    cell: ({ row }) => {
                        const page = row.original;
                        return <DetailPageButton id={page.id} label={page.title} />;
                    },
                },
                slug: {
                    header: 'Slug',
                    cell: ({row}) => (
                        <span className="font-mono text-muted-foreground">{row.original.slug}</span>
                    )
                },
            }}
        >
            <PageActionBarRight>
                <Button asChild>
                    <Link to="./new">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New page
                    </Link>
                </Button>
            </PageActionBarRight>
        </ListPage>
    ),
};