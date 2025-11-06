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

export $(grep -v '^#' .env | xargs)

terraform init -upgrade
terraform fmt
terraform validate
terraform plan -out main.tfplan
terraform apply main.tfplan
terraform destroy

to redeploy
terraform apply -var="run_id=$(date +%s)"


problems - at runtime the Container Apps pulls from synckarmareg.azurecr.io ... it must authenticate separately
== NEED UAMI ==
see: https://stackoverflow.com/questions/79608759/how-do-i-deploy-an-azure-container-app-from-scratch-using-terraform-azurerm

