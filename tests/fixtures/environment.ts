import { configureTestEnvironment } from '../../src/testing/environment'

// Keep this as the fixture entry point's first dependency: validate and sanitize
// the disposable environment before Payload configuration is evaluated.
configureTestEnvironment('database')
