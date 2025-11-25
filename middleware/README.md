az login (or az account show)
... copy the subscription id ...
az account set --subscription "<subscriptionid>"
... do this why? ....
az provider register --namespace Microsoft.App
... create a Service Principal for Terraform authentication...
az ad sp create-for-rbac --role="Contributor" --scopes="/subscriptions/<subscriptionid>"
    {
    "appId": "<appid>",
    "displayName": "azure-cli-2025-11-05-16-52-47",
    "password": "<password>",
    "tenant": "<tenantid>"
    }
... create and export environment variables with the Service Principal credentials ...
export ARM_CLIENT_ID="<appid>"
export ARM_CLIENT_SECRET="<password>"
export ARM_SUBSCRIPTION_ID="<subscriptionid>"
export ARM_TENANT_ID="<tenantid>"

terraform init -upgrade
terraform fmt
terraform validate
terraform plan -out main.tfplan
terraform apply main.tfplan ## run with the environment variables set (.env.terraform)
terraform destroy

== next steps ==
- connect to SFDC (require env vars)
- recognize a transaction that needs to go to NetSuite
- log the transaction to console


SCRATCH_INFO=$(sf org display --target-org scratch-01 --json)
echo "SF_ACCESS_TOKEN=$(echo $SCRATCH_INFO | jq -r '.result.accessToken')" > env.scratch
echo "SF_INSTANCE_URL=$(echo $SCRATCH_INFO | jq -r '.result.instanceUrl')" >> env.scratch
echo "SF_ORG_ID=$(echo $SCRATCH_INFO | jq -r '.result.id')" >> env.scratch 


set -a
source env.middleware
set +a
--- or ---
export $(grep -v '^#' .env.middleware | xargs)

local docker
-------------
docker build -t synckarma-worker:latest .  
docker run --env-file .env.middleware synckarma-worker:latest

docker development
------------------
docker build --build-arg BUILD_DEV_DEPS=true -t synckarma-worker:dev .
docker run --env-file .env.middleware synckarma-worker:dev

docker debugging
----------------
# First, build locally to generate source maps for the debugger
cd middleware
npm run build

# Then build and run the debug container
docker-compose -f docker-compose.debug.yml up --build

# In Cursor/VS Code:
# 1. Set breakpoints in your TypeScript source files (e.g., src/event-handler.ts)
# 2. Go to Run and Debug (Cmd+Shift+D or F5)
# 3. Select "Attach to Docker Container" from the dropdown
# 4. Click the play button or press F5
# 5. The debugger will attach and you can step through code, inspect variables, etc.

# To stop the debug container:
docker-compose -f docker-compose.debug.yml down

SF Commands
-----------
sf org open --target-org scratch-01
sf package installed list --target-org scratch-01
sf project deploy start --source-dir force-app/main/default/lwc/netsuiteCustomerMatch --source-dir force-app/main/default/classes --target-org scratch-02
sf project retrieve start -o scratch-02


To Fix
------
- When LWC 
- LWC spins even when no data
- Order is created on Account, get an AccountChangeEvent with no changedFields?

