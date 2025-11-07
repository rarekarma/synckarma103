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
terraform apply main.tfplan
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

SF Login
--------
sf org open --target-org scratch-01



