using {
  rwitt.tour.common,
  rwitt.tour.masterdata
} from '../db';

service AdminService {

  entity Countries as projection on common.Countries;
  annotate Countries with @(readonly);

  entity Customers as projection on masterdata.Customers actions {
    @Common.IsActionCritical
    action archive() returns Customers;
  };

  annotate Customers with @(
    Capabilities.Deletable : false,
    odata.draft.enabled,
  );

  annotate Customers with {
    name1         @mandatory;
    mainAddress {
      country     @mandatory;
      city        @mandatory;
      postalCode  @mandatory;
      addressLine @mandatory;
    };
    isArchived    @readonly;
  }

  entity Workers   as projection on masterdata.Workers;

  annotate Workers with @(
    Capabilities.Deletable : false,
    odata.draft.enabled,
  );

  annotate Workers with {
    lastName @mandatory;
  };

}

annotate AdminService with @(requires : ['TourPlanner']);
