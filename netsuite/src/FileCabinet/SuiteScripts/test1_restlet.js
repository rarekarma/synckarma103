/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define([], function() {

    /**
     * Handles GET requests
     * @param {Object} requestParams - URL parameters
     * @returns {Object} Response with status 'ok'
     */
    function get(requestParams) {
        return {
            status: 'ok'
        };
    }

    /**
     * Handles POST requests - echoes back the context sent
     * @param {Object} requestBody - The request body/context
     * @returns {Object} The same request body echoed back
     */
    function post(requestBody) {
        return requestBody;
    }

    return {
        get: get,
        post: post
    };

});

