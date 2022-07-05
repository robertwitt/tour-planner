using AdminService as service from '../../srv/admin-service';
annotate service.Workers with @(
    UI.SelectionFields : [
        startDate,
        endDate,
    ]
);

annotate service.Workers with {
    startDate @Common.Label : '{i18n>WorkerStartDate}'
};


annotate service.Workers with {
    endDate @Common.Label : '{i18n>WorkerEndDate}'
};
annotate service.Workers with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : ID,
        },
        {
            $Type : 'UI.DataField',
            Value : lastName,
        },
        {
            $Type : 'UI.DataField',
            Value : firstName,
        },
        {
            $Type : 'UI.DataField',
            Value : startDate,
        },
        {
            $Type : 'UI.DataField',
            Value : endDate,
        },
    ]
);
annotate service.Workers with @(
    UI.HeaderInfo : {
        TypeName : '{i18n>Worker}',
        TypeNamePlural : '{i18n>Workers}',
    }
);
annotate service.Workers with @(
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : '{i18n>GeneralInformation}',
            ID : 'i18nGeneralInformation',
            Target : '@UI.FieldGroup#i18nGeneralInformation',
        },
    ],
    UI.FieldGroup #i18nGeneralInformation : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : ID,
            },
            {
                $Type : 'UI.DataField',
                Value : firstName,
            },{
                $Type : 'UI.DataField',
                Value : lastName,
            },{
                $Type : 'UI.DataField',
                Value : startDate,
            },{
                $Type : 'UI.DataField',
                Value : endDate,
            },],
    }
);
