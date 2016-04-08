## module configuration

```javascript
{
    packer: 'webpack|lasso' // packer package, currently available: webpack and lasso, defaults to lasso
}
```

## React module: What is exporting?
 - `UtFront` - app root element
## Props
  - `UtFront.environment` - based on this prop module will toggle react DevTools (production: hidden, all other: vissible)
  - `UtFront.reducers` - this property should be of type object that holds app reducers.
  - `UtFront.middlewares` - this property should be of type array that holds middlewares.
  - `UtFront.utBus` - is used to pass ut-bus instance to all child elements.. it can be obtained in the following manner [Official documentation](https://facebook.github.io/react/docs/context.html#passing-info-automatically-through-a-tree)
### Default middlewares
  There is few default middlewares that makes our life easy
  - `rpc` middleware(work in progress, still alpha): will watch for parameters `rpc` - string and `data` - object, rpc param should be utBus method name to be called and data will be message data, lets say we need to do a login request, what should we dispatch in order to make request to utbus? The object should be as follows:
    ```javascript
        {
            type: 'LOGIN',
            rpc: 'user.user.login',
            data: {
                'username': '...',
                'password': '...'
            }
    ```
    this will be cough by rpc middleware, it will send the request and will pass following object to redux store:
    ```javascript
        {
            type: 'LOGIN',
            rpcRequestState: 'requested',
            // ..... if there is some extra data it will reside here, but field data and rpc will be removed or altered!!!
        }
    ```

    after we receive the response action following action will be dispached:

    ```javascript
        {
            type: 'LOGIN',
            rpcRequestState: 'finished',
            response: 'ok|error',
            responseDetails: 'result|error object'
        }
    ```
  - `log` middleware(work in progress, still alpha): will watch for `{type: 'UT_LOG', text: '<text to log>'}` and dispatched message will not reach redux storage