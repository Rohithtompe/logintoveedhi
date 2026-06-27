# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import json
from django.utils import timezone
# Custom User Manager
class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("Username is required")
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")
        return self.create_user(username, password, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('employee', 'Employee'),
    ]
    email = models.EmailField(unique=True, blank=True, null=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    employee_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    contact_info = models.BigIntegerField(blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='employee')
    
    # Add foreign keys for department and designation
    department = models.ForeignKey(
        'Department', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='employees'
    )
    designation = models.ForeignKey(
        'Designation', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='employees'
    )
    
    # Basic info
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)

    # Contact info
    office_phone_number = models.CharField(max_length=15, blank=True, null=True)
    office_email = models.EmailField(blank=True, null=True)

    # Govt / Bank details
    aadhar_number = models.CharField(max_length=12, blank=True, null=True)
    pan_number = models.CharField(max_length=10, blank=True, null=True)
    account_number = models.CharField(max_length=20, blank=True, null=True)
    ifsc_code = models.CharField(max_length=11, blank=True, null=True)

    # File uploads
    pan_card_upload = models.FileField(upload_to='documents/pan/', blank=True, null=True)
    aadhar_card_upload = models.FileField(upload_to='documents/aadhar/', blank=True, null=True)
    bank_proof_upload = models.FileField(upload_to='documents/bank/', blank=True, null=True)
    employee_image = models.ImageField(upload_to='employees/', blank=True, null=True)

    # Address
    present_address = models.TextField(blank=True, null=True)
    permanent_address = models.TextField(blank=True, null=True)

    # Personal
    date_of_birth = models.DateField(blank=True, null=True)

    # state 
    branch_state = models.ForeignKey('BranchState', on_delete=models.SET_NULL, null=True, blank=True)
    # location
    branch_location = models.ForeignKey('BranchLocation', on_delete=models.SET_NULL, null=True, blank=True)
    # Branch State
    branch_inner_state = models.ForeignKey('BranchInnerState', on_delete=models.SET_NULL, null=True, blank=True)
    # Branch Location
    branch_inner_location  = models.ForeignKey('BranchInnerLocation', on_delete=models.SET_NULL, null=True, blank=True)

    # bank details
    bank = models.ForeignKey('Bank', on_delete=models.SET_NULL, null=True, blank=True)
    type_of_account = models.ForeignKey('TypeOfAccount', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Work icons - stored as JSON string
    work_icons = models.TextField(blank=True, null=True, default='[]')
    payout_icons = models.TextField(blank=True, null=True, default='[]')

    # Reference 1
    ref_name_1 = models.CharField(max_length=100, null=True, blank=True)
    ref_relation_1 = models.CharField(max_length=50, null=True, blank=True)
    ref_mobile_1 = models.CharField(max_length=15, null=True, blank=True)
    ref_address_1 = models.TextField(null=True, blank=True)

    # Reference 2
    ref_name_2 = models.CharField(max_length=100, null=True, blank=True)
    ref_relation_2 = models.CharField(max_length=50, null=True, blank=True)
    ref_mobile_2 = models.CharField(max_length=15, null=True, blank=True)
    ref_address_2 = models.TextField(null=True, blank=True)
    reportingTo = models.CharField(max_length=150, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.username
    


    def save(self, *args, **kwargs):
        """Ensure work_icons and payout_icons are stored as valid JSON strings"""
        # Handle work_icons
        if self.work_icons is None:
            self.work_icons = '[]'
        elif isinstance(self.work_icons, list):
            self.work_icons = json.dumps(self.work_icons)
        elif isinstance(self.work_icons, str):
            try:
                # Validate it's proper JSON
                json.loads(self.work_icons)
            except json.JSONDecodeError:
                # If invalid, set to empty array
                self.work_icons = '[]'
        
        # Handle payout_icons
        if self.payout_icons is None:
            self.payout_icons = '[]'
        elif isinstance(self.payout_icons, list):
            self.payout_icons = json.dumps(self.payout_icons)
        elif isinstance(self.payout_icons, str):
            try:
                # Validate it's proper JSON
                json.loads(self.payout_icons)
            except json.JSONDecodeError:
                # If invalid, set to empty array
                self.payout_icons = '[]'
                
        super().save(*args, **kwargs)


# Department table
class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    status = models.BooleanField(default=True)

    def __str__(self):
        return self.name


# Designation table
class Designation(models.Model):
    name = models.CharField(max_length=100, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='designations')
    status = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    


# Update BranchState model
class BranchState(models.Model):
    name = models.CharField(max_length=100, unique=True)
    status = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name


class BranchLocation(models.Model):
    branch_state = models.ForeignKey(BranchState, on_delete=models.CASCADE, related_name='branch_locations')
    name = models.CharField(max_length=100)
    status = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.branch_state.name})"


