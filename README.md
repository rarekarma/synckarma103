This project hosts middleware that integrates Salesforce with NetSuite.  The salesforce subdirectory holds the SFDX project files that are installed in Salesforce.  The middleware subdirectory hosts a TypeScript implementation of the middleware that runs in docker.  It can be run locally in docker for testing and development.  For production, it runs in an Azure app container. 

Within these 2 top level directories, there is further structure
* middleware/src - the TypeScript middleware
* middleware/terraform - instructions for building the Azure infrastructure and deploying the middleware
