using AdminService as service from '../../srv/admin-service';

annotate service.Customers with @(UI.LineItem : [
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
        Label : 'mainAddress_country_code',
        Value : mainAddress_country_code,
    },
    {
        $Type : 'UI.DataField',
        Label : 'mainAddress_city',
        Value : mainAddress_city,
    },
]);

annotate service.Customers with @(
    UI.FieldGroup #GeneratedGroup1 : {
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
                Value : mainAddress_country_code,
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
                Value : mainAddress_addressLine,
            },
            {
                $Type : 'UI.DataField',
                Value : billingAddress_country_code,
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
                Value : billingAddress_addressLine,
            },
            {
                $Type : 'UI.DataField',
                Value : isArchived,
            },
        ],
    },
    UI.Facets                      : [{
        $Type  : 'UI.ReferenceFacet',
        ID     : 'GeneratedFacet1',
        Label  : 'General Information',
        Target : '@UI.FieldGroup#GeneratedGroup1',
    }, ]
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
