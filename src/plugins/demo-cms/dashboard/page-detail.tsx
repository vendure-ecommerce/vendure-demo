import {
    DashboardRouteDefinition,
    detailPageRouteLoader,
    useDetailPage,
    Page,
    PageTitle,
    PageActionBar,
    PageActionBarRight,
    PermissionGuard,
    Button,
    PageLayout,
    PageBlock,
    FormFieldWrapper,
    DetailFormGrid,
    Input,
    RichTextInput,
} from '@vendure/dashboard';
import { AnyRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { graphql } from '@/gql';

const pageDetailDocument = graphql(`
    query GetPageDetail($id: ID!) {
        page(id: $id) {
            id
            createdAt
            updatedAt
            title
            slug
            content
        }
    }
`);

const createPageDocument = graphql(`
    mutation CreatePage($input: CreatePageInput!) {
        createPage(input: $input) {
            id
        }
    }
`);

const updatePageDocument = graphql(`
    mutation UpdatePage($input: UpdatePageInput!) {
        updatePage(input: $input) {
            id
        }
    }
`);

export const pageDetail: DashboardRouteDefinition = {
    path: '/pages/$id',
    loader: detailPageRouteLoader({
        queryDocument: pageDetailDocument,
        breadcrumb: (isNew, entity) => [
            { path: '/pages', label: 'Pages' },
            isNew ? 'New page' : entity?.title,
        ],
    }),
    component: route => {
        return <PageDetailPage route={route} />;
    },
};

function PageDetailPage({ route }: { route: AnyRoute }) {
    const params = route.useParams();
    const navigate = useNavigate();
    const creatingNewEntity = params.id === 'new';
    
    const { form, submitHandler, entity, isPending, resetForm } = useDetailPage({
        queryDocument: pageDetailDocument,
        createDocument: createPageDocument,
        updateDocument: updatePageDocument,
        setValuesForUpdate: page => {
            return {
                id: page?.id ?? '',
                title: page?.title ?? '',
                slug: page?.slug ?? '',
                content: page?.content ?? '',
            };
        },
        params: { id: params.id },
        onSuccess: async data => {
            toast('Successfully saved page');
            resetForm();
            if (creatingNewEntity) {
                await navigate({ to: `../$id`, params: { id: data.id } });
            }
        },
        onError: err => {
            toast('Failed to save page', {
                description: err instanceof Error ? err.message : 'Unknown error',
            });
        },
    });

    return (
        <Page pageId="page-detail" form={form} submitHandler={submitHandler}>
            <PageTitle>{creatingNewEntity ? 'New page' : (entity?.title ?? '')}</PageTitle>
            <PageActionBar>
                <PageActionBarRight>
                    <PermissionGuard requires={['UpdateCatalog']}>
                        <Button
                            type="submit"
                            disabled={!form.formState.isDirty || !form.formState.isValid || isPending}
                        >
                            {creatingNewEntity ? 'Create' : 'Update'}
                        </Button>
                    </PermissionGuard>
                </PageActionBarRight>
            </PageActionBar>
            <PageLayout>
                <PageBlock column="main" blockId="main-form">
                    <DetailFormGrid>
                        <FormFieldWrapper
                            control={form.control}
                            name="title"
                            label="Title"
                            render={({ field }) => <Input {...field} />}
                        />
                        <FormFieldWrapper
                            control={form.control}
                            name="slug"
                            label="Slug"
                            render={({ field }) => <Input {...field} />}
                        />
                    </DetailFormGrid>
                    <FormFieldWrapper
                        control={form.control}
                        name="content"
                        label="Content"
                        render={({ field }) => (
                            <RichTextInput value={field.value ?? ''} onChange={field.onChange} />
                        )}
                    />
                </PageBlock>
            </PageLayout>
        </Page>
    );
}