# SubLocation table
class SubLocation(models.Model):
    name = models.CharField(max_length=100)
    branch_state = models.ForeignKey(BranchState, on_delete=models.CASCADE, related_name='sublocations')
    branch_location = models.ForeignKey(BranchLocation, on_delete=models.CASCADE, related_name='sublocations')
    status = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        unique_together = ['name', 'branch_location']


# Pincode table
class Pincode(models.Model):
    pincode = models.CharField(max_length=6, unique=True)
    branch_state = models.ForeignKey(BranchState, on_delete=models.CASCADE, related_name='pincodes')
    branch_location = models.ForeignKey(BranchLocation, on_delete=models.CASCADE, related_name='pincodes')
    sub_location = models.ForeignKey(SubLocation, on_delete=models.CASCADE, related_name='pincodes')
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.pincode} - {self.sub_location.name} / {self.branch_location.name} / {self.branch_state.name}"

    class Meta:
        ordering = ['-created_at']


class BranchInnerState(models.Model):
    name = models.CharField(max_length=100, unique=True)
    status = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name


class BranchInnerLocation(models.Model):
    name = models.CharField(max_length=100)
    branch_inner_state = models.ForeignKey(BranchInnerState, on_delete=models.CASCADE, related_name='inner_locations')
    branch_location = models.ForeignKey(BranchLocation, on_delete=models.CASCADE, related_name='inner_locations', null=True, blank=True)
    status = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.branch_inner_state.name})"

    class Meta:
        unique_together = ['name', 'branch_inner_state']


class Bank(models.Model):
    bank_name = models.CharField(max_length=100, unique=True)
    status = models.BooleanField(default=True)
    
    def __str__(self):
        return self.bank_name


class TypeOfAccount(models.Model):
    account_type = models.CharField(max_length=100, unique=True)
    status = models.BooleanField(default=True)
    
    def __str__(self):
        return self.account_type


class VendorBank(models.Model):
    vendor_name = models.CharField(max_length=255)
    status = models.BooleanField(default=True)

    def __str__(self):
        return self.vendor_name
    
class VendorBankDesignation(models.Model):
    designation_name = models.CharField(max_length=100)
    status = models.BooleanField(default=True)
    def __str__(self):
        return self.designation_name
  

# DSA table models
class DsaName(models.Model):
    dsa_name = models.CharField(max_length=255, unique=True)
    status = models.BooleanField(default=True)

    def __str__(self):
        return self.dsa_name
    

class LoanType(models.Model):
    loan_type = models.CharField(max_length=100, unique=True)
    status = models.BooleanField(default=True)
    
    def __str__(self):
        return self.loan_type


# DSA Code table model
class DsaCode(models.Model):
    vendor_bank = models.ForeignKey(VendorBank, on_delete=models.CASCADE)
    dsa_name = models.ForeignKey(DsaName, on_delete=models.CASCADE)
    loan_type = models.ForeignKey(LoanType, on_delete=models.CASCADE)
    branch_state = models.ForeignKey(BranchState, on_delete=models.CASCADE,  null=True, blank=True)# Made optional
    branch_location = models.ForeignKey(BranchLocation, on_delete=models.CASCADE,  null=True, blank=True)# Made optional
    branch_inner_state = models.ForeignKey('BranchInnerState', on_delete=models.CASCADE)
    # Branch Location
    branch_inner_location  = models.ForeignKey('BranchInnerLocation', on_delete=models.CASCADE)
    dsa_code = models.CharField(max_length=50)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.dsa_code


