from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    BusinessType, CompanyName, CustomerType, DsaName, HealthInsurance, HealthInsuranceAge, HealthInsuranceDetails, IndustryType, InsuranceCompany, LoanType, LoanVideo, ManufactureYear, News, NumberOfPerson, Offers, PayoutType, Policy, PolicyImage, Profile, Seminar, TypeOfPolicy, User, Department, Designation, BranchState, BranchLocation, 
    SubLocation, BranchInnerState, BranchInnerLocation, Pincode,Bank, TypeOfAccount, VehicleDocument, VehicleInsurance, VehicleInsuranceDetails, VendorBank, VendorBankDesignation, DsaCode, Banker,Category,Payout, WorkIcon,SDSAUser,PartnerType,PartnerUser,VehicleMake,VehicleModel
)  

class UserAdmin(BaseUserAdmin):
    # Fields to display in admin list
    list_display = ("email", "full_name","contact_info","employee_id", "role", "is_staff", "is_superuser", "created_at")
    list_filter = ("role", "is_staff", "is_superuser")
    search_fields = ("email", "full_name")
    ordering = ("email",)

    # Fieldsets for editing user
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("full_name", "contact_info")}),
        ("Permissions", {"fields": ("role", "is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    # Fields for adding user
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "full_name", "role", "password1", "password2"),
        }),
    )

    filter_horizontal = ("groups", "user_permissions")

# Register User model with custom admin
admin.site.register(User, UserAdmin)


# admin the models here

admin.site.register(Department)
admin.site.register(Designation)
admin.site.register(BranchState)
admin.site.register(BranchLocation)
admin.site.register(SubLocation)
admin.site.register(Pincode)
admin.site.register(BranchInnerState)
admin.site.register(BranchInnerLocation)
admin.site.register(Bank)
admin.site.register(TypeOfAccount)
admin.site.register(VendorBank)
admin.site.register(VendorBankDesignation)
admin.site.register(DsaName)
admin.site.register(LoanType)
admin.site.register(DsaCode)
admin.site.register(Banker)
admin.site.register(Category)
admin.site.register(PayoutType)
admin.site.register(Payout)
admin.site.register(WorkIcon)
admin.site.register(Offers)
admin.site.register(News)
admin.site.register(PolicyImage)
admin.site.register(LoanVideo)
admin.site.register(Profile)
admin.site.register(Seminar)
admin.site.register(Policy)
admin.site.register(SDSAUser)
admin.site.register(PartnerType)
admin.site.register(PartnerUser)
admin.site.register(VehicleMake)
admin.site.register(VehicleModel)
admin.site.register(ManufactureYear)
admin.site.register(CompanyName)
admin.site.register(CustomerType)
admin.site.register(IndustryType)
admin.site.register(BusinessType)
admin.site.register(InsuranceCompany)
admin.site.register(TypeOfPolicy)
admin.site.register(HealthInsuranceAge)
admin.site.register(NumberOfPerson)
admin.site.register(VehicleInsurance)  #add insurance
admin.site.register(VehicleDocument)  #vehicle documents
admin.site.register(VehicleInsuranceDetails)  #vehicle insurance details
admin.site.register(HealthInsurance)  #health insurance
admin.site.register(HealthInsuranceDetails)  #health insurance details




