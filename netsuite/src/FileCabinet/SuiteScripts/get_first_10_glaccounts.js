/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/search'], function(search) {

    /**
     * Handles GET requests - Returns first 10 GL account names in alphabetical order
     * @param {Object} requestParams - URL parameters
     * @returns {Object} Response with array of GL account names
     */
    function get(requestParams) {
        var glAccountNames = [];

        var accountSearch = search.create({
            type: search.Type.ACCOUNT,
            columns: [
                search.createColumn({
                    name: 'name',
                    sort: search.Sort.ASC
                })
            ]
        });

        var resultSet = accountSearch.run();
        var results = resultSet.getRange({
            start: 0,
            end: 10
        });

        results.forEach(function(result) {
            var name = result.getValue('name');
            if (name) {
                glAccountNames.push(name);
            }
        });

        return {
            count: glAccountNames.length,
            glAccounts: glAccountNames
        };
    }

    return {
        get: get
    };

});
