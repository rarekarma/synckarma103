# NetSuite RESTlet - SyncKarma103

## Prerequisites

Install SuiteCloud CLI globally:

```bash
npm install -g @oracle/suitecloud-cli
suitecloud --version
```

## Project Setup

```bash
suitecloud account:setup
# Authentication ID: 3059834 -- Rare Karma Inc. (Development Account 1) [Administrator]

suitecloud project:create -i
# Project name: synckarma103
# Project type: Account Customization Project (SuiteBundler)
```

## RESTlet Files

- Script: `src/FileCabinet/SuiteScripts/test1_restlet.js`
- Script Definition: `src/Objects/customscript_test1_restlet.xml`

## Deployment

```bash
suitecloud project:deploy
```

After deployment, find the RESTlet URL at:
**Customization > Scripting > Scripts > customscript_test1_restlet > Deployments > Test1 RESTlet Deployment**

RESTlet URL format:
```
https://3059834.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=customscript_test1_restlet&deploy=customdeploy_test1_restlet
```

## OAuth 2.0 Authentication Setup

### 1. Enable OAuth 2.0 in NetSuite

Navigate to: **Setup > Company > Enable Features > SuiteCloud**

Enable:
- [x] OAuth 2.0
- [x] REST Web Services

### 2. Create an Integration Record

Navigate to: **Setup > Integration > Manage Integrations > New**

Configure the integration:
- **Name**: SyncKarma OAuth2
- **State**: Enabled
- **OAuth 2.0**:
  - [x] Authorization Code Grant
  - [x] Restlets (under Scope)
- **Callback URL**: `https://your-app.com/oauth/callback` (or use Postman's callback URL for testing)

Save and note the **Client ID** and **Client Secret** (shown only once).

### 3. OAuth 2.0 Authorization Flow

#### Step 1: Get Authorization Code

Direct user to:
```
https://3059834.app.netsuite.com/app/login/oauth2/authorize.nl?
  response_type=code&
  client_id=<CLIENT_ID>&
  redirect_uri=<CALLBACK_URL>&
  scope=restlets&
  state=<RANDOM_STATE>
```

#### Step 2: Exchange Code for Tokens

POST to token endpoint:
```
https://3059834.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token
```

Headers:
```
Content-Type: application/x-www-form-urlencoded
Authorization: Basic <base64(client_id:client_secret)>
```

Body:
```
grant_type=authorization_code&
code=<AUTHORIZATION_CODE>&
redirect_uri=<CALLBACK_URL>
```

Response:
```json
{
  "access_token": "<ACCESS_TOKEN>",
  "refresh_token": "<REFRESH_TOKEN>",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

#### Step 3: Call the RESTlet

```bash
curl -X GET \
  "https://3059834.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=customscript_test1_restlet&deploy=customdeploy_test1_restlet" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{"status": "ok"}
```

#### Step 4: Refresh Token (when access token expires)

POST to token endpoint:
```
https://3059834.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token
```

Body:
```
grant_type=refresh_token&
refresh_token=<REFRESH_TOKEN>
```

### Testing with Postman

1. Create a new request in Postman
2. Go to **Authorization** tab
3. Select **OAuth 2.0**
4. Configure:
   - **Grant Type**: Authorization Code
   - **Auth URL**: `https://3059834.app.netsuite.com/app/login/oauth2/authorize.nl`
   - **Access Token URL**: `https://3059834.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token`
   - **Client ID**: Your client ID
   - **Client Secret**: Your client secret
   - **Scope**: `restlets`
5. Click **Get New Access Token**
6. Use the token to call the RESTlet

## RESTlet Endpoints

| Method | Description | Response |
|--------|-------------|----------|
| GET | Health check | `{"status": "ok"}` |
| POST | Echo request body | Returns the request body |

