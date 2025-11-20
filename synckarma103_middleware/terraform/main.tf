terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "4.1.0"
    }
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
  subscription_id = "8fe98c6f-6599-4482-968b-f3a8d9d7e00f"
}

resource "azurerm_resource_group" "resource_group" {
  name     = var.azurerm_resource_group
  location = var.location
}

resource "azurerm_log_analytics_workspace" "analytics_workspace" {
  name                = var.azurerm_log_analytics_workspace_name
  location            = azurerm_resource_group.resource_group.location
  resource_group_name = azurerm_resource_group.resource_group.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_container_registry" "app_registry" {
  name                = var.azurerm_container_app_registry_name
  location            = azurerm_resource_group.resource_group.location
  resource_group_name = azurerm_resource_group.resource_group.name
  sku                 = "Standard"
}

resource "null_resource" "push_image_to_registry" {
  triggers = {
    run_id = var.run_id
  }

  provisioner "local-exec" {
    interpreter = ["/bin/zsh", "-c"]
    command     = <<EOT
      az acr build --registry ${azurerm_container_registry.app_registry.name} --image ${var.container_image_name}:${var.container_image_tag} --file ./../Dockerfile ./..
    EOT
  }

  depends_on = [azurerm_container_registry.app_registry]
}

resource "azurerm_user_assigned_identity" "identity" {
  name                = var.identity_name
  resource_group_name = azurerm_resource_group.resource_group.name
  location            = var.location
}

resource "azurerm_role_assignment" "acr_pull" {
  scope                = azurerm_container_registry.app_registry.id
  role_definition_name = "acrpull"
  principal_id         = azurerm_user_assigned_identity.identity.principal_id
}

resource "azurerm_container_app_environment" "app_environment" {
  name                       = var.azurerm_container_app_environment_name
  location                   = azurerm_resource_group.resource_group.location
  resource_group_name        = azurerm_resource_group.resource_group.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.analytics_workspace.id
}

resource "azurerm_container_app" "app" {
  name                         = var.azurerm_container_app_name
  container_app_environment_id = azurerm_container_app_environment.app_environment.id
  resource_group_name          = azurerm_resource_group.resource_group.name
  revision_mode                = "Multiple"

  lifecycle {
    replace_triggered_by = [null_resource.push_image_to_registry]
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.identity.id]
  }

  registry {
    server   = azurerm_container_registry.app_registry.login_server
    identity = azurerm_user_assigned_identity.identity.id
  }

  template {
    container {
      name   = var.container_name
      image  = "${azurerm_container_registry.app_registry.login_server}/${var.container_image_name}:${var.container_image_tag}"
      cpu    = 0.25
      memory = "0.5Gi"
      env {
        name  = "SF_ACCESS_TOKEN"
        value = var.sf_access_token
      }
      env {
        name  = "SF_INSTANCE_URL"
        value = var.sf_instance_url
      }
      env {
        name  = "SF_ORG_ID"
        value = var.sf_org_id
      }
    }
  }

  depends_on = [
    null_resource.push_image_to_registry,
    azurerm_role_assignment.acr_pull
  ]

}

output "azurerm_container_app_url" {
  value = azurerm_container_app.app.latest_revision_fqdn
}

output "azurerm_container_app_revision_name" {
  value = azurerm_container_app.app.latest_revision_name

}