class Banker(models.Model):
    vendor_bank = models.ForeignKey(VendorBank, on_delete=models.CASCADE)
    banker_designation = models.ForeignKey(VendorBankDesignation, on_delete=models.CASCADE)
    branch_state = models.ForeignKey(BranchState, on_delete=models.CASCADE,  null=True, blank=True)# Made optional
    branch_location  = models.ForeignKey(BranchLocation, on_delete=models.CASCADE,  null=True, blank=True)# Made optional
    branch_inner_state = models.ForeignKey('BranchInnerState', on_delete=models.CASCADE)
    # Branch Location
    branch_inner_location  = models.ForeignKey('BranchInnerLocation', on_delete=models.CASCADE)
    loan_type = models.ForeignKey(LoanType, on_delete=models.CASCADE)

    banker_name  = models.CharField(max_length=100)
    phone_no = models.CharField(max_length=15)
    email = models.EmailField()
    address = models.TextField()

    visiting_card = models.FileField(upload_to="bankers/visiting_cards/", null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.banker_name


class Category(models.Model):
    category_name = models.CharField(max_length=200, unique=True)
    status = models.BooleanField(default=True)

    def __str__(self):
        return self.category_name
    

class PayoutType(models.Model):
    payout_name  =  models.CharField(max_length=200, unique=True)
    status  = models.BooleanField(default=True)

    def __str__(self):
        return self.payout_name


class Payout(models.Model):
    vendor_bank = models.ForeignKey(VendorBank, on_delete=models.CASCADE)
    loan_type  = models.ForeignKey(LoanType, on_delete=models.CASCADE)
    category_name = models.ForeignKey(Category, on_delete=models.CASCADE)
    payout_name = models.ForeignKey(PayoutType, on_delete=models.CASCADE)
    payout = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.payout


class WorkIcon(models.Model):
    icon_name = models.CharField(max_length=100, unique=True)
    icon_image = models.ImageField(upload_to='work_icons/', null=True, blank=True)
    icon_url = models.URLField(max_length=300, null=True, blank=True)
    icon_description = models.TextField(null=True, blank=True)
    username = models.CharField(max_length=150)
    password = models.CharField(max_length=150)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.icon_name
    







# offers Models

class Offers(models.Model):
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='offers/')
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name



# news models

class News(models.Model):
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='news/')
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    



#policy image

class PolicyImage(models.Model):
    name  = models.CharField(max_length=255)
    image = models.ImageField(upload_to='policy_images/')
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name




class LoanVideo(models.Model):
    vendor_bank = models.ForeignKey(VendorBank, on_delete=models.CASCADE)
    loan_type = models.ForeignKey(LoanType, on_delete=models.CASCADE)
    video_name = models.CharField(max_length=255)
    video_image = models.ImageField(upload_to='loan_videos/images/')
    video = models.FileField(upload_to='loan_videos/videos/')
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.video_name




class Profile(models.Model):
    vendor_bank = models.ForeignKey(VendorBank, on_delete=models.CASCADE)
    loan_type = models.ForeignKey(LoanType, on_delete=models.CASCADE)
    image  = models.ImageField(upload_to='profiles/images/')
    file  = models.FileField(upload_to='profiles/files/')
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.vendor_bank} - {self.loan_type}"
    


class Seminar(models.Model):
    name = models.CharField(max_length=255)
    video = models.FileField(upload_to='seminars/videos/')
    vendor_bank = models.ForeignKey(VendorBank, on_delete=models.CASCADE)
    loan_type = models.ForeignKey(LoanType, on_delete=models.CASCADE)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name






class Policy(models.Model):
    loan_type = models.ForeignKey(LoanType, on_delete=models.CASCADE)
    vendor_bank = models.ForeignKey(VendorBank, on_delete=models.CASCADE)
    file = models.FileField(upload_to='policies/files/', blank=True, null=True)
    content = models.TextField()
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.vendor_bank} - {self.loan_type}"








