import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getNetSuiteCustomerMatch from '@salesforce/apex/NetSuiteCustomerMatchController.getMatch';
import updateNetSuiteCustomerMatch from '@salesforce/apex/NetSuiteCustomerMatchController.updateMatch';

export default class NetsuiteCustomerMatch extends LightningElement {
    @api recordId; // Account ID
    matchRecord;
    searchedFields;
    candidates = [];
    error;
    isLoading = true;
    isSaving = false;
    wiredMatchResult;

    connectedCallback() {
        console.log('Component connected, recordId:', this.recordId);
        if (!this.recordId) {
            console.warn('⚠️ recordId is null in connectedCallback');
        }
    }

    @wire(getNetSuiteCustomerMatch, { accountId: '$recordId' })
    wiredMatch(result) {
        console.log('wiredMatch called');
        console.log('recordId:', this.recordId);
        console.log('result:', result);
        console.log('result.data:', result?.data);
        console.log('result.error:', result?.error);
        console.log('result keys:', Object.keys(result || {}));
        
        // Guard: Don't process if recordId is not available
        if (!this.recordId) {
            console.warn('⚠️ recordId is null in wiredMatch, skipping');
            return;
        }
        
        this.wiredMatchResult = result;
        const { error, data } = result;
        
        console.log('Destructured - error:', error, 'data:', data);
        
        if (error) {
            console.log('➡️ ERROR PATH');
            this.isLoading = false;
            this.error = error.body ? error.body.message : 'An error occurred while loading the match record.';
            this.matchRecord = null;
            this.searchedFields = null;
            this.candidates = [];
            console.error('Error loading match:', error);
        } else if (data) {
            console.log('➡️ DATA PATH - got data!');
            this.isLoading = false;
            this.matchRecord = data;
            this.error = undefined;
            // Parse the JSON if it exists
            if (data.Suggested_Matches_JSON__c) {
                this.parseSuggestedMatches(data.Suggested_Matches_JSON__c);
            } else {
                this.searchedFields = null;
                this.candidates = [];
            }
            console.log('Match record loaded:', data);
        } else {
            console.log('➡️ LOADING PATH - waiting for data or error');
            // Still loading or no data
            this.isLoading = true;
        }
    }

    parseSuggestedMatches(jsonString) {
        if (!jsonString || jsonString.trim() === '') {
            this.searchedFields = null;
            this.candidates = [];
            return;
        }

        try {
            const data = JSON.parse(jsonString);
            
            // Parse searchedFields
            this.searchedFields = data.searchedFields || {};
            
            // Parse candidates
            if (data.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
                this.candidates = data.candidates.map(candidate => ({
                    internalId: candidate.internalId || '',
                    entityId: candidate.entityId || '',
                    confidence: candidate.confidence || 0,
                    confidencePercent: Math.round((candidate.confidence || 0) * 100),
                    address: candidate.address || {},
                    addressFormatted: this.formatAddress(candidate.address),
                    phone: candidate.phone || '',
                    selected: false,
                    selectedClass: ''
                }));
            } else {
                this.candidates = [];
            }
        } catch (e) {
            console.error('Error parsing JSON:', e, 'JSON string:', jsonString);
            this.error = 'Error parsing suggested matches JSON: ' + e.message;
            this.searchedFields = null;
            this.candidates = [];
        }
    }

    formatAddress(address) {
        if (!address) return '';
        const parts = [];
        if (address.line1) parts.push(address.line1);
        if (address.city) parts.push(address.city);
        if (address.state) parts.push(address.state);
        if (address.postalCode) parts.push(address.postalCode);
        if (address.country) parts.push(address.country);
        return parts.join(', ');
    }

    get hasSearchedFields() {
        const hasSearchedFields = this.searchedFields && Object.keys(this.searchedFields).length > 0;
        console.log('hasSearchedFields:', hasSearchedFields);
        return hasSearchedFields;
    }

    get searchedFieldsList() {
        if (!this.searchedFields) return [];
        const searchedFieldsList = Object.keys(this.searchedFields).map(key => ({
            key: key,
            keyValue: key + '-value',
            label: this.formatFieldLabel(key),
            value: this.searchedFields[key]
        }));
        console.log('searchedFieldsList:', searchedFieldsList);
        return searchedFieldsList;
    }

    formatFieldLabel(key) {
        // Convert camelCase to Title Case
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    get hasCandidates() {
        return this.candidates && this.candidates.length > 0;
    }

    get displayStatus() {
        return this.matchRecord?.Status__c || '—';
    }

    get hasSelectedCandidate() {
        return this.candidates.some(c => c.selected);
    }

    get isUseSelectedDisabled() {
        return this.isSaving || !this.hasSelectedCandidate;
    }

    get selectedCandidate() {
        return this.candidates.find(c => c.selected);
    }

    handleCandidateSelection(event) {
        const internalId = event.target.dataset.internalId;
        const isChecked = event.target.checked;
        
        // Only allow one selection at a time
        this.candidates = this.candidates.map(candidate => {
            if (candidate.internalId === internalId) {
                return { ...candidate, selected: isChecked, selectedClass: isChecked ? 'slds-is-selected' : '' };
            } else {
                return { ...candidate, selected: false, selectedClass: '' };
            }
        });
    }

    handleUseSelected() {
        const selected = this.selectedCandidate;
        if (!selected) {
            this.showToast('Error', 'Please select a candidate first.', 'error');
            return;
        }

        this.isSaving = true;
        updateNetSuiteCustomerMatch({
            matchId: this.matchRecord.Id,
            decision: 'Use Existing',
            selectedInternalId: selected.internalId,
            status: 'Approved – Use Existing'
        })
        .then(() => {
            this.showToast('Success', 'Match record updated successfully.', 'success');
            // Refresh the wired data
            return refreshApex(this.wiredMatchResult);
        })
        .then(() => {
            this.isSaving = false;
        })
        .catch(error => {
            this.error = error.body ? error.body.message : 'An error occurred while updating the record.';
            this.showToast('Error', this.error, 'error');
            this.isSaving = false;
        });
    }

    handleCreateNew() {
        this.isSaving = true;
        updateNetSuiteCustomerMatch({
            matchId: this.matchRecord.Id,
            decision: 'Create New',
            selectedInternalId: null,
            status: 'Approved – Create New'
        })
        .then(() => {
            this.showToast('Success', 'Match record updated successfully.', 'success');
            // Refresh the wired data
            return refreshApex(this.wiredMatchResult);
        })
        .then(() => {
            this.isSaving = false;
        })
        .catch(error => {
            this.error = error.body ? error.body.message : 'An error occurred while updating the record.';
            this.showToast('Error', this.error, 'error');
            this.isSaving = false;
        });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}