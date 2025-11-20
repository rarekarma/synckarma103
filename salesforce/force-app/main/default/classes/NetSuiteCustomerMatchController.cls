public with sharing class NetSuiteCustomerMatchController {
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getMatch(Id accountId) {
        try {
            List<NetSuite_Customer_Match__c> matches = [
                SELECT Id, Status__c, Decision__c, Correlation_Id__c, 
                       Suggested_Matches_JSON__c, Selected_NetSuite_Internal_ID__c,
                       Suggested_At__c, Resolved_At__c, Reason__c
                FROM NetSuite_Customer_Match__c
                WHERE Account__c = :accountId
                ORDER BY CreatedDate DESC
                LIMIT 1
            ];
            
            if (matches.isEmpty()) {
                return null;
            }
            // put restuls in a map so that namespace prefixes are not passed into the LWC
            Map<String, Object> result = new Map<String, Object>();
            result.put('Id', matches[0].Id);
            result.put('Status__c', matches[0].Status__c);
            result.put('Decision__c', matches[0].Decision__c);
            result.put('Correlation_Id__c', matches[0].Correlation_Id__c);
            result.put('Suggested_Matches_JSON__c', matches[0].Suggested_Matches_JSON__c);
            result.put('Selected_NetSuite_Internal_ID__c', matches[0].Selected_NetSuite_Internal_ID__c);
            result.put('Suggested_At__c', matches[0].Suggested_At__c);
            result.put('Resolved_At__c', matches[0].Resolved_At__c);
            result.put('Reason__c', matches[0].Reason__c);
            return result;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching match record: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void updateMatch(Id matchId, String decision, String selectedInternalId, String status) {
        try {
            // First, query the match record to get the Account relationship
            List<NetSuite_Customer_Match__c> matches = [
                SELECT Id, Account__c
                FROM NetSuite_Customer_Match__c
                WHERE Id = :matchId
                LIMIT 1
            ];
            
            if (matches.isEmpty()) {
                throw new AuraHandledException('Match record not found');
            }
            
            NetSuite_Customer_Match__c match = matches[0];
            
            // Update the match record
            match.Decision__c = decision;
            match.Status__c = status;
            
            if (selectedInternalId != null) {
                match.Selected_NetSuite_Internal_ID__c = selectedInternalId;
            }
            
            update match;
            
            // If a candidate was selected, update the Account's NetSuite_Customer_ID__c field
            if (selectedInternalId != null && match.Account__c != null) {
                Account acc = new Account(
                    Id = match.Account__c,
                    NetSuite_Customer_ID__c = selectedInternalId
                );
                update acc;
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error updating match record: ' + e.getMessage());
        }
    }
}