#------------------------SDSA USERS------------------------

# Add this to your models.py after other models

class SDSAUser(models.Model):
    # Login credentials
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    email_id = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    
    # Personal Information
    alias_name = models.CharField(max_length=150, blank=True, null=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=15)
    alternative_mobile_number = models.CharField(max_length=15, blank=True, null=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    
    # Address Information
    office_address = models.TextField(blank=True, null=True)
    residential_address = models.TextField(blank=True, null=True)
    
    # Government IDs
    aadhaar_number = models.CharField(max_length=12, blank=True, null=True)
    pan_number = models.CharField(max_length=10, blank=True, null=True)
    
    # Bank Details
    account_number = models.CharField(max_length=20, blank=True, null=True)
    ifsc_code = models.CharField(max_length=11, blank=True, null=True)
    
    # Professional Details
    rank = models.CharField(max_length=50, blank=True, null=True)
    status = models.BooleanField(default=True)
    reportingTo = models.CharField(max_length=150, blank=True, null=True)
    
    # File Uploads
    pan_img = models.FileField(upload_to='sdsa/pan/', blank=True, null=True)
    aadhaar_img = models.FileField(upload_to='sdsa/aadhaar/', blank=True, null=True)
    bank_proof_img = models.FileField(upload_to='sdsa/bank_proof/', blank=True, null=True)
    company_logo = models.ImageField(upload_to='sdsa/company_logo/', blank=True, null=True)
    photo = models.ImageField(upload_to='sdsa/photo/', blank=True, null=True)  # Added photo field
    
    # References
    ref_name_1 = models.CharField(max_length=100, blank=True, null=True)
    ref_relation_1 = models.CharField(max_length=50, blank=True, null=True)
    ref_mobile_1 = models.CharField(max_length=15, blank=True, null=True)
    ref_address_1 = models.TextField(blank=True, null=True)
    
    ref_name_2 = models.CharField(max_length=100, blank=True, null=True)
    ref_relation_2 = models.CharField(max_length=50, blank=True, null=True)
    ref_mobile_2 = models.CharField(max_length=15, blank=True, null=True)
    ref_address_2 = models.TextField(blank=True, null=True)
    
    # state
    branch_state = models.ForeignKey(BranchState, on_delete=models.SET_NULL, null=True, blank=True)
    # location
    branch_location = models.ForeignKey(BranchLocation, on_delete=models.SET_NULL, null=True, blank=True)
    # Branch state
    branch_inner_state = models.ForeignKey('BranchInnerState', on_delete=models.SET_NULL, null=True, blank=True)
    # Branch Location
    branch_inner_location  = models.ForeignKey('BranchInnerLocation', on_delete=models.SET_NULL, null=True, blank=True)


    bank = models.ForeignKey(Bank, on_delete=models.SET_NULL, null=True, blank=True)
    type_of_account = models.ForeignKey(TypeOfAccount, on_delete=models.SET_NULL, null=True, blank=True)



    #work icons
    work_icons = models.TextField(blank=True, null=True, default='[]')
    payout_icons = models.TextField(blank=True, null=True, default='[]')
    
    # User tracking
    createdBy = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_sdsa_users')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sdsa_users'
        ordering = ['-created_at']
        verbose_name = 'SDSA User'
        verbose_name_plural = 'SDSA Users'
    
    def __str__(self):
        return f"{self.email_id} ({self.first_name} {self.last_name})"
    
    def save(self, *args, **kwargs):
        """Ensure work_icons and payout_icons are stored as valid JSON strings"""
        # Handle work_icons
        if self.work_icons is None:
            self.work_icons = '[]'
        elif isinstance(self.work_icons, list):
            self.work_icons = json.dumps(self.work_icons)
        elif isinstance(self.work_icons, str):
            try:
                # Validate it's proper JSON
                json.loads(self.work_icons)
            except json.JSONDecodeError:
                # If invalid, set to empty array
                self.work_icons = '[]'
        
        # Handle payout_icons
        if self.payout_icons is None:
            self.payout_icons = '[]'
        elif isinstance(self.payout_icons, list):
            self.payout_icons = json.dumps(self.payout_icons)
        elif isinstance(self.payout_icons, str):
            try:
                # Validate it's proper JSON
                json.loads(self.payout_icons)
            except json.JSONDecodeError:
                # If invalid, set to empty array
                self.payout_icons = '[]'
        
        # Auto-generate username from email if not provided
        if not self.username and self.email_id:
            self.username = self.email_id.split('@')[0]
        
        # Hash password if it's plain text
        if self.password and len(self.password) < 128:
            from django.contrib.auth.hashers import make_password
            self.password = make_password(self.password)
        
        super().save(*args, **kwargs)
    
    def check_password(self, raw_password):
        from django.contrib.auth.hashers import check_password
        return check_password(raw_password, self.password)
    











#-------------------Partnets Users---------------------

class PartnerType(models.Model):
    partner_type = models.CharField(max_length=255, unique=True)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.partner_type





# Add this to your models.py after SDSAUser model

class PartnerUser(models.Model):
    # Login credentials
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    email_id = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    
    # Personal Information
    alias_name = models.CharField(max_length=150, blank=True, null=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=15)
    alternative_mobile_number = models.CharField(max_length=15, blank=True, null=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    
    # NEW FIELD: Partner Type
    partner_type = models.ForeignKey(
        PartnerType, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='partner_users'
    )
    
    # Address Information
    office_address = models.TextField(blank=True, null=True)
    residential_address = models.TextField(blank=True, null=True)
    
    # Government IDs
    aadhaar_number = models.CharField(max_length=12, blank=True, null=True)
    pan_number = models.CharField(max_length=10, blank=True, null=True)
    
    # Bank Details
    account_number = models.CharField(max_length=20, blank=True, null=True)
    ifsc_code = models.CharField(max_length=11, blank=True, null=True)
    
    # Professional Details
    rank = models.CharField(max_length=50, blank=True, null=True)
    status = models.BooleanField(default=True)
    reportingTo = models.CharField(max_length=150, blank=True, null=True)
    
    # File Uploads
    pan_img = models.FileField(upload_to='partners/pan/', blank=True, null=True)
    aadhaar_img = models.FileField(upload_to='partners/aadhaar/', blank=True, null=True)
    bank_proof_img = models.FileField(upload_to='partners/bank_proof/', blank=True, null=True)
    company_logo = models.ImageField(upload_to='partners/company_logo/', blank=True, null=True)
    photo = models.ImageField(upload_to='partners/photo/', blank=True, null=True)
    
    # References
    ref_name_1 = models.CharField(max_length=100, blank=True, null=True)
    ref_relation_1 = models.CharField(max_length=50, blank=True, null=True)
    ref_mobile_1 = models.CharField(max_length=15, blank=True, null=True)
    ref_address_1 = models.TextField(blank=True, null=True)
    
    ref_name_2 = models.CharField(max_length=100, blank=True, null=True)
    ref_relation_2 = models.CharField(max_length=50, blank=True, null=True)
    ref_mobile_2 = models.CharField(max_length=15, blank=True, null=True)
    ref_address_2 = models.TextField(blank=True, null=True)
    
    # state
    branch_state = models.ForeignKey(BranchState, on_delete=models.SET_NULL, null=True, blank=True)
    # location
    branch_location = models.ForeignKey(BranchLocation, on_delete=models.SET_NULL, null=True, blank=True)
    #branch state
    branch_inner_state = models.ForeignKey('BranchInnerState', on_delete=models.SET_NULL, null=True, blank=True)
    # Branch Location
    branch_inner_location  = models.ForeignKey('BranchInnerLocation', on_delete=models.SET_NULL, null=True, blank=True)


    bank = models.ForeignKey(Bank, on_delete=models.SET_NULL, null=True, blank=True)
    type_of_account = models.ForeignKey(TypeOfAccount, on_delete=models.SET_NULL, null=True, blank=True)

    # Work icons
    work_icons = models.TextField(blank=True, null=True, default='[]')
    payout_icons = models.TextField(blank=True, null=True, default='[]')
    
    # User tracking
    createdBy = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_partner_users')
    
    # Add timestamp fields
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    class Meta:
        db_table = 'partner_users'
        ordering = ['-created_at']
        verbose_name = 'Partner User'
        verbose_name_plural = 'Partner Users'
    
    def __str__(self):
        return f"{self.email_id} ({self.first_name} {self.last_name})"
    
    def save(self, *args, **kwargs):
        """Ensure work_icons and payout_icons are stored as valid JSON strings"""
        # Handle work_icons
        if self.work_icons is None:
            self.work_icons = '[]'
        elif isinstance(self.work_icons, list):
            self.work_icons = json.dumps(self.work_icons)
        elif isinstance(self.work_icons, str):
            try:
                # Validate it's proper JSON
                json.loads(self.work_icons)
            except json.JSONDecodeError:
                # If invalid, set to empty array
                self.work_icons = '[]'
        
        # Handle payout_icons
        if self.payout_icons is None:
            self.payout_icons = '[]'
        elif isinstance(self.payout_icons, list):
            self.payout_icons = json.dumps(self.payout_icons)
        elif isinstance(self.payout_icons, str):
            try:
                # Validate it's proper JSON
                json.loads(self.payout_icons)
            except json.JSONDecodeError:
                # If invalid, set to empty array
                self.payout_icons = '[]'
        
        # Auto-generate username from email if not provided
        if not self.username and self.email_id:
            self.username = self.email_id.split('@')[0]
        
        # Hash password if it's plain text
        if self.password and len(self.password) < 128:
            from django.contrib.auth.hashers import make_password
            self.password = make_password(self.password)
        
        super().save(*args, **kwargs)
    
    def check_password(self, raw_password):
        from django.contrib.auth.hashers import check_password
        return check_password(raw_password, self.password)







#-----------------VEHICLE MASTERS-----------------

class VehicleMake(models.Model):
    vehical_make = models.CharField(max_length=100, unique=True)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.vehical_make






class VehicleModel(models.Model):
    vehicle_make = models.ForeignKey(VehicleMake, on_delete=models.CASCADE)
    vehicle_model = models.CharField(max_length=100, unique=True)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.vehicle_model



class ManufactureYear(models.Model):
    manufacture_year = models.CharField(max_length=100, unique=True)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.manufacture_year



class CompanyName(models.Model):
    company_name = models.CharField(max_length=100, unique=True)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.company_name




class CustomerType(models.Model):
    customer_type = models.CharField(max_length=100, unique=True)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.customer_type
    



class IndustryType(models.Model):
    industry_name = models.CharField(max_length=100, unique=True)
    customer_type = models.ForeignKey(CustomerType, on_delete=models.CASCADE)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.industry_name




class BusinessType(models.Model):
    business_name  = models.CharField(max_length=100, unique=True)
    customer_type = models.ForeignKey(CustomerType, on_delete=models.CASCADE)
    industry_name = models.ForeignKey(IndustryType, on_delete=models.CASCADE)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.business_name





#--------------------add insurance tables-----------------
class VehicleInsurance(models.Model):
    # Customer Info
    customer_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15)
    alternative_phone_number = models.CharField(max_length=15, blank=True, null=True)
    email_id = models.EmailField(blank=True, null=True)

    # Location Info
    state = models.ForeignKey(BranchState, on_delete=models.CASCADE)
    location = models.ForeignKey(BranchLocation, on_delete=models.CASCADE)
    sub_location = models.ForeignKey(SubLocation, on_delete=models.CASCADE)
    pincode = models.ForeignKey(Pincode, on_delete=models.CASCADE)

    # Customer Classification
    customer_type = models.ForeignKey(CustomerType, on_delete=models.CASCADE)
    industry_type = models.ForeignKey(IndustryType, on_delete=models.CASCADE)
    business_type = models.ForeignKey(BusinessType, on_delete=models.CASCADE)

    # Other Info
    birth_date = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    # Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.BooleanField(default=True)


    def __str__(self):
        return self.customer_name





class VehicleDocument(models.Model):
    # ADDED: Foreign key to VehicleInsurance
    vehicle = models.ForeignKey(
        VehicleInsurance, 
        on_delete=models.CASCADE, 
        related_name='documents',
        null=True, 
        blank=True
    )
    document_name = models.CharField(max_length=100)
    upload_file = models.FileField(upload_to='vehicle_documents/')
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.document_name
    
    class Meta:
        # Allow same document name for different insurances
        ordering = ['-created_at']



class VehicleInsuranceDetails(models.Model):
    # ADDED: Foreign key to VehicleInsurance
    vehicle = models.ForeignKey(
        VehicleInsurance, 
        on_delete=models.CASCADE, 
        related_name='vehicle_details',
        null=True, 
        blank=True
    )
    owner_name = models.CharField(max_length=255)
    vehicle_number = models.CharField(max_length=50)
    engine_number = models.CharField(max_length=100)
    chassis_number = models.CharField(max_length=100)

    # Foreign Keys (dropdowns)
    vehicle_make = models.ForeignKey(VehicleMake, on_delete=models.CASCADE)
    vehicle_model = models.ForeignKey(VehicleModel, on_delete=models.CASCADE)
    manufacture_year = models.ForeignKey(ManufactureYear, on_delete=models.CASCADE)
    ins_company_name = models.ForeignKey(CompanyName, on_delete=models.CASCADE)

    # Insurance Details
    idv_value = models.DecimalField(max_digits=12, decimal_places=2)
    ins_start_date = models.DateField()
    ins_last_date = models.DateField()
    premium = models.CharField(max_length=100)

    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



    def __str__(self):
        return f"{self.owner_name} - {self.vehicle_number}"








#-----------------HEALTH INSURANCE TABLES -----------------

class InsuranceCompany(models.Model):
    company_name = models.CharField(max_length=100, unique=True)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.company_name



class TypeOfPolicy(models.Model):
    policy_name = models.CharField(max_length=100, unique=True)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.policy_name





class HealthInsuranceAge(models.Model):
    individual_age = models.CharField(max_length=100, unique=True)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.individual_age



class NumberOfPerson(models.Model):
    no_person = models.CharField(max_length=100, unique=True)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.no_person





class HealthInsurance(models.Model):
    customer_name = models.CharField(max_length=255)
    Phone_number = models.CharField(max_length=15)
    email_id = models.EmailField(blank=True, null=True)
    customer_age  = models.PositiveIntegerField()
    

    # foreign keys
    state = models.ForeignKey(BranchState, on_delete=models.CASCADE)
    location = models.ForeignKey(BranchLocation, on_delete=models.CASCADE)
    sub_location = models.ForeignKey(SubLocation, on_delete=models.CASCADE)
    pincode = models.ForeignKey(Pincode, on_delete=models.CASCADE)
    policy_name = models.ForeignKey(TypeOfPolicy, on_delete=models.CASCADE)
    no_person = models.ForeignKey(NumberOfPerson, on_delete=models.CASCADE)
    individual_age = models.ForeignKey(HealthInsuranceAge, on_delete=models.CASCADE)


    # Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.BooleanField(default=True)


    def __str__(self):
        return self.customer_name





class HealthInsuranceDetails(models.Model):
    # ADDED: Foreign key to HealthInsurance
    health = models.ForeignKey(
        HealthInsurance, 
        on_delete=models.CASCADE, 
        related_name='health_details',
        null=True, 
        blank=True
    )
    company_name = models.ForeignKey(InsuranceCompany, on_delete=models.CASCADE)
    sum_assured = models.CharField(max_length=100, unique=True)
    policy_premium = models.CharField(max_length=100)
    ins_start_date = models.DateField()
    ins_last_date = models.DateField()

    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company_name} - {self.sum_assured}"
