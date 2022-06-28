using {
  rwitt.tour.common,
  rwitt.tour.masterdata
} from '../db';

service AdminService {

  entity Countries as projection on common.Countries;

  annotate Countries with @(
    odata.draft.enabled,
    readonly
  );

  entity Customers as projection on masterdata.Customers;
  annotate Customers with @(Capabilities.Deletable : false);

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

}
