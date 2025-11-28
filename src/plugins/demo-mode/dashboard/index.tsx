import {AlertTitle, defineDashboardExtension, Alert, AlertDescription} from '@vendure/dashboard'

export default defineDashboardExtension({
    login: {
        beforeForm: {
            component: () => (
                <>
                    <Alert className="mb-2">
                        <AlertTitle>Test Credentials</AlertTitle>
                        <AlertDescription>
                            <div>
                                Username: <code>admin</code><br/>
                                Password: <code>admin</code>
                            </div>
                        </AlertDescription>
                    </Alert>
                    <Alert variant="destructive">
                        <AlertTitle>Demo Storefront</AlertTitle>
                        <AlertDescription>
                            <a href="https://storefront.demo.vendure.io" target="_blank" rel="noopener noreferrer">
                                storefront.demo.vendure.io
                            </a>
                        </AlertDescription>
                    </Alert>
                </>
            )
        }
    }
})