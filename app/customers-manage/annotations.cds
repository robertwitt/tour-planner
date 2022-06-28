using AdminService as service from '../../srv/admin-service';

annotate service.Customers with @(
    UI.LineItem : [
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
    ]
);
annotate service.Customers with @(
    UI.FieldGroup #GeneratedGroup1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
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
            {
                $Type : 'UI.DataField',
                Label : 'mainAddress_postalCode',
                Value : mainAddress_postalCode,
            },
            {
                $Type : 'UI.DataField',
                Label : 'mainAddress_addressLine',
                Value : mainAddress_addressLine,
            },
            {
                $Type : 'UI.DataField',
                Label : 'billingAddress_country_code',
                Value : billingAddress_country_code,
            },
            {
                $Type : 'UI.DataField',
                Label : 'billingAddress_city',
                Value : billingAddress_city,
            },
            {
                $Type : 'UI.DataField',
                Label : 'billingAddress_postalCode',
                Value : billingAddress_postalCode,
            },
            {
                $Type : 'UI.DataField',
                Label : 'billingAddress_addressLine',
                Value : billingAddress_addressLine,
            },
            {
                $Type : 'UI.DataField',
                Value : isArchived,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup1',
        },
    ]
);
