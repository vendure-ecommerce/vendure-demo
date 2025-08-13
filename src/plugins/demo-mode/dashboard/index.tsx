import {AlertTitle, defineDashboardExtension, Alert, AlertDescription} from '@vendure/dashboard'

export default defineDashboardExtension({
    login: {
        beforeForm: {
            component: () => (
                <Alert>
                    <AlertTitle>Test Credentials</AlertTitle>
                    <AlertDescription>
                        <div>
                            Username: <code>admin</code><br/>
                            Password: <code>admin</code>
                        </div>
                    </AlertDescription>
                </Alert>
            )
        }
    }
})