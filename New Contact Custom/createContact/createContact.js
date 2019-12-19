import { LightningElement, track, api } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import FIRST_NAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LAST_NAME_FIELD from '@salesforce/schema/Contact.LastName';
import findRecords from '@salesforce/apex/CustomLookupController.findRecords';
import ACCOUNT_LOOKUP_FIELD from '@salesforce/schema/Contact.AccountId';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';

import { NavigationMixin } from 'lightning/navigation';

export default class LdsCreateRecord extends LightningElement {
    @track contactId;
    firstName = '';
    lastName = '';  
    @track accountName = '';
    name = '';
    phone = '';  
    @track accountId = '';
    @track records;
    @track error;
    @track selectedRecord;
    @api index;
    @api relationshipfield;
    @api iconname = "standard:account";
    @api objectName = 'Account';
    @api searchfield = 'Name';
    @track openmodel = false;
    handleNameChange(event) {
        this.accountId = undefined;
        this.name = event.target.value;
    }
    handlePhoneChange(event) {
        this.accountId = undefined;
        this.phone = event.target.value;
    }    
    createAccount() {
        const fields = {};
        fields[NAME_FIELD.fieldApiName] = this.name;
        fields[PHONE_FIELD.fieldApiName] = this.phone;        
        const recordInput = { apiName: ACCOUNT_OBJECT.objectApiName, fields };
        createRecord(recordInput)
            .then(account => {
                this.accountId = account.id;
                this.selectedRecord = account;
                this.accountName = account.fields.Name.value;
                /* eslint-disable no-console */                                
                this.openmodel = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Account created',
                        variant: 'success',
                    }),
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
    }
    openModel() {
        this.openmodel = true
    }
    closeModal() {
        this.openmodel = false
    } 
    handleFirstNameChange(event) {
        this.contactId = undefined;
        this.firstName = event.target.value;
    }
    handleLastNameChange(event) {
        this.contactId = undefined;
        this.lastName = event.target.value;
    }    
    createContact() {
        const fields = {};
        fields[FIRST_NAME_FIELD.fieldApiName] = this.firstName;
        fields[LAST_NAME_FIELD.fieldApiName] = this.lastName;
        fields[ACCOUNT_LOOKUP_FIELD.fieldApiName] = this.accountId;
        const recordInput = { apiName: CONTACT_OBJECT.objectApiName, fields };
        createRecord(recordInput)
            .then(contact => {
                this.contactId = contact.id;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Contact created',
                        variant: 'success',
                    }),
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
    }
    constructor(){
        super();
        this.iconname = "standard:account";
        this.objectName = 'Account';
        this.searchField = 'Name';
    }

    handleOnchange(event){
        //event.preventDefault();
        this.records = null;
        this.contactId = undefined;
        const searchKey = event.detail.value;
        //this.records = null;
        /* eslint-disable no-console */
        //console.log(searchKey);

        /* Call the Salesforce Apex class method to find the Records */
        if(searchKey != null && searchKey !== undefined && searchKey !== '') {
        findRecords({
            searchKey : searchKey, 
            objectName : this.objectName, 
            searchField : this.searchfield
        })
        .then(result => {
            this.records = result;
            for(let i=0; i < this.records.length; i++){
                const rec = this.records[i];
                this.records[i].Name = rec[this.searchfield];
            }
            this.error = undefined;
            //console.log(' records ', this.records);
        })
        .catch(error => {
            this.error = error;
            this.records = undefined;
        });
    }
    }
    handleSelect(event){
        const selectedRecordId = event.detail;
        /* eslint-disable no-console*/
        this.selectedRecord = this.records.find( record => record.Id === selectedRecordId);
        this.accountId = selectedRecordId;
        this.accountName = this.selectedRecord.Name;
        /* fire the event with the value of RecordId for the Selected RecordId */
        const selectedRecordEvent = new CustomEvent(
            "selectedrec",
            {
                //detail : selectedRecordId
                detail : { recordId : selectedRecordId, index : this.index, relationshipfield : this.relationshipfield}
            }
        );
        this.dispatchEvent(selectedRecordEvent);        
    }

    handleRemove(event){
        event.preventDefault();
        this.selectedRecord = undefined;
        this.records = undefined;
        this.error = undefined;
        /* fire the event with the value of undefined for the Selected RecordId */
        const selectedRecordEvent = new CustomEvent(
            "selectedrec",
            {
                detail : { recordId : undefined, index : this.index, relationshipfield : this.relationshipfield}
            }
        );
        this.dispatchEvent(selectedRecordEvent);
    }
    newAccount(){        
        this[NavigationMixin.Navigate]({
            type: "standard__objectPage",
            attributes: {
                objectApiName: "Account",
                actionName: "new"
            },
            state: {
                nooverride: 1,
                useRecordTypeCheck: 1,
                navigationLocation: 'LIST_VIEW',
                backgroundContext: '/lightning/o/Account/list?filterName=Recent',
                recordTypeId: '0122v000002Ag7TAAS'
            }
        });
    }

}