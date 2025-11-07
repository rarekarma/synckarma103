# run_id is used to rebuild and push the docker image: see resource "null_resource" "push_image" in main.tf
# to redeploy, do: terraform apply -var="run_id=$(date +%s)"
# see: https://stackoverflow.com/questions/79608759/how-do-i-deploy-an-azure-container-app-from-scratch-using-terraform-azurerm
variable "run_id" {
  description = "Id used to rebuild and push the docker image"
  type        = string
  default     = "08921"
}

variable "identity_name" {
  description = "The name of the uami identiry"
  type        = string
  default     = "synckarma-uami"
}

variable "container_name" {
  description = "The name of the container"
  type        = string
  default     = "synckarma"
}

variable "container_image_name" {
  description = "The name of the docker image to build and deploy"
  type        = string
  default     = "synckarma-worker"
}

variable "container_image_tag" {
  description = "The tag of the docker image to build and deploy"
  type        = string
  default     = "latest"
}


variable "azurerm_resource_group" {
  description = "The name for the Azure resource group."
  type        = string
  default     = "synckarma-rg"
}

variable "location" {
  description = "The location for Azure resources."
  type        = string
  default     = "eastus"
}

variable "azurerm_log_analytics_workspace_name" {
  description = "The name for the Azure Log Analytics Workspace."
  type        = string
  default     = "synckarma-law"
}

variable "azurerm_container_app_environment_name" {
  description = "The name for the Azure Container App Environment."
  type        = string
  default     = "synckarma-env"
}

variable "azurerm_container_app_registry_name" {
  description = "The name for the Azure Container registry."
  type        = string
  default     = "synckarmareg"
}

variable "azurerm_container_app_name" {
  description = "The name for the Azure Container App."
  type        = string
  default     = "synckarma-app"
}

variable "sf_access_token" {
  description = "The access token for the Salesforce organization."
  type        = string
  default     = ""
  sensitive   = true
}

variable "sf_instance_url" {
  description = "The instance URL for the Salesforce organization."
  type        = string
  default     = ""
  sensitive   = true
}

variable "sf_org_id" {
  description = "The organization ID for the Salesforce organization."
  type        = string
  default     = ""
  sensitive   = true
}