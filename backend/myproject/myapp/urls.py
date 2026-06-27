# urls.py
from django.urls import path, include
from .views import (
    BusinessTypeViewSet, CompanyNameViewSet, CustomerTypeViewSet, DsaNameViewSet, HealthInsuranceAgeViewSet, HealthInsuranceDetailsViewSet, HealthInsuranceViewSet, IndustryTypeViewSet, LoanTypeViewSet, LoanVideoViewSet, LoginView, ManufactureYearViewSet, NewsViewSet, NumberOfPersonViewSet, OffersViewSet, PayoutTypeViewSet, PolicyImageViewSet, ProfileViewSet, SeminarViewSet, TypeOfPolicyViewSet, UserManagementView, CheckUsernameView,
    DepartmentDropdownView, DesignationByDepartmentView,
    DepartmentViewSet, DesignationViewSet, BranchStateViewSet,
    BranchLocationViewSet, SubLocationViewSet, PincodeViewSet,
    BranchInnerStateViewSet, BranchInnerLocationViewSet,UserPayoutIconsView ,
    BankViewSet, TypeOfAccountViewSet, VehicleDocumentViewSet, VehicleInsuranceDetailsViewSet, VehicleInsuranceViewSet, VendorBankDesignationViewSet, VendorBankViewSet, DsaCodeViewSet, 
    BankerViewSet, CategoryViewSet, PayoutViewSet, WorkIconViewSet,PolicyViewSet,
    FilteredPayoutView,CheckSDSAEmailView, SDSAUserViewSet,SDSAUserLoginView,PartnerTypeViewSet, CheckPartnerEmailView, PartnerUserViewSet, PartnerUserLoginView,VehicleMakeViewSet,VehicleModelViewSet,InsuranceCompanyViewSet # Add this import
)
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'designations', DesignationViewSet)
router.register(r'branch-states', BranchStateViewSet)
router.register(r'branch-locations', BranchLocationViewSet)
router.register(r'sublocations', SubLocationViewSet)
router.register(r'pincodes', PincodeViewSet)
router.register(r'branch-inner-states', BranchInnerStateViewSet)
router.register(r'branch-inner-locations', BranchInnerLocationViewSet)
router.register(r'banks', BankViewSet)
router.register(r'typeofaccounts', TypeOfAccountViewSet)
router.register(r'vendor-banks', VendorBankViewSet)
router.register(r'vendor-bank-designations', VendorBankDesignationViewSet)
router.register(r'dsa-names', DsaNameViewSet)
router.register(r'loan-types', LoanTypeViewSet)
router.register(r'dsa-codes', DsaCodeViewSet, basename='dsacode')
router.register(r'bankers', BankerViewSet)
router.register(r'category', CategoryViewSet)
router.register(r'payout-type', PayoutTypeViewSet)
router.register(r'payout', PayoutViewSet)
router.register(r'work-icon', WorkIconViewSet)
router.register(r'offers', OffersViewSet)
router.register(r'news', NewsViewSet)
router.register(r'policy-images', PolicyImageViewSet)
router.register(r'loan-videos', LoanVideoViewSet, basename='loan-videos')
router.register(r'profiles', ProfileViewSet)
router.register(r'seminars', SeminarViewSet)
router.register(r'policies', PolicyViewSet)
router.register(r'sdsa-users', SDSAUserViewSet, basename='sdsa-users')
router.register(r'partner-type', PartnerTypeViewSet)
router.register(r'partner-users', PartnerUserViewSet, basename='partner-users')
router.register(r'vehicle-make',VehicleMakeViewSet, basename='vehicle-make')
router.register(r'vehicle-model',VehicleModelViewSet, basename='vehicle-model')
router.register(r'manufacture-year',ManufactureYearViewSet, basename='manufacture-year')
router.register(r'company-name',CompanyNameViewSet, basename='company-name')
router.register(r'customer-type', CustomerTypeViewSet, basename='customer-type')
router.register(r'industry-type', IndustryTypeViewSet, basename='industry-type')
router.register(r'business-type', BusinessTypeViewSet, basename='business-type')
router.register(r'insurance-company', InsuranceCompanyViewSet, basename='insurance-company')
router.register(r'type-of-policy', TypeOfPolicyViewSet, basename='type-of-policy')
router.register(r'health-insurance-age', HealthInsuranceAgeViewSet)
router.register(r'number-of-person', NumberOfPersonViewSet)
router.register(r'vehicle-add-insurance', VehicleInsuranceViewSet, basename='vehicle-insurance')
router.register(r'vehicle-documents', VehicleDocumentViewSet, basename='vehicle-documents')
router.register(r'vehicle-insurance-details', VehicleInsuranceDetailsViewSet, basename='vehicle-insurance-details')
router.register(r'health-add-insurance', HealthInsuranceViewSet, basename='health-insurance')
router.register(r'health-insurance-details', HealthInsuranceDetailsViewSet, basename='health-insurance-details')






urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("sdsa-login/", SDSAUserLoginView.as_view(), name="sdsa-login"),
     path("partner-login/", PartnerUserLoginView.as_view(), name="partner-login"),
    
    # Employee management
    path("users/", UserManagementView.as_view(), name="users"),
    path("users/<int:pk>/", UserManagementView.as_view(), name="user-crud"),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Dropdown data endpoints
    path("check-username/", CheckUsernameView.as_view(), name="check-username"),
     path("check-sdsa-email/", CheckSDSAEmailView.as_view(), name="check-sdsa-email"),
     path("check-partner-email/", CheckPartnerEmailView.as_view(), name="check-partner-email"),
    path("departments-dropdown/", DepartmentDropdownView.as_view(), name="departments-dropdown"),
    path("designations-by-department/<int:department_id>/", DesignationByDepartmentView.as_view(), name="designations-by-department"),
    
    # Filtered payouts for users
    path("filtered-payouts/", FilteredPayoutView.as_view(), name="filtered-payouts"),
    path("user-payout-icons/", UserPayoutIconsView.as_view(), name="user-payout-icons"),
    
    path('', include(router.urls)),
]

# Media files for development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)