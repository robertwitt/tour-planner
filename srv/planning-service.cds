using {rwitt.tour as db} from '../db';

service PlanningService {

  extend db.masterdata.Customers with {
    virtual formattedName         : String;
    virtual mainAddress_formatted : String;
  };

  entity Customers         as projection on db.masterdata.Customers {
    *,
    mainAddress.country.name as mainAddress_country_name
  } excluding {
    billingAddress,
    isArchived,
    createdAt,
    createdBy,
    modifiedAt,
    modifiedBy
  };

  annotate Customers with @(readonly);

  extend db.masterdata.Workers with {
    virtual formattedName : String;
  };

  entity Workers           as projection on db.masterdata.Workers excluding {
    startDate,
    endDate,
    createdAt,
    createdBy,
    modifiedAt,
    modifiedBy
  };

  annotate Workers with @(readonly);

  entity ExecutionStatuses as projection on db.common.ExecutionStatuses excluding {
    descr
  };

  annotate ExecutionStatuses with @(readonly);
  entity Visits            as projection on db.transaction.Visits;
  annotate Visits with @(odata.draft.enabled);

  annotate Visits with {
    customer  @mandatory;
    visitDate @mandatory;
    startTime @mandatory;
    endTime   @mandatory;
    duration  @readonly;
    status    @readonly;
  };

  entity Tours             as projection on db.transaction.Tours;
  annotate Tours with @(odata.draft.enabled);

  annotate Tours with {
    worker   @mandatory;
    tourDate @mandatory;
    status   @readonly;
  };

  annotate db.transaction.TourStops with {
    visit @mandatory
  };

}

annotate PlanningService with @(requires : ['TourPlanner']);
