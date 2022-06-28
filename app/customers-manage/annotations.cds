using AdminService as service from '../../srv/admin-service';

annotate service.Customers with @(UI.LineItem : [
    {
        $Type : 'UI.DataField',
        Value : name1,
        Label : '{i18n>Name1}',
    },
    {
        $Type : 'UI.DataField',
        Value : name2,
        Label : '{i18n>Name2}',
    },
    {
        $Type : 'UI.DataField',
        Value : isNaturalPerson,
        Label : '{i18n>IsNaturalPerson}',
    },
    {
        $Type : 'UI.DataField',
        Value : mainAddress_country_code,
        Label : '{i18n>MainAddressCountry}',
    },
    {
        $Type : 'UI.DataField',
        Value : mainAddress_city,
        Label : '{i18n>MainAddressCity}',
    },
    {
        $Type : 'UI.DataField',
        Value : mainAddress_postalCode,
        Label : '{i18n>MainAddressPostalCode}',
    },
    {
        $Type : 'UI.DataField',
        Value : mainAddress_addressLine,
        Label : '{i18n>MainAddressAddressLine}',
    },
    {
        $Type : 'UI.DataField',
        Value : billingAddress_country_code,
        Label : '{i18n>BillingAddressCountry}',
    },
    {
        $Type : 'UI.DataField',
        Value : billingAddress_city,
        Label : '{i18n>BillingAddressCity}',
    },
    {
        $Type : 'UI.DataField',
        Value : billingAddress_postalCode,
        Label : '{i18n>BillingAddressPostalCode}',
    },
    {
        $Type : 'UI.DataField',
        Value : billingAddress_addressLine,
        Label : '{i18n>BillingAddressAddressLine}',
    },
]);

annotate service.Customers with @(UI.Identification : [{
    $Type       : 'UI.DataFieldForAction',
    Action      : 'AdminService.archive',
    Criticality : #Critical,
    Label       : '{i18n>Archive}',
}]);

annotate service.Customers with @(UI.HeaderInfo : {
    TypeName       : '{i18n>Customer}',
    TypeNamePlural : '{i18n>Customers}',
});

annotate service.Customers with @(
    UI.FieldGroup #GeneralInformation : {
        $Type : 'UI.FieldGroupType',
        Data  : [
            {
                $Type : 'UI.DataField',
                Value : name1,
            },
            {
                $Type : 'UI.DataField',
                Value : name2,
            },
            {
                $Type : 'UI.DataField',
                Value : isNaturalPerson,
            },
            {
                $Type : 'UI.DataField',
                Value : isArchived,
            },
        ],
    },
    UI.FieldGroup #MainAddress        : {
        $Type : 'UI.FieldGroupType',
        Data  : [
            {
                $Type : 'UI.DataField',
                Value : mainAddress_addressLine,
            },
            {
                $Type : 'UI.DataField',
                Value : mainAddress_city,
            },
            {
                $Type : 'UI.DataField',
                Value : mainAddress_postalCode,
            },
            {
                $Type : 'UI.DataField',
                Value : mainAddress_country_code,
            },
        ],
    },
    UI.FieldGroup #BillingAddress     : {
        $Type : 'UI.FieldGroupType',
        Data  : [
            {
                $Type : 'UI.DataField',
                Value : billingAddress_addressLine,
            },
            {
                $Type : 'UI.DataField',
                Value : billingAddress_city,
            },
            {
                $Type : 'UI.DataField',
                Value : billingAddress_postalCode,
            },
            {
                $Type : 'UI.DataField',
                Value : billingAddress_country_code,
            },
        ],
    },
    UI.Facets                         : [
        {
            $Type  : 'UI.ReferenceFacet',
            ID     : 'GeneralInformation',
            Label  : '{i18n>GeneralInformation}',
            Target : '@UI.FieldGroup#GeneralInformation',
        },
        {
            $Type  : 'UI.CollectionFacet',
            Label  : '{i18n>Addresses}',
            ID     : 'Addresses',
            Facets : [
                {
                    $Type  : 'UI.ReferenceFacet',
                    Label  : '{i18n>MainAddress}',
                    ID     : 'MainAddress',
                    Target : '@UI.FieldGroup#MainAddress',
                },
                {
                    $Type  : 'UI.ReferenceFacet',
                    Label  : '{i18n>BillingAddress}',
                    ID     : 'BillingAddress',
                    Target : '@UI.FieldGroup#BillingAddress',
                },
            ],
        },
    ]
);

annotate service.Customers with @(UI.SelectionFields : [
    mainAddress_country_code,
    mainAddress_city,
    mainAddress_postalCode,
    isNaturalPerson,
    isArchived,
]);

annotate service.Customers with {
    isArchived @(Common.FilterDefaultValue : false)
}
